import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenBlacklistService } from '../auth/token-blacklist.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      AuthService,
      { provide: UsersService, useValue: { findOne: jest.fn() } },
      { provide: JwtService, useValue: { sign: jest.fn() } },   
      { provide: ConfigService, useValue: { get: jest.fn() } },  
      { provide: TokenBlacklistService, useValue: { isBlacklisted: jest.fn() } } 
    ],
  }).compile();

  service = module.get<AuthService>(AuthService);
});

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
