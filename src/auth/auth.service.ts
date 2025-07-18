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
      // Gọi WordPress API để verify token
      const wordpressUrl = this.configService.get<string>('WORDPRESS_AUTH_URL') || 
                          this.configService.get<string>('AUTH_VERIFY_URL') || 
                          'http://localhost:3000/api/auth/verify';
      
      const response = await firstValueFrom(
        this.httpService.post(
          wordpressUrl,
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            timeout: 10000, // 10 second timeout
          }
        )
      );

      // Validate WordPress response structure
      if (!response.data || !response.data.user) {
        throw new UnauthorizedException('Invalid token response from WordPress');
      }

      // Trả về thông tin user từ WordPress
      return this.normalizeWordPressUser(response.data);
    } catch (error) {
      // Log error for debugging (without sensitive info)
      console.error('WordPress auth verification failed:', {
        message: error.message,
        status: error.response?.status,
        // Don't log the token for security
      });
      
      throw new UnauthorizedException('Invalid access token');
    }
  }

  private normalizeWordPressUser(wordpressData: any): any {
    // Normalize WordPress user data to our application format
    return {
      id: wordpressData.user?.id || wordpressData.user?.ID,
      email: wordpressData.user?.user_email || wordpressData.user?.email,
      name: wordpressData.user?.display_name || wordpressData.user?.name,
      username: wordpressData.user?.user_login || wordpressData.user?.username,
      roles: wordpressData.user?.roles || [],
      capabilities: wordpressData.user?.capabilities || {},
      // WordPress specific fields
      wordpressId: wordpressData.user?.id || wordpressData.user?.ID,
      nicename: wordpressData.user?.user_nicename,
      registeredDate: wordpressData.user?.user_registered,
    };
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