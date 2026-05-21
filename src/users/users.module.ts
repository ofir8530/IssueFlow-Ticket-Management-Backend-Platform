import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity'; 
import { UserExistsConstraint } from './validators/user-exists.validator';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]) 
  ],
  controllers: [UsersController],
  providers: [UserExistsConstraint], 
  exports: [UserExistsConstraint],
})
export class UsersModule {}