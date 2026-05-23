import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { TokenBlacklistService } from './token-blacklist.service';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private tokenBlacklist: TokenBlacklistService,
  ) {}

  private getExpiresIn(): number {
    return Number(this.configService.get('JWT_EXPIRES_IN', 3600));
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByUsername(dto.username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const expiresIn = this.getExpiresIn();
    const jti = randomUUID();
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      jti,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload, { expiresIn }),
      tokenType: 'Bearer',
      expiresIn,
    };
  }

async logout(accessToken: string): Promise<void> {
  const decoded = this.jwtService.verify<JwtPayload>(accessToken); 
  const expiresAt = new Date(decoded.exp * 1000);
  await this.tokenBlacklist.revoke(decoded.jti, expiresAt);
  }
}