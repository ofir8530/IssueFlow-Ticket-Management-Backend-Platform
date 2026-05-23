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
    console.log(`Checking existence for user ID: ${userId}`);
    if (!userId) return false;
    console.log('Query result:', User);
    return !!(await this.userRepository.findOneBy({ id: userId }));
  }

  defaultMessage(args: ValidationArguments) {
    return `User with ID ${args.value} does not exist.`;
  }
}