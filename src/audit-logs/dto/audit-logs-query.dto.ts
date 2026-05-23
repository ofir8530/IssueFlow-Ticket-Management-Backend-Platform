import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import {
  AuditAction,
  AuditEntityType,
} from '../entities/audit-log.entity';

export class AuditLogsQueryDto {
  @IsOptional()
  @IsEnum(AuditEntityType)
  entityType?: AuditEntityType;

  @IsOptional()
  @IsUUID()
  entityId?: string;

  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  /** README query param name; maps to actorId in the database. */
  @IsOptional()
  @IsUUID()
  actor?: string;
}
