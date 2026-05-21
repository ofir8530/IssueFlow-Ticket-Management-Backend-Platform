import { IsString, IsEmail, IsEnum, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  fullName: string;

  @IsEnum(['ADMIN', 'DEVELOPER'])
  role: 'ADMIN' | 'DEVELOPER';
}