import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationBuilderService } from './builder.service';
import { PushWorkerService } from './push-worker.service';
import { NotificationQueueService } from './queue.service';
import { PushResponseService } from './push-response.service';
import { Notification } from './entities/notification.entity';
import { User } from './entities/user.entity';
import { RedisService } from '../config/redis.service';
import { FirebaseConfigService } from '../config/firebase-config.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, User]),
    AuthModule
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationBuilderService,
    PushWorkerService,
    NotificationQueueService,
    PushResponseService,
    RedisService,
    FirebaseConfigService
  ],
  exports: [
    NotificationService,
    NotificationBuilderService,
    PushWorkerService,
    NotificationQueueService,
    PushResponseService,
    RedisService,
    FirebaseConfigService
  ],
})
export class NotificationModule {} 