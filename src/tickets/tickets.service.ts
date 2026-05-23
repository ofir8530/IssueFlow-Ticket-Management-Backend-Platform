import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { ProjectsService } from '../projects/projects.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketsRepository: Repository<Ticket>,
    private readonly projectsService: ProjectsService,
    private readonly usersService: UsersService,
  ) {}

  async create(dto: CreateTicketDto): Promise<Ticket> {
    await this.assertProjectExists(dto.projectId);
    if (dto.assigneeId) {
      await this.assertAssigneeExists(dto.assigneeId);
    }

    const ticket = this.ticketsRepository.create({
      ...dto,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
    });
    return this.ticketsRepository.save(ticket);
  }

  async findOne(id: string): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOneBy({ id });
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }
    return ticket;
  }

  async findAll(projectId?: string) {
    const query = this.ticketsRepository.createQueryBuilder('ticket');
    
    if (projectId) {
      query.where('ticket.projectId = :projectId', { projectId });
    }
    
    return query.getMany();
  }

  async update(id: string, dto: UpdateTicketDto): Promise<Ticket> {
    const ticket = await this.findOne(id);

    if (dto.projectId) {
      await this.assertProjectExists(dto.projectId);
    }
    if (dto.assigneeId) {
      await this.assertAssigneeExists(dto.assigneeId);
    }

    Object.assign(ticket, {
      ...dto,
      ...(dto.dueDate !== undefined && {
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      }),
    });

    return this.ticketsRepository.save(ticket);
  }

  async remove(id: string): Promise<Ticket> {
    const ticket = await this.findOne(id);
    return this.ticketsRepository.softRemove(ticket);
  }

  private async assertProjectExists(projectId: string): Promise<void> {
    const exists = await this.projectsService.exists(projectId);
    if (!exists) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }
  }

  private async assertAssigneeExists(assigneeId: string): Promise<void> {
    try {
      await this.usersService.findOne(assigneeId);
    } catch {
      throw new NotFoundException(`User ${assigneeId} not found`);
    }
  }
  async findDeleted() {
    return this.ticketsRepository
      .createQueryBuilder('ticket')
      .withDeleted() 
      .where('ticket.deletedAt IS NOT NULL')
      .getMany();
  }
}