import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  description: string;

  @IsUUID()
  @IsNotEmpty()
  ownerId: string;
}