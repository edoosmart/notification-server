import { Injectable } from '@nestjs/common';
import { RedisService } from '../config/redis.service';

@Injectable()
export class NotificationQueueService {
  private readonly QUEUE_KEY = 'notification:responses';

  constructor(private readonly redisService: RedisService) {}

  async enqueueResponse(response: {
    campaignId: string;
    userId: string;
    success: boolean;
    error?: string;
  }) {
    await this.redisService.pushToQueue(this.QUEUE_KEY, response);
  }

  async dequeueResponse(): Promise<{
    campaignId: string;
    userId: string;
    success: boolean;
    error?: string;
  } | null> {
    return this.redisService.popFromQueue(this.QUEUE_KEY);
  }

  async getQueueLength(): Promise<number> {
    return this.redisService.getQueueLength(this.QUEUE_KEY);
  }
} 