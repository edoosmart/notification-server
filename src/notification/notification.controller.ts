import { Body, Controller, Get, Param, Post, Put, UseGuards, Request } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto/user.dto';
import { CreateNotificationDto, UpdateNotificationDto, NotificationResponseDto } from './dto/notification.dto';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('api/notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('users')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  async createUser(@Body() createUserDto: CreateUserDto, @Request() req) {
    // Sử dụng thông tin user từ token
    const authenticatedUser = req.user;
    return this.notificationService.createUser({
      ...createUserDto,
      // Có thể thêm thông tin từ token nếu cần
      email: authenticatedUser.email || createUserDto.email,
    });
  }

  @Put('users/:userId')
  @ApiOperation({ summary: 'Update user information' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async updateUser(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    // Kiểm tra quyền - chỉ cho phép user cập nhật thông tin của chính họ
    const authenticatedUser = req.user;
    if (authenticatedUser.id !== userId) {
      throw new Error('Unauthorized to update this user');
    }
    return this.notificationService.updateUser(userId, updateUserDto);
  }

  @Post('send')
  @ApiOperation({ summary: 'Send a notification' })
  @ApiResponse({ status: 201, type: NotificationResponseDto })
  async sendNotification(
    @Body() createNotificationDto: CreateNotificationDto,
    @Request() req,
  ) {
    const authenticatedUser = req.user;
    // Thêm thông tin người gửi từ token
    return this.notificationService.sendNotification({
      ...createNotificationDto,
      senderId: authenticatedUser.id,
    });
  }

  @Get('users/:userId')
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiResponse({ status: 200, type: [NotificationResponseDto] })
  async getNotifications(@Param('userId') userId: string, @Request() req) {
    // Kiểm tra quyền - chỉ cho phép user xem thông báo của chính họ
    const authenticatedUser = req.user;
    if (authenticatedUser.id !== userId) {
      throw new Error('Unauthorized to view these notifications');
    }
    return this.notificationService.getNotifications(userId);
  }

  @Put('read/:notificationId')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, type: NotificationResponseDto })
  async markNotificationAsRead(
    @Param('notificationId') notificationId: string,
    @Request() req,
  ) {
    // Kiểm tra quyền trước khi đánh dấu đã đọc
    const authenticatedUser = req.user;
    return this.notificationService.markAsRead(notificationId, authenticatedUser.id);
  }
} 