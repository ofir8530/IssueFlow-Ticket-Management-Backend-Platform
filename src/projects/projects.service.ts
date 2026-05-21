import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/UpdateProjectDto';


@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project) private repo: Repository<Project>,
  ) {}

  create(dto: CreateProjectDto) {
    return this.repo.save(this.repo.create(dto));
  }

  findAll() {
    return this.repo.find({ relations: ['owner'] });
  }

  async findOne(id: string) {
    const project = await this.repo.findOne({ where: { id }, relations: ['owner'] });
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    return project;
  }

  async update(id: string, dto: UpdateProjectDto) {
    const project = await this.findOne(id);
    return this.repo.save({ ...project, ...dto });
  }

  async remove(id: string) {
    const project = await this.findOne(id);
    return this.repo.remove(project);
  }
}