import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId, Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { RedisService } from '../config/redis.service';
import { FirebaseConfigService } from '../config/firebase-config.service';
import { NotificationQueueService } from './queue.service';

@Injectable()
export class PushWorkerService {
  private readonly logger = new Logger(PushWorkerService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly redisService: RedisService,
    private readonly firebaseConfigService: FirebaseConfigService,
    private readonly queueService: NotificationQueueService,
  ) {}

  async processCampaign(campaignId: ObjectId) {
    const campaign = await this.notificationRepository.findOne({
      where: { id: campaignId }
    });

    if (!campaign || campaign.status !== 'ready') {
      throw new Error('Campaign not found or not ready');
    }

    // Cập nhật trạng thái
    campaign.status = 'processing';
    await this.notificationRepository.save(campaign);

    const campaignKey = `campaign:${campaignId}`;
    let processedCount = 0;
    let successCount = 0;
    let failureCount = 0;

    try {
      while (true) {
        const user = await this.redisService.getCampaignUser(campaignKey);
        if (!user) break; // Hết user trong queue

        processedCount++;
        
        if (user.fcmToken) {
          try {
            const response = await this.sendFirebaseNotification(
              user.fcmToken,
              campaign.title,
              campaign.content,
              {
                campaignId: campaign.id.toString(),
                type: campaign.type || 'campaign',
                senderId: campaign.senderId,
              }
            );

            // Gửi response vào queue
            await this.queueService.enqueueResponse({
              campaignId: campaign.id.toString(),
              userId: user.userId,
              success: true,
            });

            successCount++;
          } catch (error) {
            this.logger.error(`Failed to send notification to user ${user.userId}:`, error);
            
            // Gửi error response vào queue
            await this.queueService.enqueueResponse({
              campaignId: campaign.id.toString(),
              userId: user.userId,
              success: false,
              error: error.message,
            });

            failureCount++;
          }
        } else {
          failureCount++;
          // Gửi error response vào queue cho trường hợp không có token
          await this.queueService.enqueueResponse({
            campaignId: campaign.id.toString(),
            userId: user.userId,
            success: false,
            error: 'No FCM token available',
          });
        }

        // Cập nhật tiến độ mỗi 100 users hoặc khi là user cuối
        if (processedCount % 100 === 0 || !await this.redisService.getCampaignLength(campaignKey)) {
          await this.notificationRepository.update(
            { id: campaign.id },
            {
              processedUsers: processedCount,
              successCount,
              failureCount,
            }
          );
        }
      }

      // Cập nhật trạng thái hoàn thành
      await this.notificationRepository.update(
        { id: campaign.id },
        {
          status: 'completed',
          processedUsers: processedCount,
          successCount,
          failureCount,
        }
      );
    } catch (error) {
      this.logger.error('Error processing campaign:', error);
      // Cập nhật trạng thái lỗi
      await this.notificationRepository.update(
        { id: campaign.id },
        {
          status: 'failed',
          processedUsers: processedCount,
          successCount,
          failureCount,
        }
      );
      throw error;
    }
  }

  private async sendFirebaseNotification(fcmToken: string, title: string, body: string, data?: any) {
    try {
      const firebaseAdmin = this.firebaseConfigService.getFirebaseAdmin();
      const message = {
        token: fcmToken,
        notification: {
          title,
          body,
        },
        data: data || {},
      };

      const response = await firebaseAdmin.messaging().send(message);
      this.logger.debug('Successfully sent Firebase notification:', response);
      return response;
    } catch (error) {
      this.logger.error('Error sending Firebase notification:', error);
      throw error;
    }
  }
} 