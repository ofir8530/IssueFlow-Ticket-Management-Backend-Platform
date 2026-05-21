import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  create(dto: CreateUserDto) { return this.repo.save(this.repo.create(dto)); }
  findAll() { return this.repo.find(); }
  
  async findOne(id: string) {
    const user = await this.repo.findOneBy({ id });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findOne(id);
    return this.repo.save({ ...user, ...dto });
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    return this.repo.remove(user);
  }
}