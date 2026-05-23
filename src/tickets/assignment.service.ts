import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { Ticket,TicketStatus } from './entities/ticket.entity';

@Injectable()
export class AssignmentService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Ticket) private ticketRepo: Repository<Ticket>,
  ) {}

  async autoAssign(ticket: Ticket): Promise<string> {
    const devs = await this.userRepo.find({ where: { role: UserRole.DEVELOPER } });
    
    const counts = await Promise.all(
      devs.map(async (dev) => {
        const count = await this.ticketRepo.count({
          where: { assignee: { id: dev.id }, status: TicketStatus.TODO } 
        });
        return { userId: dev.id, count };
      })
    );

    const bestDev = counts.reduce((prev, curr) => (prev.count < curr.count ? prev : curr));
    return bestDev.userId;
  }
}