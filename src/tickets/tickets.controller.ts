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
  Req,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { User } from '../users/entities/user.entity';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AddTicketDependencyDto } from './dto/add-ticket-dependency.dto';
import { diskStorage } from 'multer';
import { AttachmentsService } from '../attachments/attachments.service';

@Controller('tickets')
@UseInterceptors(ClassSerializerInterceptor)
export class TicketsController {
  constructor(
    private readonly ticketsService: TicketsService,
    private readonly attachmentsService: AttachmentsService,
  ) {}

  // --- CRUD Operations ---

  @Post()
  create(@Body() dto: CreateTicketDto, @Req() req: Request & { user: User }) {
    return this.ticketsService.create(dto, req.user.id);
  }

  @Get()
  findAll(@Query('projectId') projectId?: string) {
    return this.ticketsService.findAll(projectId);
  }

  @Get('deleted')
  findDeleted() {
    return this.ticketsService.findDeleted();
  }

  @Get(':ticketId')
  findOne(@Param('ticketId') ticketId: string) {
    return this.ticketsService.findOne(ticketId);
  }

  @Patch(':ticketId')
  update(
    @Param('ticketId') ticketId: string,
    @Body() dto: UpdateTicketDto,
    @Req() req: Request & { user: User },
  ) {
    return this.ticketsService.update(ticketId, dto, req.user.id);
  }

  @Delete(':ticketId')
  remove(@Param('ticketId') ticketId: string, @Req() req: Request & { user: User }) {
    return this.ticketsService.remove(ticketId, req.user.id);
  }

  // --- Export/Import ---

  @Get('export')
  async exportTickets(@Query('projectId') projectId: string): Promise<StreamableFile> {
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
    @Req() req: Request & { user: User },
  ) {
    if (!file) throw new BadRequestException('CSV file is required');
    return this.ticketsService.importFromCsv(projectId, file.buffer, req.user.id);
  }

  // --- Dependencies ---

  @Post(':ticketId/dependencies')
  addDependency(@Param('ticketId') ticketId: string, @Body() dto: AddTicketDependencyDto) {
    return this.ticketsService.addDependency(ticketId, dto.blockedBy);
  }

  @Get(':ticketId/dependencies')
  listDependencies(@Param('ticketId') ticketId: string) {
    return this.ticketsService.listDependencies(ticketId);
  }

  @Delete(':ticketId/dependencies/:blockerId')
  removeDependency(@Param('ticketId') ticketId: string, @Param('blockerId') blockerId: string) {
    return this.ticketsService.removeDependency(ticketId, blockerId);
  }

  // --- Attachments ---

  @Post(':ticketId/attachments')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
      }),
    }),
  )
  async uploadAttachment(
    @Param('ticketId') ticketId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|pdf)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.attachmentsService.addAttachment(ticketId, file);
  }

  @Get(':ticketId/attachments')
  async getAttachments(@Param('ticketId') ticketId: string) {
    return this.attachmentsService.getAttachments(ticketId);
  }

  @Delete(':ticketId/attachments/:attachmentId')
  async deleteAttachment(@Param('attachmentId') attachmentId: string) {
    return this.attachmentsService.deleteAttachment(attachmentId);
  }
}