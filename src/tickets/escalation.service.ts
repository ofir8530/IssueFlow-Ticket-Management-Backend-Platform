import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Not, Repository } from 'typeorm';
import { Ticket, TicketPriority } from './entities/ticket.entity';

@Injectable()
export class EscalationService {
  private readonly logger = new Logger(EscalationService.name);

  constructor(@InjectRepository(Ticket) private ticketRepo: Repository<Ticket>) {}

  // CronExpression.EVERY_DAY_AT_MIDNIGHT or '*/10 * * * * *' for testing
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleEscalation() {
    this.logger.log('Running auto-escalation task...');
    
    const overdueTickets = await this.ticketRepo.find({
      where: {
        dueDate: LessThan(new Date()),
        priority: Not(TicketPriority.HIGH),
      },
    });

    for (const ticket of overdueTickets) {
      ticket.priority = TicketPriority.HIGH;
      await this.ticketRepo.save(ticket);
      this.logger.log(`Escalated ticket ${ticket.id} to HIGH`);
    }
  }
}