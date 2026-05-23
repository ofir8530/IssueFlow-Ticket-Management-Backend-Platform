import { IsNotEmpty, IsUUID } from 'class-validator';

export class AddTicketDependencyDto {
  @IsUUID()
  @IsNotEmpty()
  blockedBy: string;
}
