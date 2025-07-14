import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto/user.dto';

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
  @ApiResponse({ status: 201 })
  async sendNotification(
    @Body()
    data: {
      userId: string;
      title: string;
      body: string;
      data?: Record<string, any>;
    },
  ) {
    return this.notificationService.sendNotification(
      data.userId,
      data.title,
      data.body,
      data.data,
    );
  }

  @Get('users/:userId')
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiResponse({ status: 200 })
  async getNotifications(@Param('userId') userId: string) {
    return this.notificationService.getNotifications(userId);
  }

  @Put('read/:notificationId')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200 })
  async markNotificationAsRead(@Param('notificationId') notificationId: string) {
    return this.notificationService.markAsRead(notificationId);
  }
} 