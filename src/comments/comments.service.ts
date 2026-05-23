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

export interface CommentResponse {
  id: string;
  ticketId: string;
  authorId: string;
  content: string;
  mentionedUsers: Pick<User, 'id' | 'username' | 'fullName'>[];
}

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    private readonly ticketsService: TicketsService,
    private readonly usersService: UsersService,
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
    return this.toResponse(await this.loadCommentWithMentions(saved.id));
  }

  async update(
    ticketId: string,
    commentId: string,
    dto: UpdateCommentDto,
  ): Promise<CommentResponse> {
    await this.assertTicketExists(ticketId);

    const comment = await this.findCommentForTicket(ticketId, commentId);
    const mentionedUsers = await this.resolveMentionedUsers(dto.content);

    comment.content = dto.content;
    comment.mentionedUsers = mentionedUsers;

    await this.commentsRepository.save(comment);
    return this.toResponse(await this.loadCommentWithMentions(comment.id));
  }

  async remove(ticketId: string, commentId: string): Promise<void> {
    await this.assertTicketExists(ticketId);
    const comment = await this.findCommentForTicket(ticketId, commentId);
    await this.commentsRepository.remove(comment);
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
}
