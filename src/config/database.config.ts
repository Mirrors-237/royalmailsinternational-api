import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Client } from 'pg';
import { buildDataSourceOptions, readDbConnection } from './database.options';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  private readonly log = new Logger(DatabaseConfig.name);

  constructor(private config: ConfigService) {}

  async createTypeOrmOptions(): Promise<TypeOrmModuleOptions> {
    const db = readDbConnection((key, fallback) => this.config.get(key, fallback));

    // Create the database if it does not exist
    await this.ensureDatabase(db);

    return {
      ...buildDataSourceOptions(db, this.config.get('NODE_ENV') === 'development'),
      // Apply pending migrations at startup (each in its own transaction)
      migrationsRun:             true,
      migrationsTransactionMode: 'each',
    };
  }

  private async ensureDatabase(cfg: {
    host: string; port: number; username: string; password: string; database: string;
  }) {
    // Connect to the 'postgres' system database so the target database can be created
    const client = new Client({
      host:     cfg.host,
      port:     cfg.port,
      user:     cfg.username,
      password: cfg.password,
      database: 'postgres',
      connectionTimeoutMillis: 10_000,
    });

    try {
      await client.connect();
      const res = await client.query(
        `SELECT 1 FROM pg_database WHERE datname = $1`,
        [cfg.database],
      );
      if (res.rowCount === 0) {
        await client.query(`CREATE DATABASE "${cfg.database}"`);
        this.log.log(`Database "${cfg.database}" created`);
      }
    } catch (err) {
      this.log.warn(`Could not check or create the database: ${err.message}`);
    } finally {
      await client.end();
    }
  }
}
