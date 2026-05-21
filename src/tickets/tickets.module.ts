import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { Ticket } from './entities/ticket.entity'; // Import the entity

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket]), // Add this line
  ],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}