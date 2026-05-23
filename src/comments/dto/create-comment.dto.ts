import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { UserExists } from '../../users/validators/user-exists.decorator';

export class CreateCommentDto {
  @IsUUID()
  @IsNotEmpty()
  @UserExists({ message: 'Author does not exist' })
  authorId: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
