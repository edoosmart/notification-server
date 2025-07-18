# WordPress Authentication Integration 🔐

## Overview
NestJS Notification Service tích hợp với WordPress server để verify user authentication thông qua Bearer token.

## Architecture

### Authentication Flow
```
1. Client Request với Bearer Token
   ↓
2. AuthGuard intercepts request
   ↓
3. AuthService calls WordPress API
   ↓
4. WordPress validates token
   ↓
5. WordPress returns user data
   ↓
6. AuthService normalizes user data
   ↓
7. User object attached to request
   ↓
8. Controller proceeds với authenticated user
```

### Integration Points
```
NestJS App ←→ WordPress Server
     │              │
     │              ├── /wp-json/wp/v2/users/me (REST API)
     │              ├── /wp-json/jwt-auth/v1/token/validate
     │              └── Custom endpoint for token validation
     │
     └── Normalized user object
```

## Implementation Details

### AuthService Configuration
```typescript
// Environment Variables
WORDPRESS_AUTH_URL=https://your-wordpress.com/wp-json/jwt-auth/v1/token/validate
AUTH_VERIFY_URL=https://your-wordpress.com/api/auth/verify  // Fallback
```

### WordPress API Endpoints

#### Option 1: JWT Authentication Plugin
```bash
# Recommended WordPress plugin: JWT Authentication for WP-API
# Endpoint: /wp-json/jwt-auth/v1/token/validate
```

**Request Format:**
```http
POST /wp-json/jwt-auth/v1/token/validate
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Response Format:**
```json
{
  "code": "jwt_auth_valid_token",
  "data": {
    "status": 200,
    "user": {
      "id": 1,
      "user_login": "admin",
      "user_email": "admin@example.com",
      "display_name": "Administrator",
      "user_nicename": "admin",
      "user_registered": "2024-01-01 00:00:00",
      "roles": ["administrator"],
      "capabilities": {
        "manage_options": true,
        "edit_posts": true
      }
    }
  }
}
```

#### Option 2: WordPress REST API
```bash
# Using built-in WordPress REST API
# Endpoint: /wp-json/wp/v2/users/me
```

**Request Format:**
```http
GET /wp-json/wp/v2/users/me
Authorization: Bearer <token>
```

**Response Format:**
```json
{
  "id": 1,
  "username": "admin",
  "name": "Administrator",
  "email": "admin@example.com",
  "roles": ["administrator"],
  "capabilities": {
    "manage_options": true
  }
}
```

#### Option 3: Custom WordPress Endpoint
```php
// In WordPress functions.php or custom plugin
add_action('rest_api_init', function() {
  register_rest_route('custom/v1', '/verify-token', array(
    'methods' => 'POST',
    'callback' => 'verify_user_token',
    'permission_callback' => '__return_true'
  ));
});

function verify_user_token($request) {
  $token = $request->get_header('authorization');
  
  // Your token validation logic
  $user = wp_get_current_user();
  
  if ($user->ID) {
    return new WP_REST_Response([
      'success' => true,
      'user' => [
        'id' => $user->ID,
        'user_email' => $user->user_email,
        'display_name' => $user->display_name,
        'roles' => $user->roles
      ]
    ], 200);
  }
  
  return new WP_Error('invalid_token', 'Invalid token', ['status' => 401]);
}
```

## Data Normalization

### WordPress User Fields → NestJS User Object
```typescript
interface WordPressUser {
  // WordPress Standard Fields
  id: number;                    // WordPress user ID
  user_login: string;            // Username
  user_email: string;            // Email address
  display_name: string;          // Display name
  user_nicename: string;         // URL-friendly username
  user_registered: string;       // Registration date
  roles: string[];               // User roles
  capabilities: object;          // User capabilities

  // Alternative field names (different plugins)
  ID?: number;                   // Alternative ID field
  email?: string;                // Alternative email field
  name?: string;                 // Alternative name field
  username?: string;             // Alternative username field
}

interface NormalizedUser {
  // Normalized Application Fields
  id: string;                    // Primary identifier
  email: string;                 // Email address
  name: string;                  // Display name
  username: string;              // Username
  roles: string[];               // User roles
  capabilities: object;          // Permissions

  // WordPress Specific Fields
  wordpressId: number;           // Original WordPress ID
  nicename?: string;             // URL-friendly name
  registeredDate?: string;       // Registration timestamp
}
```

### Normalization Logic
```typescript
private normalizeWordPressUser(wordpressData: any): any {
  return {
    // Primary fields với fallbacks
    id: wordpressData.user?.id || wordpressData.user?.ID,
    email: wordpressData.user?.user_email || wordpressData.user?.email,
    name: wordpressData.user?.display_name || wordpressData.user?.name,
    username: wordpressData.user?.user_login || wordpressData.user?.username,
    
    // Permission fields
    roles: wordpressData.user?.roles || [],
    capabilities: wordpressData.user?.capabilities || {},
    
    // WordPress specific tracking
    wordpressId: wordpressData.user?.id || wordpressData.user?.ID,
    nicename: wordpressData.user?.user_nicename,
    registeredDate: wordpressData.user?.user_registered,
  };
}
```

## Error Handling

### Common WordPress API Errors
```typescript
// WordPress JWT Plugin Errors
{
  "code": "jwt_auth_invalid_token",
  "message": "Token is invalid",
  "data": { "status": 401 }
}

// WordPress REST API Errors  
{
  "code": "rest_user_invalid_id",
  "message": "Invalid user ID.",
  "data": { "status": 401 }
}

