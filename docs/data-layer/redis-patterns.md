# Redis Patterns & Caching Strategies 💾

## Overview
Redis service trong project này handle cả caching và message queue functionality. Được thiết kế để optimize performance và enable scalable background processing.

## Service Architecture

```typescript
@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly redis: Redis;
  
  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });
  }
}
```

## Key Patterns

### 1. User Token Management

#### Pattern: Simple Key-Value với expiration
```typescript
// Set user FCM token
async setUserToken(userId: string, token: string): Promise<void> {
  await this.redis.set(`user:${userId}:token`, token);
}

// Get user FCM token
async getUserToken(userId: string): Promise<string | null> {
  return this.redis.get(`user:${userId}:token`);
}

// Remove invalid token
async removeUserToken(userId: string): Promise<void> {
  await this.redis.del(`user:${userId}:token`);
}
```

**Key Format**: `user:{userId}:token`
**Use Cases**: 
- Cache FCM tokens cho quick access
- Automatic cleanup khi token invalid
- Performance optimization cho push notifications

### 2. Campaign Data Management

#### Pattern: List-based Queue với Expiration
```typescript
// Store campaign users as queue
async setCampaignUsers(
  campaignKey: string, 
  users: Array<{ userId: string; fcmToken?: string }>
): Promise<void> {
  await this.redis.del(campaignKey); // Clear existing
  if (users.length > 0) {
    await this.redis.rpush(campaignKey, ...users.map(u => JSON.stringify(u)));
  }
  // Critical: Set expiry để tránh memory leak
  await this.redis.expire(campaignKey, 24 * 60 * 60);
}

// Process campaign users (FIFO queue)
async getCampaignUser(campaignKey: string): Promise<{userId: string; fcmToken?: string} | null> {
  const userData = await this.redis.lpop(campaignKey);
  if (!userData) return null;
  return JSON.parse(userData);
}

// Monitor campaign progress
async getCampaignLength(campaignKey: string): Promise<number> {
  return this.redis.llen(campaignKey);
}
```

**Key Format**: `campaign:{campaignId}`
**Use Cases**:
- Queue users cho bulk processing
- Track campaign progress
- Memory-efficient batch processing
- Auto-cleanup sau 24h

### 3. Response Queue Management

#### Pattern: Message Queue với Error Handling
```typescript
// Enqueue notification response
async pushToQueue(queueKey: string, data: any): Promise<void> {
  await this.redis.rpush(queueKey, JSON.stringify(data));
}

// Dequeue for processing
async popFromQueue(queueKey: string): Promise<any | null> {
  const data = await this.redis.lpop(queueKey);
  if (!data) return null;
  return JSON.parse(data);
}

// Monitor queue size
async getQueueLength(queueKey: string): Promise<number> {
  return this.redis.llen(queueKey);
}
```

**Key Format**: `notification:responses`
**Use Cases**:
- Async result processing
- Decoupling notification sending và status updates
- Reliable message delivery
- Dead letter queue cho failed messages

## Memory Management Best Practices

### 1. Always Set Expiration
```typescript
// ✅ Good - Prevents memory leak
await this.redis.set('temp:data', value);
await this.redis.expire('temp:data', 3600); // 1 hour

// ❌ Bad - Memory leak risk
await this.redis.set('temp:data', value);
// No expiration = memory leak
```

### 2. Clean Up Pattern
```typescript
// Cleanup strategy cho campaigns
async cleanupCampaign(campaignId: string): Promise<void> {
  const campaignKey = `campaign:${campaignId}`;
  await this.redis.del(campaignKey);
  
  // Optional: Cleanup related keys
  const responseKey = `campaign:${campaignId}:responses`;
  await this.redis.del(responseKey);
}
```

### 3. Batch Operations
```typescript
// ✅ Efficient batch operations
const pipeline = this.redis.pipeline();
users.forEach(user => {
  pipeline.set(`user:${user.id}:token`, user.token);
});
await pipeline.exec();

// ❌ Inefficient individual operations
for (const user of users) {
  await this.redis.set(`user:${user.id}:token`, user.token);
}
```

