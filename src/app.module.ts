import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationModule } from './notification/notification.module';
import { RedisService } from './config/redis.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: process.env.MONGO_URI || 'mongodb://localhost:27017/notification-service',
      synchronize: true,
      autoLoadEntities: true,
    }),
    NotificationModule,
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class AppModule {}
