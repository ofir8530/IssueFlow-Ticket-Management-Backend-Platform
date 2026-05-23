import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  StreamableFile,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { FileInterceptor } from '@nestjs/platform-express';



@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  create(@Body() dto: CreateTicketDto) {
    return this.ticketsService.create(dto);
  }

  @Get('deleted')
  findDeleted() {
    return this.ticketsService.findDeleted();
  }

  @Get('export')
  async exportTickets(
    @Query('projectId') projectId: string,
  ): Promise<StreamableFile> {
    const csv = await this.ticketsService.exportToCsv(projectId);
    const buffer = Buffer.from(csv, 'utf-8');

    return new StreamableFile(buffer, {
      type: 'text/csv',
      disposition: `attachment; filename="tickets-${projectId}.csv"`,
    });
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importTickets(
    @UploadedFile() file: Express.Multer.File,
    @Body('projectId') projectId: string,
  ): Promise<{ created: number; failed: number; errors: string[] }> {
    if (!file) {
      throw new BadRequestException('CSV file is required');
    }

    return this.ticketsService.importFromCsv(projectId, file.buffer);
  }

  @Get()
  findAll(@Query('projectId') projectId?: string) {
    return this.ticketsService.findAll(projectId);
  }

  @Get(':ticketId')
  findOne(@Param('ticketId') ticketId: string) {
    return this.ticketsService.findOne(ticketId);
  }

  @Patch(':ticketId')
  update(
    @Param('ticketId') ticketId: string,
    @Body() dto: UpdateTicketDto,
  ) {
    return this.ticketsService.update(ticketId, dto);
  }

  @Delete(':ticketId')
  remove(@Param('ticketId') ticketId: string) {
    return this.ticketsService.remove(ticketId);
  }
}