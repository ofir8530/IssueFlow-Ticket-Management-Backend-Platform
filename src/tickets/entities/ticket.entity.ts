import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { User } from '../../users/entities/user.entity';
import { OneToMany } from 'typeorm';
import { Attachment } from '../../attachments/attachment.entity';

export enum TicketStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum TicketType {
  BUG = 'BUG',
  FEATURE = 'FEATURE',
  TASK = 'TASK',
}

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'simple-enum',
    enum: TicketStatus,
    default: TicketStatus.TODO,
  })
  status: TicketStatus;

  @Column({
    type: 'simple-enum',
    enum: TicketPriority,
    default: TicketPriority.MEDIUM,
  })
  priority: TicketPriority;

  @Column({
    type: 'simple-enum',
    enum: TicketType,
    default: TicketType.TASK,
  })
  type: TicketType;

  @Column({ type: 'datetime', nullable: true })
  dueDate: Date | null;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @Column()
  projectId: string;

  @Column({ nullable: true })
  assigneeId: string | null;

  @OneToMany(() => Attachment, (attachment) => attachment.ticket)
  attachments: Attachment[];

  @JoinColumn({ name: 'projectId' })
  project: Project;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigneeId' })
  assignee: User | null;
}