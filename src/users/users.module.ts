import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity'; // ודאי שהייבוא נכון

@Module({
  imports: [
    TypeOrmModule.forFeature([User]) // <-- זו השורה שצריך להוסיף
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}