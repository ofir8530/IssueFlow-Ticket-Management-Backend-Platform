import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Ticket } from './ticket.entity';

@Entity('ticket_dependencies')
@Unique(['ticketId', 'blockerId'])
export class TicketDependency {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Ticket that is blocked. */
  @Column()
  ticketId: string;

  /** Ticket that blocks `ticketId`. */
  @Column()
  blockerId: string;

  @ManyToOne(() => Ticket, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticketId' })
  ticket: Ticket;

  @ManyToOne(() => Ticket, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blockerId' })
  blocker: Ticket;
}
