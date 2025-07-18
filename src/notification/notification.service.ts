import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ObjectId } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { User } from './entities/user.entity';
import { RedisService } from '../config/redis.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { CreateNotificationDto, UpdateNotificationDto } from './dto/notification.dto';
import { FirebaseConfigService } from '../config/firebase-config.service';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly redisService: RedisService,
    private readonly firebaseConfigService: FirebaseConfigService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    await this.userRepository.save(user);
    if (user.fcmToken) {
      await this.redisService.setUserToken(user.id.toString(), user.fcmToken);
    }
    return user;
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ 
      where: { id: new ObjectId(userId) } 
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateUserDto);
    await this.userRepository.save(user);

    if (user.fcmToken) {
      await this.redisService.setUserToken(user.id.toString(), user.fcmToken);
    } else {
      await this.redisService.removeUserToken(user.id.toString());
    }

    return user;
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
      console.log('Successfully sent Firebase notification:', response);
      return response;
    } catch (error) {
      console.error('Error sending Firebase notification:', error);
      throw error;
    }
  }

  async sendNotification(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const user = await this.userRepository.findOne({
      where: { id: new ObjectId(createNotificationDto.userId) },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const notification = this.notificationRepository.create({
      ...createNotificationDto,
      fcmToken: user.fcmToken,
    });

    // Gửi thông báo qua Firebase nếu có fcmToken
    if (user.fcmToken) {
      try {
        await this.sendFirebaseNotification(
          user.fcmToken,
          createNotificationDto.title,
          createNotificationDto.content,
          {
            notificationId: notification.id.toString(),
            type: createNotificationDto.type || 'default',
            senderId: createNotificationDto.senderId,
          }
        );
      } catch (error) {
        console.error('Failed to send Firebase notification:', error);
        // Vẫn lưu thông báo ngay cả khi gửi Firebase thất bại
      }
    }

    return this.notificationRepository.save(notification);
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: new ObjectId(notificationId) },
    });
    
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    // Kiểm tra quyền - chỉ cho phép user đánh dấu đã đọc thông báo của chính họ
    if (notification.userId !== userId) {
      throw new UnauthorizedException('You are not authorized to mark this notification as read');
    }

    notification.isRead = true;
    return this.notificationRepository.save(notification);
  }
} 