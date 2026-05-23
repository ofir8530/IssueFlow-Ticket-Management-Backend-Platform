import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import * as Joi from 'joi';
import { ProjectsModule } from './projects/projects.module';
import { TicketsModule } from './tickets/tickets.module';
import { User } from './users/entities/user.entity';
import { Project } from './projects/entities/project.entity';
import { Ticket } from './tickets/entities/ticket.entity';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { RevokedToken } from './auth/entities/revoked-token.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DB_TYPE: Joi.string().valid('mysql', 'sqlite').default('mysql'),
        DB_HOST: Joi.string().when('DB_TYPE', { is: 'mysql', then: Joi.required() }),
        DB_PORT: Joi.number().default(3306),
        DB_USER: Joi.string().when('DB_TYPE', { is: 'mysql', then: Joi.required() }),
        DB_PASS: Joi.string().when('DB_TYPE', { is: 'mysql', then: Joi.required() }),
        DB_NAME: Joi.string().when('DB_TYPE', { is: 'mysql', then: Joi.required() }),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.number().default(3600),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbType = config.get<string>('DB_TYPE');
        const entities = [User, Project, Ticket, RevokedToken];

        if (dbType === 'sqlite') {
          return {
            type: 'sqlite',
            database: 'issueflow.sqlite',
            entities: entities,
            synchronize: true,
          };
        }

        return {
          type: 'mysql',
          host: config.get<string>('DB_HOST'),
          port: config.get<number>('DB_PORT'),
          username: config.get<string>('DB_USER'),
          password: config.get<string>('DB_PASS'),
          database: config.get<string>('DB_NAME'),
          entities: entities,
          synchronize: true,
        };
      },
    }),
    UsersModule,
    ProjectsModule,
    TicketsModule,
    AuthModule,
  ],
   providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, 
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,  
    },
  ],
})
export class AppModule {}