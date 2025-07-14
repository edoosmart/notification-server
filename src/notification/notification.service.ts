import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from './schemas/notification.schema';
import { User, UserDocument } from './schemas/user.schema';
import { RedisService } from '../config/redis.service';
// import { FirebaseConfigService } from '../config/firebase-config.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<Notification>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly redisService: RedisService,
    // private readonly firebaseService: FirebaseConfigService,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const user = new this.userModel(createUserDto);
    const savedUser = await user.save();
    
    if (createUserDto.fcmToken) {
      await this.redisService.setUserToken(savedUser.id, createUserDto.fcmToken);
    }
    
    await this.redisService.cacheUser(savedUser.id, savedUser.toJSON());
    return savedUser;
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.fcmToken) {
      await this.redisService.setUserToken(userId, updateUserDto.fcmToken);
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await user.save();
    await this.redisService.cacheUser(userId, updatedUser.toJSON());
    
    return updatedUser;
  }

  async sendNotification(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, any>,
  ) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const fcmToken = await this.redisService.getUserToken(userId);
    if (!fcmToken) {
      throw new NotFoundException('FCM token not found');
    }

    // Save notification to MongoDB
    const notification = new this.notificationModel({
      userId,
      title,
      body,
      data,
    });
    await notification.save();

    // Send to Firebase
    // await this.firebaseService.({
    //   token: fcmToken,
    //   notification: {
    //     title,
    //     body,
    //   },
    //   data,
    // });

    return notification;
  }

  async getNotifications(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.notificationModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async markAsRead(notificationId: string) {
    const notification = await this.notificationModel.findById(notificationId);
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.isRead = true;
    return notification.save();
  }
} 