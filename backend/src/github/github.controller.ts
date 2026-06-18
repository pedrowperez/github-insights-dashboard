import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GithubService } from './github.service';

@UseGuards(JwtAuthGuard)
@UseInterceptors(CacheInterceptor)
@Controller('github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Get('users/search')
  searchUsers(@Query('q') q: string) {
    if (!q || !q.trim()) {
      throw new BadRequestException('Informe um termo de busca.');
    }
    return this.githubService.searchUsers(q.trim());
  }

  @Get('users/:username')
  getUser(@Param('username') username: string) {
    return this.githubService.getUserProfile(username);
  }

  @Get('repos/search')
  searchRepos(
    @Query('q') q: string,
    @Query('language') language?: string,
    @Query('sort') sort?: string,
  ) {
    if (!q || !q.trim()) {
      throw new BadRequestException('Informe um termo de busca.');
    }
    const allowedSorts = ['stars', 'forks', 'updated', 'help-wanted-issues'];
    const safeSort = allowedSorts.includes(sort ?? '') ? sort : 'stars';
    return this.githubService.searchRepositories(
      q.trim(),
      language?.trim() || undefined,
      safeSort,
    );
  }

  @Get('repos/:owner/:repo')
  getRepo(@Param('owner') owner: string, @Param('repo') repo: string) {
    return this.githubService.getRepository(owner, repo);
  }
}
