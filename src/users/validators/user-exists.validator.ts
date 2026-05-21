import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { User } from '../entities/user.entity';

@ValidatorConstraint({ name: 'UserExists', async: true })
@Injectable()
export class UserExistsConstraint implements ValidatorConstraintInterface {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async validate(userId: string) {
    if (!userId) return false;
    const user = await this.userRepository.findOneBy({ id: userId });
    return !!user; // Returns true if user exists, false otherwise
  }

  defaultMessage(args: ValidationArguments) {
    return `User with ID ${args.value} does not exist.`;
  }
}