import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { RevokedToken } from './entities/revoked-token.entity';

@Injectable()
export class TokenBlacklistService {
  constructor(
    @InjectRepository(RevokedToken)
    private readonly repo: Repository<RevokedToken>,
  ) {}

  async revoke(jti: string, expiresAt: Date): Promise<void> {
    await this.repo.save({ jti, expiresAt });
  }

  async isRevoked(jti: string): Promise<boolean> {
    const row = await this.repo.findOne({
      where: { jti, expiresAt: MoreThan(new Date()) },
    });
    return !!row;
  }
}