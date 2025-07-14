import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationModule } from './notification/notification.module';
// import { FirebaseConfigService } from './config/firebase-config.service';
import { RedisService } from './config/redis.service';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/notification-service'),
    NotificationModule,
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class AppModule {}
