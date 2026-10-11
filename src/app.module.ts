import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfig } from './config/database.config';
import { validateEnv }    from './config/env.validation';
import { SeedModule }        from './common/seed/seed.module';
import { AuthModule }        from './modules/auth/auth.module';
import { ShipmentsModule }   from './modules/shipments/shipments.module';
import { CheckpointsModule } from './modules/checkpoints/checkpoints.module';
import { LeadsModule }       from './modules/leads/leads.module';
import { SettingsModule }    from './modules/settings/settings.module';
import { MessagesModule }    from './modules/messages/messages.module';
import { MailModule }         from './common/mail/mail.module';
import { StorageModule }      from './common/storage/storage.module';
import { TestimonialsModule } from './modules/testimonials/testimonials.module';
import { PartnersModule }     from './modules/partners/partners.module';
import { HealthModule }       from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),

    // In-memory counters (single instance). Limits are set per route with @RateLimit.
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 60 }],
      errorMessage: 'Too many requests. Please wait a moment and try again.',
    }),

    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),

    StorageModule,
    SeedModule,
    AuthModule,
    ShipmentsModule,
    CheckpointsModule,
    LeadsModule,
    SettingsModule,
    MessagesModule,
    MailModule,
    TestimonialsModule,
    PartnersModule,
    HealthModule,
  ],
})
export class AppModule {}
