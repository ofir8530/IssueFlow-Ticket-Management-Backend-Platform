import { Entity, Column, PrimaryColumn, Index } from 'typeorm';

@Entity('revoked_tokens')
export class RevokedToken {
  @PrimaryColumn()
  jti: string;

  @Index()
  @Column({ type: 'datetime' })
  expiresAt: Date;
}