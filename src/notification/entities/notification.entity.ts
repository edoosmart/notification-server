import { Entity, ObjectIdColumn, ObjectId, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('notifications')
export class Notification {
  @ApiProperty()
  @ObjectIdColumn()
  id: ObjectId;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  userId?: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  senderId?: string;

  @ApiProperty()
  @Column()
  title: string;

  @ApiProperty()
  @Column()
  content: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  fcmToken?: string;

  @ApiProperty()
  @Column({ default: false })
  isRead: boolean;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  type?: string;

  @ApiProperty()
  @Column({ default: 'pending' })
  status: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  totalUsers?: number;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  processedUsers?: number;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  successCount?: number;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  failureCount?: number;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  error?: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  deliveredAt?: Date;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  failedAt?: Date;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
} 