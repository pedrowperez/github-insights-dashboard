import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { createHash, randomBytes } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokens: Repository<RefreshToken>,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Ja existe um usuario com este e-mail.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
    });

    return this.issueTokens(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciais invalidas.');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Credenciais invalidas.');
    }

    return this.issueTokens(user);
  }

  async refresh(rawToken: string): Promise<AuthResponse> {
    const tokenHash = this.hash(rawToken);
    const stored = await this.refreshTokens.findOne({ where: { tokenHash } });

    if (!stored || stored.revoked || stored.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Refresh token invalido ou expirado.');
    }

    const user = await this.usersService.findById(stored.userId);
    if (!user) {
      throw new UnauthorizedException('Usuario nao encontrado.');
    }

    // Rotacao: o token usado e revogado e um novo par e emitido.
    stored.revoked = true;
    await this.refreshTokens.save(stored);

    return this.issueTokens(user);
  }

  async logout(rawToken: string): Promise<{ success: boolean }> {
    const tokenHash = this.hash(rawToken);
    await this.refreshTokens.update({ tokenHash }, { revoked: true });
    return { success: true };
  }

  private async issueTokens(user: User): Promise<AuthResponse> {
    const accessToken = this.jwtService.sign({ sub: user.id, email: user.email });
    const refreshToken = await this.createRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email },
    };
  }

  private async createRefreshToken(userId: string): Promise<string> {
    const raw = randomBytes(48).toString('hex');
    const days = Number(this.config.get<string>('REFRESH_EXPIRES_DAYS', '7'));
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    await this.refreshTokens.save(
      this.refreshTokens.create({
        userId,
        tokenHash: this.hash(raw),
        expiresAt,
        revoked: false,
      }),
    );

    // limpeza oportunista de tokens expirados
    await this.refreshTokens.delete({ expiresAt: LessThan(new Date()) });

    return raw;
  }

  private hash(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }
}
