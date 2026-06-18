import { HttpService } from '@nestjs/axios';
import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError, AxiosRequestConfig } from 'axios';
import { firstValueFrom } from 'rxjs';

const GITHUB_API = 'https://api.github.com';

export interface LanguageStat {
  language: string;
  count: number;
}

@Injectable()
export class GithubService {
  private readonly logger = new Logger(GithubService.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  private get requestConfig(): AxiosRequestConfig {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
    const token = this.config.get<string>('GITHUB_TOKEN');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return { headers };
  }

  private async get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    try {
      const response = await firstValueFrom(
        this.http.get<T>(`${GITHUB_API}${path}`, {
          ...this.requestConfig,
          params,
        }),
      );
      return response.data;
    } catch (err) {
      this.handleError(err as AxiosError, path);
    }
  }

  private handleError(error: AxiosError, path: string): never {
    const status = error.response?.status;

    if (status === HttpStatus.NOT_FOUND) {
      throw new NotFoundException('Recurso nao encontrado no GitHub.');
    }

    if (status === HttpStatus.FORBIDDEN || status === 429) {
      const remaining = error.response?.headers?.['x-ratelimit-remaining'];
      if (remaining === '0') {
        throw new HttpException(
          'Limite de requisicoes da API do GitHub atingido. Tente novamente em alguns minutos ou configure um GITHUB_TOKEN.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      throw new HttpException(
        'Acesso negado pela API do GitHub.',
        HttpStatus.FORBIDDEN,
      );
    }

    this.logger.error(`Falha ao consultar GitHub (${path}): ${error.message}`);
    throw new ServiceUnavailableException(
      'Nao foi possivel consultar a API do GitHub no momento.',
    );
  }

  async searchUsers(query: string, perPage = 12) {
    const data = await this.get<{ total_count: number; items: any[] }>(
      '/search/users',
      { q: query, per_page: perPage },
    );
    return {
      totalCount: data.total_count,
      items: data.items.map((u) => ({
        id: u.id,
        login: u.login,
        avatarUrl: u.avatar_url,
        htmlUrl: u.html_url,
        type: u.type,
      })),
    };
  }

  async getUserProfile(username: string) {
    const profile = await this.get<any>(`/users/${username}`);
    const repos = await this.get<any[]>(`/users/${username}/repos`, {
      per_page: 100,
      sort: 'updated',
    });

    const languageMap = new Map<string, number>();
    let totalStars = 0;
    let totalForks = 0;

    for (const repo of repos) {
      totalStars += repo.stargazers_count ?? 0;
      totalForks += repo.forks_count ?? 0;
      if (repo.language) {
        languageMap.set(
          repo.language,
          (languageMap.get(repo.language) ?? 0) + 1,
        );
      }
    }

    const languages: LanguageStat[] = Array.from(languageMap.entries())
      .map(([language, count]) => ({ language, count }))
      .sort((a, b) => b.count - a.count);

    const topRepos = [...repos]
      .sort((a, b) => (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0))
      .slice(0, 6)
      .map((repo) => ({
        id: repo.id,
        name: repo.name,
        htmlUrl: repo.html_url,
        description: repo.description,
        stars: repo.stargazers_count ?? 0,
        forks: repo.forks_count ?? 0,
        language: repo.language,
      }));

    return {
      profile: {
        id: profile.id,
        login: profile.login,
        name: profile.name,
        avatarUrl: profile.avatar_url,
        htmlUrl: profile.html_url,
        bio: profile.bio,
        company: profile.company,
        location: profile.location,
        blog: profile.blog,
        followers: profile.followers,
        following: profile.following,
        publicRepos: profile.public_repos,
        createdAt: profile.created_at,
      },
      stats: {
        totalStars,
        totalForks,
        reposAnalyzed: repos.length,
      },
      languages,
      topRepos,
    };
  }

  async searchRepositories(
    query: string,
    language?: string,
    sort = 'stars',
    perPage = 15,
  ) {
    const q = language ? `${query} language:${language}` : query;
    const data = await this.get<{ total_count: number; items: any[] }>(
      '/search/repositories',
      { q, sort, order: 'desc', per_page: perPage },
    );
    return {
      totalCount: data.total_count,
      items: data.items.map((repo) => ({
        id: repo.id,
        fullName: repo.full_name,
        name: repo.name,
        owner: repo.owner?.login,
        ownerAvatar: repo.owner?.avatar_url,
        htmlUrl: repo.html_url,
        description: repo.description,
        stars: repo.stargazers_count ?? 0,
        forks: repo.forks_count ?? 0,
        openIssues: repo.open_issues_count ?? 0,
        language: repo.language,
        updatedAt: repo.updated_at,
      })),
    };
  }

  async getRepository(owner: string, repo: string) {
    const data = await this.get<any>(`/repos/${owner}/${repo}`);
    const languages = await this.get<Record<string, number>>(
      `/repos/${owner}/${repo}/languages`,
    );

    return {
      id: data.id,
      fullName: data.full_name,
      htmlUrl: data.html_url,
      description: data.description,
      stars: data.stargazers_count ?? 0,
      forks: data.forks_count ?? 0,
      openIssues: data.open_issues_count ?? 0,
      watchers: data.subscribers_count ?? 0,
      defaultBranch: data.default_branch,
      language: data.language,
      license: data.license?.name,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      languages: Object.entries(languages).map(([language, bytes]) => ({
        language,
        bytes,
      })),
    };
  }
}
