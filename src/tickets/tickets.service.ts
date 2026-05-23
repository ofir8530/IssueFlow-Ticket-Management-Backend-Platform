import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { ProjectsService } from '../projects/projects.service';
import { UsersService } from '../users/users.service';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import {
  Ticket,
  TicketPriority,
  TicketStatus,
  TicketType,
} from './entities/ticket.entity';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import {
  AuditAction,
  AuditEntityType,
} from '../audit-logs/entities/audit-log.entity';
import { TicketDependency } from './entities/ticket-dependency.entity';

export interface TicketDependencySummary {
  id: string;
  title: string;
  status: TicketStatus;
}

export interface TicketImportResult {
  created: number;
  failed: number;
  errors: string[];
}

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketsRepository: Repository<Ticket>,
    @InjectRepository(TicketDependency)
    private readonly ticketDependenciesRepository: Repository<TicketDependency>,
    private readonly projectsService: ProjectsService,
    private readonly usersService: UsersService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async create(dto: CreateTicketDto, actorId?: string): Promise<Ticket> {
    
    await this.assertProjectExists(dto.projectId);
    if (dto.assigneeId) {
      await this.assertAssigneeExists(dto.assigneeId);
    }

    const ticket = this.ticketsRepository.create({
      ...dto,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
    });
    const saved = await this.ticketsRepository.save(ticket);

    if (actorId) {
      await this.auditLogsService.log(
        actorId,
        AuditEntityType.TICKET,
        saved.id,
        AuditAction.CREATE,
        { after: this.snapshotTicket(saved) },
      );
    }

    return saved;
  }

  async findOne(id: string): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOneBy({ id });
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }
    return ticket;
  }

  async findAll(projectId?: string) {
    const query = this.ticketsRepository.createQueryBuilder('ticket');
    
    if (projectId) {
      query.where('ticket.projectId = :projectId', { projectId });
    }
    
    return query.getMany();
  }

  async update(
    id: string,
    dto: UpdateTicketDto,
    actorId?: string,
  ): Promise<Ticket> {
    const ticket = await this.findOne(id);
    const before = this.snapshotTicket(ticket);

    if (dto.projectId) {
      await this.assertProjectExists(dto.projectId);
    }
    if (dto.assigneeId) {
      await this.assertAssigneeExists(dto.assigneeId);
    }

    Object.assign(ticket, {
      ...dto,
      ...(dto.dueDate !== undefined && {
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      }),
    });

    const saved = await this.ticketsRepository.save(ticket);

    if (actorId) {
      await this.auditLogsService.log(
        actorId,
        AuditEntityType.TICKET,
        saved.id,
        AuditAction.UPDATE,
        { before, after: this.snapshotTicket(saved) },
      );
    }

    return saved;
  }

  async remove(id: string, actorId?: string): Promise<Ticket> {
    const ticket = await this.findOne(id);
    const before = this.snapshotTicket(ticket);
    const removed = await this.ticketsRepository.softRemove(ticket);

    if (actorId) {
      await this.auditLogsService.log(
        actorId,
        AuditEntityType.TICKET,
        removed.id,
        AuditAction.DELETE,
        { before },
      );
    }

    return removed;
  }

  private async assertProjectExists(projectId: string): Promise<void> {
    const exists = await this.projectsService.exists(projectId);
    if (!exists) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }
  }

  private async assertAssigneeExists(assigneeId: string): Promise<void> {
    try {
      await this.usersService.findOne(assigneeId);
    } catch {
      throw new NotFoundException(`User ${assigneeId} not found`);
    }
  }
  async findDeleted() {
    return this.ticketsRepository
      .createQueryBuilder('ticket')
      .withDeleted() 
      .where('ticket.deletedAt IS NOT NULL')
      .getMany();
  }
  async exportToCsv(projectId: string): Promise<string> {
    if (!projectId) {
      throw new BadRequestException('projectId query parameter is required');
    }
    await this.assertProjectExists(projectId);
    const tickets = await this.ticketsRepository.find({
      where: { projectId },
      order: { title: 'ASC' },
    });
    return stringify(
      tickets.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        type: t.type,
        assigneeId: t.assigneeId ?? '',
      })),
      {
        header: true,
        columns: [
          'id',
          'title',
          'description',
          'status',
          'priority',
          'type',
          'assigneeId',
        ],
      },
    );
  }
  async importFromCsv(
    projectId: string,
    fileBuffer: Buffer,
    actorId?: string,
  ): Promise<TicketImportResult> {
    if (!projectId) {
      throw new BadRequestException('projectId form field is required');
    }
    if (!fileBuffer?.length) {
      throw new BadRequestException('CSV file is required');
    }
    await this.assertProjectExists(projectId);
    let rows: Record<string, string>[];
    try {
      rows = parse(fileBuffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      }) as Record<string, string>[];
    } catch {
      throw new BadRequestException('Invalid CSV format');
    }
    const result: TicketImportResult = { created: 0, failed: 0, errors: [] };
    for (let i = 0; i < rows.length; i++) {
      const rowNumber = i + 2; // row 1 = header
      const row = rows[i];
      const dto = plainToInstance(CreateTicketDto, {
        title: row.title,
        description: row.description,
        status: row.status as TicketStatus,
        priority: row.priority as TicketPriority,
        type: row.type as TicketType,
        projectId, // from form, not CSV (README)
        assigneeId: row.assigneeId || undefined,
        dueDate: row.dueDate || undefined,
      });
      const validationErrors = await validate(dto);
      if (validationErrors.length > 0) {
        result.failed++;
        result.errors.push(
          `Row ${rowNumber}: ${this.formatValidationErrors(validationErrors)}`,
        );
        continue;
      }
      try {
        await this.create(dto, actorId);
        result.created++;
      } catch (err) {
        result.failed++;
        result.errors.push(
          `Row ${rowNumber}: ${err instanceof Error ? err.message : 'Import failed'}`,
        );
      }
    }
    return result;
  }
  async addDependency(
    ticketId: string,
    blockedBy: string,
  ): Promise<TicketDependency> {
    const blockerId = blockedBy;
    await this.findOne(ticketId);
    await this.findOne(blockerId);

    if (ticketId === blockerId) {
      throw new BadRequestException('A ticket cannot block itself');
    }

    const existing = await this.ticketDependenciesRepository.findOne({
      where: { ticketId, blockerId },
    });
    if (existing) {
      throw new ConflictException('Dependency already exists');
    }

    if (await this.wouldCreateCycle(ticketId, blockerId)) {
      throw new BadRequestException('Circular dependency detected');
    }

    const dependency = this.ticketDependenciesRepository.create({
      ticketId,
      blockerId,
    });

    return this.ticketDependenciesRepository.save(dependency);
  }

  async listDependencies(
    ticketId: string,
  ): Promise<TicketDependencySummary[]> {
    await this.findOne(ticketId);

    const dependencies = await this.ticketDependenciesRepository
      .createQueryBuilder('dependency')
      .leftJoinAndSelect('dependency.blocker', 'blocker')
      .where('dependency.ticketId = :ticketId', { ticketId })
      .orderBy('blocker.title', 'ASC')
      .getMany();

    return dependencies.map((dependency) => ({
      id: dependency.blocker.id,
      title: dependency.blocker.title,
      status: dependency.blocker.status,
    }));
  }

  async removeDependency(ticketId: string, blockerId: string): Promise<void> {
    await this.findOne(ticketId);
    await this.findOne(blockerId);

    const dependency = await this.ticketDependenciesRepository.findOne({
      where: { ticketId, blockerId },
    });

    if (!dependency) {
      throw new NotFoundException(
        `Dependency on blocker ${blockerId} not found for ticket ${ticketId}`,
      );
    }

    await this.ticketDependenciesRepository.remove(dependency);
  }

  private async wouldCreateCycle(
    ticketId: string,
    blockerId: string,
  ): Promise<boolean> {
    return this.isBlockedBy(blockerId, ticketId);
  }

  private async isBlockedBy(
    ticketId: string,
    blockerId: string,
    visited = new Set<string>(),
  ): Promise<boolean> {
    if (ticketId === blockerId) {
      return true;
    }

    if (visited.has(ticketId)) {
      return false;
    }
    visited.add(ticketId);

    const dependencies = await this.ticketDependenciesRepository.find({
      where: { ticketId },
    });

    for (const dependency of dependencies) {
      if (dependency.blockerId === blockerId) {
        return true;
      }
      const nested = await this.isBlockedBy(
        dependency.blockerId,
        blockerId,
        visited,
      );
      if (nested) {
        return true;
      }
    }

    return false;
  }

  private formatValidationErrors(errors: import('class-validator').ValidationError[]): string {
    return errors
      .flatMap((e) => Object.values(e.constraints ?? {}))
      .join('; ');
  }

  private snapshotTicket(ticket: Ticket): Record<string, unknown> {
    return {
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      type: ticket.type,
      projectId: ticket.projectId,
      assigneeId: ticket.assigneeId,
      dueDate: ticket.dueDate,
      deletedAt: ticket.deletedAt,
    };
  }
}