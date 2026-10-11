import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Only trust X-Forwarded-For from local or private-network proxies (the Nuxt server, Docker),
  // so that rate limits apply to the real client IP and cannot be bypassed with a forged header.
  app.set('trust proxy', process.env.TRUST_PROXY ?? 'loopback, uniquelocal');

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const rawOrigins = process.env.CORS_ORIGINS ?? 'http://localhost:3000,http://localhost:4000';
  const origins    = rawOrigins.split(',').map(o => o.trim()).filter(Boolean);

  app.enableCors({
    origin:      origins,
    credentials: true,
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`API running on http://localhost:${port}/api`);
}
bootstrap();
