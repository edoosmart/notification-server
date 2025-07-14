import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto/user.dto';
import { CreateNotificationDto, UpdateNotificationDto, NotificationResponseDto } from './dto/notification.dto';

@ApiTags('notifications')
@Controller('api/notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('users')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.notificationService.createUser(createUserDto);
  }

  @Put('users/:userId')
  @ApiOperation({ summary: 'Update user information' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async updateUser(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.notificationService.updateUser(userId, updateUserDto);
  }

  @Post('send')
  @ApiOperation({ summary: 'Send a notification' })
  @ApiResponse({ status: 201, type: NotificationResponseDto })
  async sendNotification(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.sendNotification(createNotificationDto);
  }

  @Get('users/:userId')
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiResponse({ status: 200, type: [NotificationResponseDto] })
  async getNotifications(@Param('userId') userId: string) {
    return this.notificationService.getNotifications(userId);
  }

  @Put('read/:notificationId')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, type: NotificationResponseDto })
  async markNotificationAsRead(@Param('notificationId') notificationId: string) {
    return this.notificationService.markAsRead(notificationId);
  }
} 