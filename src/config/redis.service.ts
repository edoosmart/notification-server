import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async setUserToken(userId: string, fcmToken: string): Promise<void> {
    await this.client.set(`user:${userId}:token`, fcmToken);
  }

  async getUserToken(userId: string): Promise<string | null> {
    return this.client.get(`user:${userId}:token`);
  }

  async removeUserToken(userId: string): Promise<void> {
    await this.client.del(`user:${userId}:token`);
  }

  async cacheUser(userId: string, userData: any): Promise<void> {
    await this.client.setex(`user:${userId}:data`, 3600, JSON.stringify(userData));
  }

  async getCachedUser(userId: string): Promise<any | null> {
    const data = await this.client.get(`user:${userId}:data`);
    return data ? JSON.parse(data) : null;
  }
} 