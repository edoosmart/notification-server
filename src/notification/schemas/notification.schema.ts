import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  body: string;

  // @Prop()
  // data?: Record<string, any>;

  @Prop({ default: false })
  isRead: boolean;

  @Prop()
  fcmToken?: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification); 