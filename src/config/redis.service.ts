import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }

  async setUserToken(userId: string, token: string): Promise<void> {
    await this.redis.set(`user:${userId}:token`, token);
  }

  async getUserToken(userId: string): Promise<string | null> {
    return this.redis.get(`user:${userId}:token`);
  }

  async removeUserToken(userId: string): Promise<void> {
    await this.redis.del(`user:${userId}:token`);
  }

  // Campaign methods
  async setCampaignUsers(campaignKey: string, users: Array<{ userId: string; fcmToken?: string }>): Promise<void> {
    await this.redis.del(campaignKey); // Clear existing data
    if (users.length > 0) {
      await this.redis.rpush(campaignKey, ...users.map(u => JSON.stringify(u)));
    }
    // Set expiry for 24 hours
    await this.redis.expire(campaignKey, 24 * 60 * 60);
  }

  async getCampaignUser(campaignKey: string): Promise<{ userId: string; fcmToken?: string } | null> {
    const userData = await this.redis.lpop(campaignKey);
    if (!userData) return null;
    return JSON.parse(userData);
  }

  async getCampaignLength(campaignKey: string): Promise<number> {
    return this.redis.llen(campaignKey);
  }

  // Queue methods
  async pushToQueue(queueKey: string, data: any): Promise<void> {
    await this.redis.rpush(queueKey, JSON.stringify(data));
  }

  async popFromQueue(queueKey: string): Promise<any | null> {
    const data = await this.redis.lpop(queueKey);
    if (!data) return null;
    return JSON.parse(data);
  }

  async getQueueLength(queueKey: string): Promise<number> {
    return this.redis.llen(queueKey);
  }
} 