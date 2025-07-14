import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { Notification } from './entities/notification.entity';
import { User } from './entities/user.entity';
import { RedisService } from '../config/redis.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, User])
  ],
  controllers: [NotificationController],
  providers: [NotificationService, RedisService],
})
export class NotificationModule {} 