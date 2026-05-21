import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export enum UserRole { ADMIN = 'ADMIN', DEVELOPER = 'DEVELOPER' }

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  fullName: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.DEVELOPER })
  role: UserRole;
}