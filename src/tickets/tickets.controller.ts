import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  async create(@Body() createTicketDto: CreateTicketDto) {
    return await this.ticketsService.create(createTicketDto);
  }

  @Get('project/:projectId')
  async findAllByProject(@Param('projectId') projectId: string) {
    return await this.ticketsService.findAllByProject(projectId);
  }
}