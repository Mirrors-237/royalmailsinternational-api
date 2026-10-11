import { applyDecorators, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

// Per-IP rate limit for a public route: at most `limit` requests per `ttlMs` window.
// The client IP comes from req.ip, so 'trust proxy' must be set correctly (see main.ts).
export const RateLimit = (limit: number, ttlMs: number) =>
  applyDecorators(UseGuards(ThrottlerGuard), Throttle({ default: { limit, ttl: ttlMs } }));
