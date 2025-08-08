import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

interface AuthenticatedUser {
  readonly isAuthenticated: boolean;
  readonly id?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async verifyAccessToken(accessToken: string): Promise<AuthenticatedUser> {
    try {
      // Gọi WordPress API để verify token (sử dụng endpoint validate)
      const wordpressUrl =
        this.configService.get<string>('WORDPRESS_AUTH_URL') ||
        this.configService.get<string>('AUTH_VERIFY_URL') ||
        'https://devapp.practice.edoosmart.com/wp-json/jwt-auth/v1/token/validate';
      const response = await firstValueFrom(
        this.httpService.post(
          wordpressUrl,
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          },
        )
      );

      // Hợp lệ nếu code là 'jwt_auth_valid_token' hoặc HTTP 200
      const isValid =
        response?.data?.code === 'jwt_auth_valid_token' || response?.status === 200;
      if (!isValid) {
        throw new UnauthorizedException('Token validation failed');
      }

      // Decode payload để trích xuất userId (nếu có)
      const payload = this.decodeJwtWithoutVerify(accessToken);
      const normalized = this.normalizeFromPayload(payload ?? {});
      return { isAuthenticated: true, ...normalized };
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

  private decodeJwtWithoutVerify(token: string): Record<string, unknown> | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
      const json = Buffer.from(padded, 'base64').toString('utf8');
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  private normalizeFromPayload(payload: Record<string, unknown>): Omit<AuthenticatedUser, 'isAuthenticated'> {
    const nestedUser: any = (payload as any)?.user || (payload as any)?.data?.user || payload;
    const idCandidate = (nestedUser?.sub ?? nestedUser?.id ?? nestedUser?.ID ?? nestedUser?.user_id ?? '') as
      | string
      | number;
    const id = idCandidate !== undefined && idCandidate !== null && `${idCandidate}`.length > 0 ? `${idCandidate}` : undefined;
    return { id };
  }

  // Tạo decorator để bảo vệ các route yêu cầu authentication
  async validateUser(accessToken: string): Promise<AuthenticatedUser> {
    const userData = await this.verifyAccessToken(accessToken);
    if (!userData) {
      throw new UnauthorizedException();
    }
    return userData;
  }
} 