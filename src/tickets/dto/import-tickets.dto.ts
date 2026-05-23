import { IsUUID, IsNotEmpty } from 'class-validator';

export class ImportTicketsQueryDto {
  @IsUUID()
  @IsNotEmpty()
  projectId: string;
}