// Network/Connection Errors
{
  "code": "ECONNREFUSED",
  "message": "Connection refused"
}
```

### Error Handling Strategy
```typescript
try {
  const response = await this.httpService.post(wordpressUrl, {}, options);
  
  // Validate response structure
  if (!response.data || !response.data.user) {
    throw new UnauthorizedException('Invalid token response from WordPress');
  }
  
  return this.normalizeWordPressUser(response.data);
  
} catch (error) {
  // Log for debugging (no sensitive data)
  console.error('WordPress auth verification failed:', {
    message: error.message,
    status: error.response?.status,
    url: wordpressUrl.replace(/\/\/.*@/, '//***@'), // Hide credentials
  });
  
  // Always throw generic error to client
  throw new UnauthorizedException('Invalid access token');
}
```

## Security Considerations

### 1. Token Security
- **Never log tokens** trong application logs
- **Use HTTPS** cho WordPress communication
- **Validate token format** before sending to WordPress
- **Set timeouts** để prevent hanging requests

### 2. WordPress Security
- **Use JWT plugins** với proper secret key rotation
- **Implement rate limiting** on WordPress endpoints
- **Monitor failed authentication attempts**
- **Keep WordPress updated** và secure

### 3. Network Security
- **Use private networks** nếu possible cho internal communication
- **Implement retry logic** với exponential backoff
- **Monitor WordPress server health**
- **Have fallback authentication** mechanisms

## Configuration

### Environment Variables
```env
# WordPress Authentication
WORDPRESS_AUTH_URL=https://your-wordpress.com/wp-json/jwt-auth/v1/token/validate
AUTH_VERIFY_URL=https://your-wordpress.com/api/auth/verify  # Fallback

# Network Configuration
AUTH_TIMEOUT=10000                    # Request timeout (ms)
AUTH_RETRY_ATTEMPTS=3                 # Retry attempts
AUTH_RETRY_DELAY=1000                # Retry delay (ms)

# WordPress Specific
WORDPRESS_API_NAMESPACE=jwt-auth/v1   # API namespace
WORDPRESS_VALIDATE_ENDPOINT=token/validate
```

### Docker Environment
```yaml
# docker-compose.yml
services:
  api:
    environment:
      - WORDPRESS_AUTH_URL=https://wordpress.example.com/wp-json/jwt-auth/v1/token/validate
      - AUTH_TIMEOUT=10000
```

## Testing

### Unit Testing
```typescript
describe('AuthService WordPress Integration', () => {
  it('should verify valid WordPress token', async () => {
    const mockWordPressResponse = {
      data: {
        user: {
          id: 1,
          user_email: 'test@example.com',
          display_name: 'Test User',
          roles: ['subscriber']
        }
      }
    };
    
    httpService.post.mockResolvedValue(mockWordPressResponse);
    
    const result = await authService.verifyAccessToken('valid-token');
    
    expect(result.id).toBe(1);
    expect(result.email).toBe('test@example.com');
  });

  it('should handle WordPress API errors', async () => {
    httpService.post.mockRejectedValue(new Error('WordPress unavailable'));
    
    await expect(authService.verifyAccessToken('invalid-token'))
      .rejects.toThrow(UnauthorizedException);
  });
});
```

### Integration Testing
```bash
# Test WordPress connectivity
curl -X POST https://your-wordpress.com/wp-json/jwt-auth/v1/token/validate \
  -H "Authorization: Bearer your-test-token" \
  -H "Content-Type: application/json"

# Test NestJS endpoint
curl -X GET http://localhost:3000/api/notifications/users/123 \
  -H "Authorization: Bearer wordpress-jwt-token"
```

## Monitoring & Debugging

### Logging Strategy
```typescript
// Log successful authentications (no sensitive data)
console.log('WordPress auth success:', {
  userId: normalizedUser.id,
  email: normalizedUser.email.replace(/(?<=.{2}).*(?=@)/, '***'),
  roles: normalizedUser.roles,
  timestamp: new Date().toISOString()
});

// Log authentication failures
console.error('WordPress auth failed:', {
  error: error.message,
  statusCode: error.response?.status,
  timestamp: new Date().toISOString()
});
```

### Health Checks
```typescript
// Add WordPress connectivity health check
@Injectable()
export class WordPressHealthService {
  async checkWordPressConnectivity(): Promise<boolean> {
    try {
      const response = await this.httpService.get(
        `${this.wordpressUrl}/wp-json/wp/v2`,
        { timeout: 5000 }
      ).toPromise();
      
      return response.status === 200;
    } catch {
      return false;
    }
  }
}
```

### Metrics to Track
- **Authentication success/failure rates**
- **WordPress API response times**
- **Token validation latency**
- **Error rates by WordPress endpoint**
- **User role distribution**

## Troubleshooting

### Common Issues

#### 1. WordPress Plugin Not Configured
```bash
# Error: "rest_route_not_found"
# Solution: Install and configure JWT Authentication plugin
```

#### 2. CORS Issues
```javascript
// WordPress: Add CORS headers
add_action('init', function() {
  header('Access-Control-Allow-Origin: https://your-nestjs-app.com');
  header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
  header('Access-Control-Allow-Headers: Authorization, Content-Type');
});
```

#### 3. Token Format Issues
```typescript
// Validate token format before sending
const tokenPattern = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
if (!tokenPattern.test(token)) {
  throw new UnauthorizedException('Invalid token format');
}
```

#### 4. Network Timeouts
```typescript
// Increase timeout và add retry logic
const config = {
  timeout: 15000,
  retry: 3,
  retryDelay: 2000
};
```

---
*Documentation updated: 2024-01-15*
*WordPress Integration Version: 1.0* 