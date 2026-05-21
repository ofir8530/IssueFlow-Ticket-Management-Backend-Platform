import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { TicketsModule } from './tickets/tickets.module';
import { User } from './users/entities/user.entity';
import { Project } from './projects/entities/project.entity';
import { Ticket } from './tickets/entities/ticket.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',      
      port: 3306,             
      username: 'root',       
      password: 'password',   
      database: 'issueflow',  
      entities: [User, Project, Ticket],
      synchronize: true,      
    }),

    UsersModule,
    ProjectsModule,
    TicketsModule,
  ],
})
export class AppModule {}