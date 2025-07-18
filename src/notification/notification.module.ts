import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationBuilderService } from './builder.service';
import { PushWorkerService } from './push-worker.service';
import { Notification } from './entities/notification.entity';
import { User } from './entities/user.entity';
import { RedisService } from '../config/redis.service';
import { FirebaseConfigService } from '../config/firebase-config.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, User])
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationBuilderService,
    PushWorkerService,
    RedisService,
    FirebaseConfigService
  ],
})
export class NotificationModule {} 