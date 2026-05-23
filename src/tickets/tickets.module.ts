import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { Ticket } from './entities/ticket.entity';
import { ProjectsModule } from '../projects/projects.module';
import { UsersModule } from '../users/users.module';
import { MulterModule } from '@nestjs/platform-express';


@Module({
  imports: [
      MulterModule.register({
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
    TypeOrmModule.forFeature([Ticket]),
    ProjectsModule,
    UsersModule,
  ],
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule {}