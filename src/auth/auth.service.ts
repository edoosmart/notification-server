import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async verifyAccessToken(accessToken: string): Promise<any> {
    try {
      // Gọi API verify token từ hệ thống authentication
      const response = await firstValueFrom(
        this.httpService.post(
          this.configService.get<string>('AUTH_VERIFY_URL') || 'http://localhost:3000/api/auth/verify',
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )
      );

      // Trả về thông tin user nếu token hợp lệ
      return response.data;
    } catch (error) {
      throw new UnauthorizedException('Invalid access token');
    }
  }

  // Tạo decorator để bảo vệ các route yêu cầu authentication
  async validateUser(accessToken: string): Promise<any> {
    const userData = await this.verifyAccessToken(accessToken);
    if (!userData) {
      throw new UnauthorizedException();
    }
    return userData;
  }
} 