import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ObjectId } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationQueueService } from './queue.service';
import { RedisService } from '../config/redis.service';

@Injectable()
export class PushResponseService {
  private readonly logger = new Logger(PushResponseService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly queueService: NotificationQueueService,
    private readonly redisService: RedisService,
  ) {}

  async processResponses() {
    while (true) {
      const response = await this.queueService.dequeueResponse();
      if (!response) {
        // Không còn response trong queue
        break;
      }

      try {
        // Cập nhật trạng thái trong DB
        await this.updateNotificationStatus(
          response.campaignId,
          response.userId,
          response.success,
          response.error
        );

        // Cập nhật token state trong Redis nếu cần
        if (!response.success && response.error?.includes('token-invalid')) {
          await this.redisService.removeUserToken(response.userId);
        }

      } catch (error) {
        this.logger.error('Error processing notification response:', error);
        // Re-queue response nếu xử lý thất bại
        await this.queueService.enqueueResponse(response);
      }
    }
  }

  private async updateNotificationStatus(
    campaignId: string,
    userId: string,
    success: boolean,
    error?: string
  ) {
    const notification = await this.notificationRepository.findOne({
      where: { id: new ObjectId(campaignId) }
    });

    if (!notification) {
      this.logger.warn(`Notification ${campaignId} not found`);
      return;
    }

    // Cập nhật trạng thái
    if (success) {
      notification.status = 'delivered';
      notification.deliveredAt = new Date();
    } else {
      notification.status = 'failed';
      notification.error = error;
      notification.failedAt = new Date();
    }

    await this.notificationRepository.save(notification);
  }
} 