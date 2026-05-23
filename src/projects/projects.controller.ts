import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { UpdateProjectDto } from './dto/UpdateProjectDto';
import { CreateProjectDto } from './dto/create-project.dto';
import { Roles } from '../auth/decorators/roles.decorator'; 
import { UserRole } from '../users/entities/user.entity';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly service: ProjectsService) {}

  @Post() create(@Body() dto: CreateProjectDto) { return this.service.create(dto); }
  @Get() findAll() { return this.service.findAll(); }

  @Get('deleted')
  findDeleted() {
    return this.service.findDeleted();
  }

  @Get(':projectId/workload')
  getWorkload(@Param('projectId') projectId: string) {
    return this.service.getWorkload(projectId);
  }

  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateProjectDto) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }

  @Post(':id/restore')
  @Roles(UserRole.ADMIN)
  restore(@Param('id') id: string) {
    return this.service.restore(id);
  }
}