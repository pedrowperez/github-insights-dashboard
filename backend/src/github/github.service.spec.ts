import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AxiosError } from 'axios';
import { GithubService } from './github.service';

describe('GithubService', () => {
  let service: GithubService;
  let http: { get: jest.Mock };

  const axiosResponse = (data: unknown) => of({ data } as any);

  beforeEach(() => {
    http = { get: jest.fn() };
    const config = {
      get: jest.fn().mockReturnValue(undefined),
    } as unknown as ConfigService;
    service = new GithubService(http as unknown as HttpService, config);
  });

  describe('searchUsers', () => {
    it('mapeia os campos relevantes da resposta do GitHub', async () => {
      http.get.mockReturnValue(
        axiosResponse({
          total_count: 1,
          items: [
            {
              id: 1,
              login: 'torvalds',
              avatar_url: 'http://avatar',
              html_url: 'http://gh',
              type: 'User',
            },
          ],
        }),
      );

      const result = await service.searchUsers('torvalds');

      expect(result.totalCount).toBe(1);
      expect(result.items[0]).toEqual({
        id: 1,
        login: 'torvalds',
        avatarUrl: 'http://avatar',
        htmlUrl: 'http://gh',
        type: 'User',
      });
    });
  });

  describe('getUserProfile', () => {
    it('agrega linguagens, stars e forks dos repositorios', async () => {
      http.get
        .mockReturnValueOnce(
          axiosResponse({
            id: 1,
            login: 'torvalds',
            name: 'Linus',
            avatar_url: 'a',
            html_url: 'h',
            followers: 10,
            following: 1,
            public_repos: 2,
            created_at: '2011-01-01',
          }),
        )
        .mockReturnValueOnce(
          axiosResponse([
            {
              id: 1,
              name: 'linux',
              language: 'C',
              stargazers_count: 100,
              forks_count: 50,
            },
            {
              id: 2,
              name: 'subsurface',
              language: 'C',
              stargazers_count: 30,
              forks_count: 10,
            },
            {
              id: 3,
              name: 'tool',
              language: 'Shell',
              stargazers_count: 5,
              forks_count: 2,
            },
          ]),
        );

      const result = await service.getUserProfile('torvalds');

      expect(result.stats.totalStars).toBe(135);
      expect(result.stats.totalForks).toBe(62);
      expect(result.stats.reposAnalyzed).toBe(3);
      expect(result.languages[0]).toEqual({ language: 'C', count: 2 });
      expect(result.topRepos[0].name).toBe('linux');
    });
  });

  describe('tratamento de erros', () => {
    it('converte 404 do GitHub em NotFoundException', async () => {
      const error = {
        response: { status: 404, headers: {} },
        message: 'Not Found',
        isAxiosError: true,
      } as AxiosError;
      http.get.mockReturnValue(throwError(() => error));

      await expect(service.searchUsers('inexistente')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
