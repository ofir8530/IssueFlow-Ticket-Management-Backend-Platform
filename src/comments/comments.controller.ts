import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { User } from '../users/entities/user.entity';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('tickets/:ticketId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  findAll(@Param('ticketId') ticketId: string) {
    return this.commentsService.findAllByTicket(ticketId);
  }

  @Post()
  create(
    @Param('ticketId') ticketId: string,
    @Body() dto: CreateCommentDto,
    @Req() req: Request & { user: User },
  ) {
    return this.commentsService.create(ticketId, dto, req.user.id);
  }

  @Patch(':commentId')
  update(
    @Param('ticketId') ticketId: string,
    @Param('commentId') commentId: string,
    @Body() dto: UpdateCommentDto,
    @Req() req: Request & { user: User },
  ) {
    return this.commentsService.update(ticketId, commentId, dto, req.user.id);
  }

  @Delete(':commentId')
  remove(
    @Param('ticketId') ticketId: string,
    @Param('commentId') commentId: string,
    @Req() req: Request & { user: User },
  ) {
    return this.commentsService.remove(ticketId, commentId, req.user.id);
  }
}
