import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { CacheModule } from '@nestjs/cache-manager';
import { HttpService } from '@nestjs/axios';
import { getRepositoryToken } from '@nestjs/typeorm';
import { of } from 'rxjs';
import request from 'supertest';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { JwtStrategy } from '../src/auth/jwt.strategy';
import { GithubController } from '../src/github/github.controller';
import { GithubService } from '../src/github/github.service';
import { UsersService } from '../src/users/users.service';
import { User } from '../src/users/entities/user.entity';
import { RefreshToken } from '../src/auth/entities/refresh-token.entity';
import { randomUUID } from 'crypto';

// Fakes em memoria (o ambiente nao compila drivers nativos de SQLite).
// O objetivo deste e2e e exercitar todo o pipeline HTTP: validacao,
// guard JWT, rotas, status codes e o fluxo de refresh/logout.
class InMemoryUsersService {
  private users: User[] = [];
  findByEmail(email: string) {
    return Promise.resolve(this.users.find((u) => u.email === email) ?? null);
  }
  findById(id: string) {
    return Promise.resolve(this.users.find((u) => u.id === id) ?? null);
  }
  create(data: { name: string; email: string; passwordHash: string }) {
    const user: User = { id: randomUUID(), createdAt: new Date(), ...data };
    this.users.push(user);
    return Promise.resolve(user);
  }
}

class InMemoryRefreshRepo {
  private rows: RefreshToken[] = [];
  create(data: Partial<RefreshToken>) {
    return data as RefreshToken;
  }
  save(row: RefreshToken) {
    const existing = this.rows.find((r) => r.tokenHash === row.tokenHash);
    if (existing) Object.assign(existing, row);
    else this.rows.push({ ...row, id: row.id ?? randomUUID() });
    return Promise.resolve(row);
  }
  findOne({ where }: { where: { tokenHash: string } }) {
    return Promise.resolve(
      this.rows.find((r) => r.tokenHash === where.tokenHash) ?? null,
    );
  }
  update({ tokenHash }: { tokenHash: string }, patch: Partial<RefreshToken>) {
    const row = this.rows.find((r) => r.tokenHash === tokenHash);
    if (row) Object.assign(row, patch);
    return Promise.resolve({ affected: row ? 1 : 0 });
  }
  delete() {
    return Promise.resolve({ affected: 0 });
  }
}

describe('Auth + Github (e2e)', () => {
  let app: INestApplication;

  const httpMock = {
    get: jest.fn().mockReturnValue(
      of({
        data: {
          total_count: 1,
          items: [
            {
              id: 1,
              login: 'torvalds',
              avatar_url: 'a',
              html_url: 'h',
              type: 'User',
            },
          ],
        },
      }),
    ),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [
            () => ({
              JWT_SECRET: 'test-secret',
              JWT_EXPIRES_IN: '15m',
              REFRESH_EXPIRES_DAYS: '7',
            }),
          ],
        }),
        PassportModule,
        CacheModule.register(),
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '15m' },
        }),
      ],
      controllers: [AuthController, GithubController],
      providers: [
        AuthService,
        JwtStrategy,
        GithubService,
        { provide: UsersService, useClass: InMemoryUsersService },
        { provide: getRepositoryToken(RefreshToken), useClass: InMemoryRefreshRepo },
        { provide: HttpService, useValue: httpMock },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const credentials = {
    name: 'Pedro',
    email: 'pedro@email.com',
    password: 'senha123',
  };
  let accessToken: string;
  let refreshToken: string;

  it('registra um novo usuario e retorna os tokens', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send(credentials)
      .expect(201);

    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.user.email).toBe(credentials.email);
    accessToken = res.body.accessToken;
    refreshToken = res.body.refreshToken;
  });

  it('rejeita registro com e-mail duplicado (409)', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(credentials)
      .expect(409);
  });

  it('rejeita validacao de payload invalido (400)', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'nao-eh-email', password: '123' })
      .expect(400);
  });

  it('bloqueia rota protegida sem token (401)', async () => {
    await request(app.getHttpServer()).get('/auth/me').expect(401);
  });

  it('acessa rota protegida com token valido', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(res.body.email).toBe(credentials.email);
  });

  it('renova os tokens via refresh e rotaciona o antigo', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken })
      .expect(201);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken })
      .expect(401);
    refreshToken = res.body.refreshToken;
  });

  it('revoga o refresh token no logout', async () => {
    await request(app.getHttpServer())
      .post('/auth/logout')
      .send({ refreshToken })
      .expect(200);
    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken })
      .expect(401);
  });

  it('consulta o GitHub (proxy) com token valido e paginacao', async () => {
    const res = await request(app.getHttpServer())
      .get('/github/users/search?q=torvalds')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(res.body.items[0].login).toBe('torvalds');
    expect(res.body.page).toBe(1);
  });
});
