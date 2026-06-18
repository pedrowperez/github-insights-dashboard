import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: {
    findByEmail: jest.Mock;
    create: jest.Mock;
    findById: jest.Mock;
  };
  let jwtService: { sign: jest.Mock };

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
    service = new AuthService(
      usersService as unknown as UsersService,
      jwtService as unknown as JwtService,
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
      expect(result.user.email).toBe('pedro@email.com');
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
});
