import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: {
    findByEmail: jest.Mock;
    create: jest.Mock;
    findById: jest.Mock;
  };
  let jwtService: { sign: jest.Mock };
  let config: { get: jest.Mock };
  let refreshTokens: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  const buildUser = async (): Promise<User> => ({
    id: 'user-1',
    name: 'Pedro',
    email: 'pedro@email.com',
    passwordHash: await bcrypt.hash('senha123', 10),
    createdAt: new Date(),
  });

  beforeEach(() => {
    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('signed-token'),
    };
    config = {
      get: jest.fn().mockReturnValue('7'),
    };
    refreshTokens = {
      create: jest.fn((x) => x),
      save: jest.fn().mockResolvedValue(undefined),
      findOne: jest.fn(),
      update: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    };
    service = new AuthService(
      usersService as unknown as UsersService,
      jwtService as unknown as JwtService,
      config as unknown as ConfigService,
      refreshTokens as unknown as Repository<RefreshToken>,
    );
  });

  describe('register', () => {
    it('cria usuario e retorna token quando o e-mail e novo', async () => {
      usersService.findByEmail!.mockResolvedValue(null);
      usersService.create!.mockImplementation(async (data) => ({
        id: 'user-1',
        createdAt: new Date(),
        ...data,
      }));

      const result = await service.register({
        name: 'Pedro',
        email: 'pedro@email.com',
        password: 'senha123',
      });

      expect(result.accessToken).toBe('signed-token');
      expect(result.refreshToken).toEqual(expect.any(String));
      expect(result.user.email).toBe('pedro@email.com');
      expect(refreshTokens.save).toHaveBeenCalled();
      // a senha deve ser persistida como hash, nunca em texto puro
      const createArg = usersService.create!.mock.calls[0][0];
      expect(createArg.passwordHash).not.toBe('senha123');
      expect(await bcrypt.compare('senha123', createArg.passwordHash)).toBe(
        true,
      );
    });

    it('lanca ConflictException quando o e-mail ja existe', async () => {
      usersService.findByEmail!.mockResolvedValue(await buildUser());

      await expect(
        service.register({
          name: 'Pedro',
          email: 'pedro@email.com',
          password: 'senha123',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(usersService.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('retorna token quando as credenciais sao validas', async () => {
      usersService.findByEmail!.mockResolvedValue(await buildUser());

      const result = await service.login({
        email: 'pedro@email.com',
        password: 'senha123',
      });

      expect(result.accessToken).toBe('signed-token');
      expect(jwtService.sign).toHaveBeenCalled();
    });

    it('lanca UnauthorizedException quando o usuario nao existe', async () => {
      usersService.findByEmail!.mockResolvedValue(null);

      await expect(
        service.login({ email: 'x@email.com', password: 'senha123' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('lanca UnauthorizedException quando a senha esta incorreta', async () => {
      usersService.findByEmail!.mockResolvedValue(await buildUser());

      await expect(
        service.login({ email: 'pedro@email.com', password: 'errada' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('rotaciona o token quando valido e nao expirado', async () => {
      refreshTokens.findOne.mockResolvedValue({
        id: 't1',
        userId: 'user-1',
        tokenHash: 'hash',
        revoked: false,
        expiresAt: new Date(Date.now() + 60_000),
      });
      usersService.findById!.mockResolvedValue(await buildUser());

      const result = await service.refresh('raw-token');

      expect(result.accessToken).toBe('signed-token');
      expect(refreshTokens.save).toHaveBeenCalledWith(
        expect.objectContaining({ revoked: true }),
      );
    });

    it('lanca UnauthorizedException para token revogado', async () => {
      refreshTokens.findOne.mockResolvedValue({
        revoked: true,
        expiresAt: new Date(Date.now() + 60_000),
      });

      await expect(service.refresh('raw-token')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('lanca UnauthorizedException para token inexistente', async () => {
      refreshTokens.findOne.mockResolvedValue(null);

      await expect(service.refresh('raw-token')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('revoga o refresh token informado', async () => {
      const result = await service.logout('raw-token');

      expect(result).toEqual({ success: true });
      expect(refreshTokens.update).toHaveBeenCalledWith(
        { tokenHash: expect.any(String) },
        { revoked: true },
      );
    });
  });
});
