import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/UpdateProjectDto';
import { Ticket, TicketStatus } from '../tickets/entities/ticket.entity';

export interface ProjectWorkloadRow {
  userId: string;
  username: string;
  openTicketCount: number;
}

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project) private repo: Repository<Project>,
    @InjectRepository(Ticket) private ticketsRepo: Repository<Ticket>,
  ) {}

  create(dto: CreateProjectDto) {
    return this.repo.save(this.repo.create(dto));
  }

  findAll() {
    return this.repo.find();
  }

  findDeleted() {
    return this.repo
      .createQueryBuilder('project')
      .withDeleted()
      .where('project.deletedAt IS NOT NULL')
      .getMany();
  }

  async getWorkload(projectId: string): Promise<ProjectWorkloadRow[]> {
    const projectExists = await this.exists(projectId);
    if (!projectExists) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }

    const rows = await this.ticketsRepo
      .createQueryBuilder('ticket')
      .innerJoin('users', 'user', 'user.id = ticket.assigneeId')
      .select('ticket.assigneeId', 'userId')
      .addSelect('user.username', 'username')
      .addSelect('COUNT(ticket.id)', 'openTicketCount')
      .where('ticket.projectId = :projectId', { projectId })
      .andWhere('ticket.status != :done', { done: TicketStatus.DONE })
      .andWhere('ticket.assigneeId IS NOT NULL')
      .groupBy('ticket.assigneeId')
      .addGroupBy('user.username')
      .getRawMany<{ userId: string; username: string; openTicketCount: string }>();

    return rows.map((row) => ({
      userId: row.userId,
      username: row.username,
      openTicketCount: Number(row.openTicketCount),
    }));
  }

  async findOne(id: string) {
    const project = await this.repo.findOneBy({ id });
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    return project;
  }

  async exists(id: string): Promise<boolean> {
    return this.repo.existsBy({ id });
  }

  async update(id: string, dto: UpdateProjectDto) {
    const project = await this.findOne(id);
    return this.repo.save({ ...project, ...dto });
  }

  async remove(id: string) {
    const project = await this.findOne(id);
    return this.repo.softRemove(project); 
  }

  async restore(id: string) {
    const project = await this.repo.findOne({where: { id },withDeleted: true,});
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    return await this.repo.restore(id);
  }
}