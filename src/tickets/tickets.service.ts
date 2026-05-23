import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
    private projectsService: ProjectsService,
  ) {}

  async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
    const projectExists = await this.projectsService.exists(
      createTicketDto.projectId,
    );
    if (!projectExists) {
      throw new NotFoundException(
        `Project ${createTicketDto.projectId} not found`,
      );
    }

    const ticket = this.ticketsRepository.create(createTicketDto);
    return this.ticketsRepository.save(ticket);
  }

  async findAllByProject(projectId: string): Promise<Ticket[]> {
    const projectExists = await this.projectsService.exists(projectId);
    if (!projectExists) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }

    return this.ticketsRepository.find({
      where: { projectId },
      order: { title: 'ASC' },
    });
  }
}