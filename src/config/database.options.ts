import { join } from 'node:path';
import type { DataSourceOptions } from 'typeorm';

import { User }           from '../entities/user.entity';
import { Shipment }       from '../entities/shipment.entity';
import { Checkpoint }     from '../entities/checkpoint.entity';
import { Lead }           from '../entities/lead.entity';
import { SiteSettings }   from '../entities/site-settings.entity';
import { ContactMessage } from '../entities/contact-message.entity';
import { Testimonial }    from '../entities/testimonial.entity';
import { Partner }        from '../entities/partner.entity';

export interface DbConnection {
  host: string; port: number; username: string; password: string; database: string;
}

export function readDbConnection(get: (key: string, fallback: string) => string): DbConnection {
  return {
    host:     get('DB_HOST',     'localhost'),
    port:     Number(get('DB_PORT', '5432')),
    username: get('DB_USERNAME', 'tic_user'),
    password: get('DB_PASSWORD', 'tic_password'),
    database: get('DB_NAME',     'tic_db'),
  };
}

// Options shared by the application and the TypeORM CLI.
// The schema is managed by migrations only (src/migrations), never by synchronize.
export function buildDataSourceOptions(db: DbConnection, logging = false): DataSourceOptions {
  return {
    type: 'postgres',
    ...db,
    entities:    [User, Shipment, Checkpoint, Lead, SiteSettings, ContactMessage, Testimonial, Partner],
    migrations:  [join(__dirname, '..', 'migrations', '*.js')],
    migrationsTableName: 'migrations',
    synchronize: false,
    logging,
  };
}
