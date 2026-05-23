// src/users/users.controller.ts
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from '../auth/decorators/public.decorator';
import { CommentsService } from '../comments/comments.service';
import { MentionsQueryDto } from '../comments/dto/mentions-query.dto';


@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly commentsService: CommentsService,
  ) {}
  
  @Public()
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':userId/mentions')
  findMentions(
    @Param('userId') userId: string,
    @Query() query: MentionsQueryDto,
  ) {
    return this.commentsService.findMentionsForUser(
      userId,
      query.page,
      query.pageSize,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id); 
  }

  @Post('update/:userId')
  update(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(userId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
     return this.usersService.remove(id); 
    }
}
