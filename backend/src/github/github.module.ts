import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { GithubService } from './github.service';
import { GithubController } from './github.controller';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10_000,
      maxRedirects: 5,
    }),
    CacheModule.register({
      ttl: 60_000,
      max: 200,
    }),
  ],
  providers: [GithubService],
  controllers: [GithubController],
})
export class GithubModule {}
