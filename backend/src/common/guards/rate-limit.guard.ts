import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

export const RATE_LIMIT_KEY = 'rate_limit';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly requests = new Map<string, RateLimitEntry>();

  private readonly defaultLimit = 100;
  private readonly defaultWindowMs = 60_000;

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    const routeLimit =
      this.reflector.getAllAndOverride<RateLimitOptions>(
        RATE_LIMIT_KEY,
        [context.getHandler(), context.getClass()],
      );

    const limit = routeLimit?.limit ?? this.defaultLimit;
    const windowMs = routeLimit?.windowMs ?? this.defaultWindowMs;

    const key = `${request.ip}:${request.method}:${request.path}`;
    const now = Date.now();

    const entry = this.requests.get(key);

    if (!entry || now >= entry.resetAt) {
      this.requests.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });

      return true;
    }

    if (entry.count >= limit) {
     throw new HttpException(
  'Too many requests. Please try again later.',
  HttpStatus.TOO_MANY_REQUESTS,
);
    }

    entry.count += 1;

    return true;
  }
}