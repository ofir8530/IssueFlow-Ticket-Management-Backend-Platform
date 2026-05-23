import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export enum AuditEntityType {
  TICKET = 'TICKET',
  COMMENT = 'COMMENT',
}

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export enum AuditActorType {
  USER = 'USER',
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  actorId: string;

  @Column({
    type: 'simple-enum',
    enum: AuditActorType,
    default: AuditActorType.USER,
  })
  actor: AuditActorType;

  @Column({
    type: 'simple-enum',
    enum: AuditEntityType,
  })
  entityType: AuditEntityType;

  @Column()
  entityId: string;

  @Column({
    type: 'simple-enum',
    enum: AuditAction,
  })
  action: AuditAction;

  @Column({ type: 'simple-json', nullable: true })
  details: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt: Date;
}
