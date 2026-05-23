import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { UserExistsConstraint } from './validators/user-exists.validator';
import { CommentsModule } from '../comments/comments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => CommentsModule),
  ],
  controllers: [UsersController],
  providers: [UsersService, UserExistsConstraint],
  exports: [UsersService],
})
export class UsersModule {}