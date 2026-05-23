import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { TicketsService } from '../tickets/tickets.service';
import { UsersService } from '../users/users.service';
import { extractMentions } from './utils/parse-mentions.helper';
import { User } from '../users/entities/user.entity';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import {
  AuditAction,
  AuditEntityType,
} from '../audit-logs/entities/audit-log.entity';

export interface CommentResponse {
  id: string;
  ticketId: string;
  authorId: string;
  content: string;
  mentionedUsers: Pick<User, 'id' | 'username' | 'fullName'>[];
}

export interface PaginatedMentionsResponse {
  data: CommentResponse[];
  total: number;
  page: number;
}

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    private readonly ticketsService: TicketsService,
    private readonly usersService: UsersService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async findAllByTicket(ticketId: string): Promise<CommentResponse[]> {
    await this.assertTicketExists(ticketId);

    const comments = await this.commentsRepository.find({
      where: { ticketId },
      relations: ['mentionedUsers'],
      order: { id: 'ASC' },
    });

    return comments.map((comment) => this.toResponse(comment));
  }

  async create(
    ticketId: string,
    dto: CreateCommentDto,
    actorId?: string,
  ): Promise<CommentResponse> {
    await this.assertTicketExists(ticketId);

    const mentionedUsers = await this.resolveMentionedUsers(dto.content);

    const comment = this.commentsRepository.create({
      ticketId,
      authorId: dto.authorId,
      content: dto.content,
      mentionedUsers,
    });

    const saved = await this.commentsRepository.save(comment);
    const loaded = await this.loadCommentWithMentions(saved.id);

    const auditActorId = actorId ?? dto.authorId;
    await this.auditLogsService.log(
      auditActorId,
      AuditEntityType.COMMENT,
      loaded.id,
      AuditAction.CREATE,
      { after: this.snapshotComment(loaded) },
    );

    return this.toResponse(loaded);
  }

  async update(
    ticketId: string,
    commentId: string,
    dto: UpdateCommentDto,
    actorId?: string,
  ): Promise<CommentResponse> {
    await this.assertTicketExists(ticketId);

    const comment = await this.findCommentForTicket(ticketId, commentId);
    const before = this.snapshotComment(comment);
    const mentionedUsers = await this.resolveMentionedUsers(dto.content);

    comment.content = dto.content;
    comment.mentionedUsers = mentionedUsers;

    await this.commentsRepository.save(comment);
    const loaded = await this.loadCommentWithMentions(comment.id);

    if (actorId) {
      await this.auditLogsService.log(
        actorId,
        AuditEntityType.COMMENT,
        loaded.id,
        AuditAction.UPDATE,
        { before, after: this.snapshotComment(loaded) },
      );
    }

    return this.toResponse(loaded);
  }

  async remove(
    ticketId: string,
    commentId: string,
    actorId?: string,
  ): Promise<void> {
    await this.assertTicketExists(ticketId);
    const comment = await this.findCommentForTicket(ticketId, commentId);
    const before = this.snapshotComment(comment);
    await this.commentsRepository.remove(comment);

    if (actorId) {
      await this.auditLogsService.log(
        actorId,
        AuditEntityType.COMMENT,
        comment.id,
        AuditAction.DELETE,
        { before },
      );
    }
  }

  async findMentionsForUser(
    userId: string,
    page = 1,
    pageSize = 10,
  ): Promise<PaginatedMentionsResponse> {
    await this.usersService.findOne(userId);

    const safePage = Math.max(1, page);
    const safePageSize = Math.max(1, pageSize);
    const skip = (safePage - 1) * safePageSize;

    const baseQuery = () =>
      this.commentsRepository
        .createQueryBuilder('comment')
        .innerJoin(
          'comment.mentionedUsers',
          'mentionedUser',
          'mentionedUser.id = :userId',
          { userId },
        );

    const total = await baseQuery().getCount();

    const comments = await baseQuery()
      .leftJoinAndSelect('comment.mentionedUsers', 'mentionedUsers')
      .leftJoinAndSelect('comment.ticket', 'ticket')
      .orderBy('comment.id', 'DESC')
      .skip(skip)
      .take(safePageSize)
      .getMany();

    return {
      data: comments.map((comment) => this.toResponse(comment)),
      total,
      page: safePage,
    };
  }

  /** Parse @username tokens from comment text. */
  private extractMentionsFromContent(content: string): string[] {
    return extractMentions(content);
  }

  /**
   * Resolve usernames to User entities and fail if any mention is invalid.
   */
  private async resolveMentionedUsers(content: string): Promise<User[]> {
    const usernames = this.extractMentionsFromContent(content);

    if (usernames.length === 0) {
      return [];
    }

    const users = await this.usersService.findByUsernames(usernames);
    const found = new Set(users.map((user) => user.username));
    const missing = usernames.filter((username) => !found.has(username));

    if (missing.length > 0) {
      throw new BadRequestException(
        `Unknown mentioned users: ${missing.join(', ')}`,
      );
    }

    return users;
  }

  private async assertTicketExists(ticketId: string): Promise<void> {
    await this.ticketsService.findOne(ticketId);
  }

  private async findCommentForTicket(
    ticketId: string,
    commentId: string,
  ): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId, ticketId },
      relations: ['mentionedUsers'],
    });

    if (!comment) {
      throw new NotFoundException(
        `Comment ${commentId} not found on ticket ${ticketId}`,
      );
    }

    return comment;
  }

  private async loadCommentWithMentions(commentId: string): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId },
      relations: ['mentionedUsers'],
    });

    if (!comment) {
      throw new NotFoundException(`Comment ${commentId} not found`);
    }

    return comment;
  }

  private toResponse(comment: Comment): CommentResponse {
    return {
      id: comment.id,
      ticketId: comment.ticketId,
      authorId: comment.authorId,
      content: comment.content,
      mentionedUsers: (comment.mentionedUsers ?? []).map((user) => ({
        id: user.id,
        username: user.username,
        fullName: user.fullName,
      })),
    };
  }

  private snapshotComment(comment: Comment): Record<string, unknown> {
    return {
      id: comment.id,
      ticketId: comment.ticketId,
      authorId: comment.authorId,
      content: comment.content,
      mentionedUserIds: (comment.mentionedUsers ?? []).map((user) => user.id),
    };
  }
}
