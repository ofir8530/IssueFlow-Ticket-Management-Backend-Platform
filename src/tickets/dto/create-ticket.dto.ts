import { IsString, IsNotEmpty, IsEnum, IsUUID } from 'class-validator';
import { TicketStatus } from '../entities/ticket.entity';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  description: string;

  @IsEnum(TicketStatus)
  status: TicketStatus;

  @IsString()
  priority: string;

  @IsUUID()
  @IsNotEmpty()
  projectId: string;
}