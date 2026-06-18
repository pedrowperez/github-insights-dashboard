import 'dotenv/config';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { User } from './users/entities/user.entity';
import { RefreshToken } from './auth/entities/refresh-token.entity';

// DataSource usado pelo CLI do TypeORM (generate/run/revert das migrations).
export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, RefreshToken],
  migrations: [join(__dirname, 'migrations', '*.{js,ts}')],
  synchronize: false,
  ssl:
    (process.env.DB_SSL ?? 'true') === 'true'
      ? { rejectUnauthorized: false }
      : false,
});
