import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { UserExists } from '../../users/validators/user-exists.decorator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  @UserExists({ message: 'Owner does not exist' })
  name: string;

  @IsString()
  description: string;

  @IsUUID()
  @IsNotEmpty()
  ownerId: string;
}