## Error Handling Patterns

### 1. Connection Resilience
```typescript
async safeRedisOperation<T>(operation: () => Promise<T>): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    this.logger.error('Redis operation failed:', error);
    return null;
  }
}

// Usage
const token = await this.safeRedisOperation(() => 
  this.getUserToken(userId)
);
```

### 2. Fallback Strategies
```typescript
async getUserTokenWithFallback(userId: string): Promise<string | null> {
  // Try Redis first
  let token = await this.getUserToken(userId);
  
  if (!token) {
    // Fallback to database
    const user = await this.userRepository.findOne({where: {id: userId}});
    token = user?.fcmToken || null;
    
    // Update cache for next time
    if (token) {
      await this.setUserToken(userId, token);
    }
  }
  
  return token;
}
```

## Performance Optimization

### 1. Connection Pooling
```typescript
// Configure connection options
this.redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});
```

### 2. Pipeline for Bulk Operations
```typescript
async bulkUpdateTokens(updates: {userId: string, token: string}[]): Promise<void> {
  const pipeline = this.redis.pipeline();
  
  updates.forEach(({userId, token}) => {
    pipeline.set(`user:${userId}:token`, token);
  });
  
  await pipeline.exec();
}
```

### 3. Smart Caching Strategy
```typescript
// Cache frequently accessed data
async getCachedUserProfile(userId: string): Promise<UserProfile | null> {
  const cached = await this.redis.get(`profile:${userId}`);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Fetch from database
  const profile = await this.userService.getProfile(userId);
  
  if (profile) {
    // Cache for 1 hour
    await this.redis.setex(`profile:${userId}`, 3600, JSON.stringify(profile));
  }
  
  return profile;
}
```

## Monitoring & Debugging

### 1. Key Naming Conventions
```typescript
// Use consistent prefixes
const USER_TOKEN_PREFIX = 'user:';
const CAMPAIGN_PREFIX = 'campaign:';
const QUEUE_PREFIX = 'queue:';

// Easy to monitor và cleanup
async getKeysByPattern(pattern: string): Promise<string[]> {
  return this.redis.keys(pattern);
}
```

### 2. Metrics Collection
```typescript
async getRedisStats(): Promise<RedisStats> {
  const info = await this.redis.info();
  return {
    connectedClients: parseInt(info.match(/connected_clients:(\d+)/)?.[1] || '0'),
    usedMemory: parseInt(info.match(/used_memory:(\d+)/)?.[1] || '0'),
    totalKeys: await this.redis.dbsize(),
  };
}
```

### 3. Health Checks
```typescript
async isRedisHealthy(): Promise<boolean> {
  try {
    const pong = await this.redis.ping();
    return pong === 'PONG';
  } catch (error) {
    return false;
  }
}
```

## Common Pitfalls & Solutions

### ❌ Problem: Memory Leaks
```typescript
// Không set expiration
await this.redis.set('temp:data', largeObject);
```

### ✅ Solution: Auto Expiration
```typescript
await this.redis.setex('temp:data', 3600, largeObject);
```

### ❌ Problem: Blocking Operations
```typescript
// Sync operations block event loop
const keys = await this.redis.keys('user:*'); // Bad for large datasets
```

### ✅ Solution: Async Iterations
```typescript
// Use SCAN for large datasets
const stream = this.redis.scanStream({match: 'user:*'});
stream.on('data', (keys) => {
  // Process keys in batches
});
```

### ❌ Problem: Race Conditions
```typescript
// Check-then-set race condition
const exists = await this.redis.exists(key);
if (!exists) {
  await this.redis.set(key, value); // Another process might have set it
}
```

### ✅ Solution: Atomic Operations
```typescript
// Use atomic operations
await this.redis.setnx(key, value); // Set if not exists
``` 