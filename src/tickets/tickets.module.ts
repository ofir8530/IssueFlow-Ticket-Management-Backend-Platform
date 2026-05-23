import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { Ticket } from './entities/ticket.entity';
import { TicketDependency } from './entities/ticket-dependency.entity';
import { ProjectsModule } from '../projects/projects.module';
import { UsersModule } from '../users/users.module';
import { MulterModule } from '@nestjs/platform-express';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { Attachment } from '../attachments/attachment.entity';
import {AttachmentsModule} from '../attachments/attachments.module'

@Module({
  imports: [
    MulterModule.register({
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
    TypeOrmModule.forFeature([Ticket, TicketDependency]),
    forwardRef(() => ProjectsModule),
    forwardRef(() => UsersModule),
    AuditLogsModule,
    AttachmentsModule,
    Attachment,
  ],
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule {}