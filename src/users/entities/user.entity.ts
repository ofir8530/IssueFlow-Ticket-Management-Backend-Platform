import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';


export enum UserRole { 
  ADMIN = 'ADMIN', 
  DEVELOPER = 'DEVELOPER' 
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ select: false })
  @Exclude()
  password: string; 

  @Column({ unique: true })
  email: string;

  @Column()
  fullName: string;

  @Column({
  type: 'simple-enum',
  enum: UserRole,
  default: UserRole.DEVELOPER,
  })
  role: UserRole;
}