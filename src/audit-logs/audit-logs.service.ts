import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AuditAction,
  AuditActorType,
  AuditEntityType,
  AuditLog,
} from './entities/audit-log.entity';
import { AuditLogsQueryDto } from './dto/audit-logs-query.dto';

export interface AuditLogResponse {
  id: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  performedBy: string;
  actor: AuditActorType;
  timestamp: Date;
  details: Record<string, unknown> | null;
}

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogsRepository: Repository<AuditLog>,
  ) {}

  async log(
    actorId: string,
    entityType: AuditEntityType,
    entityId: string,
    action: AuditAction,
    details?: Record<string, unknown>,
  ): Promise<AuditLog> {
    const entry = this.auditLogsRepository.create({
      actorId,
      actor: AuditActorType.USER,
      entityType,
      entityId,
      action,
      details: details ?? null,
    });

    return this.auditLogsRepository.save(entry);
  }

  async findAll(filters: AuditLogsQueryDto): Promise<AuditLogResponse[]> {
    const query = this.auditLogsRepository
      .createQueryBuilder('audit')
      .orderBy('audit.createdAt', 'DESC');

    if (filters.entityType) {
      query.andWhere('audit.entityType = :entityType', {
        entityType: filters.entityType,
      });
    }

    if (filters.entityId) {
      query.andWhere('audit.entityId = :entityId', {
        entityId: filters.entityId,
      });
    }

    if (filters.action) {
      query.andWhere('audit.action = :action', { action: filters.action });
    }

    if (filters.actor) {
      query.andWhere('audit.actorId = :actorId', { actorId: filters.actor });
    }

    const logs = await query.getMany();
    return logs.map((entry) => this.toResponse(entry));
  }

  private toResponse(entry: AuditLog): AuditLogResponse {
    return {
      id: entry.id,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      performedBy: entry.actorId,
      actor: entry.actor,
      timestamp: entry.createdAt,
      details: entry.details,
    };
  }
}
