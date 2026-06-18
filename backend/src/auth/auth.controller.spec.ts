import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  const authService = {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = moduleRef.get(AuthController);
    jest.clearAllMocks();
  });

  it('delega o registro para o AuthService', async () => {
    const dto = { name: 'Pedro', email: 'p@e.com', password: 'senha123' };
    authService.register.mockResolvedValue({ accessToken: 't' });

    await controller.register(dto);

    expect(authService.register).toHaveBeenCalledWith(dto);
  });

  it('delega o login para o AuthService', async () => {
    const dto = { email: 'p@e.com', password: 'senha123' };
    authService.login.mockResolvedValue({ accessToken: 't' });

    await controller.login(dto);

    expect(authService.login).toHaveBeenCalledWith(dto);
  });

  it('delega o refresh para o AuthService', async () => {
    authService.refresh.mockResolvedValue({ accessToken: 't' });
    await controller.refresh({ refreshToken: 'abc' });
    expect(authService.refresh).toHaveBeenCalledWith('abc');
  });

  it('delega o logout para o AuthService', async () => {
    authService.logout.mockResolvedValue({ success: true });
    await controller.logout({ refreshToken: 'abc' });
    expect(authService.logout).toHaveBeenCalledWith('abc');
  });

  it('retorna o usuario autenticado em /me', () => {
    const user = { id: '1', name: 'Pedro', email: 'p@e.com' };
    expect(controller.me(user)).toBe(user);
  });
});
