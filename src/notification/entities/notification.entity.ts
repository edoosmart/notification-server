import { Entity, ObjectIdColumn, ObjectId, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('notifications')
export class Notification {
  @ApiProperty()
  @ObjectIdColumn()
  id: ObjectId;

  @ApiProperty()
  @Column()
  userId: string;

  @ApiProperty()
  @Column()
  title: string;

  @ApiProperty()
  @Column()
  body: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  fcmToken?: string;

  @ApiProperty()
  @Column({ default: false })
  isRead: boolean;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
} 