import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  ManyToOne 
} from 'typeorm';
import { Ticket } from '../tickets/entities/ticket.entity';

@Entity()
export class Attachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filename: string; 

  @Column()
  path: string; 

  @Column()
  mimetype: string; 

  @Column('bigint')
  size: number; 

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Ticket, (ticket) => ticket.attachments)
  ticket: Ticket;
}