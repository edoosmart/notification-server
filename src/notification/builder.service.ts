import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId, Repository } from 'typeorm';
import { RedisService } from '../config/redis.service';
import { User } from './entities/user.entity';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationBuilderService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly redisService: RedisService,
  ) {}

  async buildCampaign(campaignData: {
    title: string;
    content: string;
    userIds?: string[];
    type?: string;
  }) {
    // Tạo campaign trong database
    const campaign = await this.notificationRepository.create({
      title: campaignData.title,
      content: campaignData.content,
      type: campaignData.type || 'campaign',
      status: 'building',
    });
    await this.notificationRepository.save(campaign);

    // Nếu có danh sách userIds cụ thể
    let users: User[] = [];
    if (campaignData.userIds && campaignData.userIds.length > 0) {
      users = await this.userRepository.findByIds(campaignData.userIds);
    } else {
      // Lấy tất cả users active
      users = await this.userRepository.find({ where: { isActive: true } });
    }

    // Lưu danh sách users vào Redis để Push Worker có thể xử lý
    const campaignKey = `campaign:${campaign.id}`;
    await this.redisService.setCampaignUsers(campaignKey, users.map(user => ({
      userId: user.id.toString(),
      fcmToken: user.fcmToken
    })));

    // Cập nhật trạng thái campaign
    campaign.status = 'ready';
    campaign.totalUsers = users.length;
    await this.notificationRepository.save(campaign);

    return campaign;
  }

  async getCampaignStatus(campaignId: ObjectId) {
    const campaign = await this.notificationRepository.findOne({
      where: { id: campaignId }
    });
    if (!campaign) {
      throw new Error('Campaign not found');
    }
    return {
      status: campaign.status,
      totalUsers: campaign.totalUsers,
      processedUsers: campaign.processedUsers || 0,
      successCount: campaign.successCount || 0,
      failureCount: campaign.failureCount || 0
    };
  }
} 