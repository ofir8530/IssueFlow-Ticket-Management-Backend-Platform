import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsUUID,
  IsOptional,
  IsDateString,
} from 'class-validator';
import {
  TicketStatus,
  TicketPriority,
  TicketType,
} from '../entities/ticket.entity';
import { UserExists } from '../../users/validators/user-exists.decorator';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(TicketStatus)
  status: TicketStatus;

  @IsEnum(TicketPriority)
  priority: TicketPriority;

  @IsEnum(TicketType)
  type: TicketType;

  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @IsOptional()
  @IsUUID()
  @UserExists({ message: 'Assignee does not exist' })
  assigneeId?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}