// Entry point for the TypeORM CLI (npm run migration:*), used from dist/ after compilation
import 'reflect-metadata';
import { existsSync } from 'node:fs';
import { DataSource } from 'typeorm';
import { buildDataSourceOptions, readDbConnection } from './database.options';

// TypeORM no longer loads .env itself since v1
if (existsSync('.env')) process.loadEnvFile('.env');

export default new DataSource(
  buildDataSourceOptions(readDbConnection((key, fallback) => process.env[key] ?? fallback)),
);
