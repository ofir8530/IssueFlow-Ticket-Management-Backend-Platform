// src/users/users.controller.ts
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
   findOne(@Param('id') id: string) {
     return this.usersService.findOne(id); 
    }

  @Patch(':id') 
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
     return this.usersService.update(id, dto); 
    }

  @Delete(':id')
  remove(@Param('id') id: string) {
     return this.usersService.remove(id); 
    }
}
