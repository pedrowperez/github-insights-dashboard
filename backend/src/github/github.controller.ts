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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GithubService } from './github.service';

@ApiTags('github')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(CacheInterceptor)
@Controller('github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @ApiOperation({ summary: 'Busca usuarios do GitHub' })
  @ApiQuery({ name: 'q', example: 'torvalds' })
  @Get('users/search')
  searchUsers(@Query('q') q: string) {
    if (!q || !q.trim()) {
      throw new BadRequestException('Informe um termo de busca.');
    }
    return this.githubService.searchUsers(q.trim());
  }

  @ApiOperation({
    summary: 'Perfil de um usuario com agregacoes (linguagens, stars, repos)',
  })
  @Get('users/:username')
  getUser(@Param('username') username: string) {
    return this.githubService.getUserProfile(username);
  }

  @ApiOperation({ summary: 'Busca repositorios com filtros opcionais' })
  @ApiQuery({ name: 'q', example: 'machine learning' })
  @ApiQuery({ name: 'language', required: false, example: 'TypeScript' })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: ['stars', 'forks', 'updated', 'help-wanted-issues'],
  })
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

  @ApiOperation({ summary: 'Detalhes de um repositorio especifico' })
  @Get('repos/:owner/:repo')
  getRepo(@Param('owner') owner: string, @Param('repo') repo: string) {
    return this.githubService.getRepository(owner, repo);
  }
}
