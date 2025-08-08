# Kiến trúc Tổng thể - NestJS Notification Service 🏗️

## High-level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Apps   │    │  External Auth  │    │   Firebase FCM  │
│   (Mobile/Web)  │    │     Service     │    │   Push Service  │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │ HTTP/REST            │ Token Verify         │ Push Notifications
          │                      │                      │
          v                      v                      v
┌─────────────────────────────────────────────────────────────────┐
│                    NestJS API Service                           │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │ App Module  │  │ Auth Module │  │   Notification Module   │ │
│  │             │  │             │  │                         │ │
│  │ - Controller│  │ - AuthGuard │  │ - NotificationService   │ │
│  │ - Service   │  │ - AuthService│  │ - BuilderService        │ │
│  │             │  │             │  │ - PushWorkerService     │ │
│  │             │  │             │  │ - PushResponseService   │ │
│  │             │  │             │  │ - QueueService          │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐                              │
│  │Redis Service│  │Firebase Cfg │                              │
│  │             │  │ Service     │                              │
│  └─────────────┘  └─────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
          │                      │
          │                      │
          v                      v
┌─────────────────┐    ┌─────────────────┐
│     Redis       │    │    MongoDB      │
│   (Cache/Queue) │    │  (Persistence)  │
│                 │    │                 │
│ - User tokens   │    │ - Users         │
│ - Campaign data │    │ - Notifications │
│ - Response queue│    │ - Campaigns     │
└─────────────────┘    └─────────────────┘
```

## Core Modules

### 1. App Module (Root)
**Trách nhiệm**: Orchestration và configuration
- **Dependencies**: ConfigModule, TypeOrmModule
- **Imports**: NotificationModule, AuthModule
- **Configuration**: Database connection, global pipes, CORS

### 2. Auth Module
**Trách nhiệm**: Authentication và Authorization
- **AuthService**: Token verification với external service
- **AuthGuard**: Route protection với Bearer token
- **Pattern**: Dependency injection, HTTP client integration

### 3. Notification Module (Core Business)
**Trách nhiệm**: Business logic chính của hệ thống

#### Sub-services:
- **NotificationService**: CRUD operations, single notifications
- **NotificationBuilderService**: Campaign creation, user targeting
- **PushWorkerService**: Bulk notification processing
- **PushResponseService**: Result processing từ queue
- **QueueService**: Message queue management

## Data Flow

### Campaign Processing Flow
```
1. API Request (Create Campaign)
   ↓
2. NotificationBuilderService
   - Create campaign (status: building)
   - Get target users
   - Cache users in Redis
   - Update status: ready
   ↓
3. PushWorkerService (Background)
   - Update status: processing
   - Process users từ Redis queue
   - Send FCM notifications
   - Queue responses
   ↓
4. PushResponseService (Background)
   - Process response queue
   - Update notification status
   - Handle failed tokens
   - Update campaign metrics
```

### Authentication Flow
```
1. Client Request with Bearer token
   ↓
2. AuthGuard intercept
   ↓
3. AuthService.validateUser()
   - Call WordPress `/wp-json/jwt-auth/v1/token/validate`
   - Verify token is valid (code: `jwt_auth_valid_token` or HTTP 200)
   - Optionally decode JWT payload để lấy minimal claims (id/email) phục vụ authorization nội bộ
   ↓
4. Minimal user claims attached to request (không phụ thuộc dữ liệu `user` từ WordPress)
   ↓
5. Controller access with user context
```

## Technology Stack

### Core Framework
- **NestJS**: Node.js framework với TypeScript
- **TypeORM**: ORM cho MongoDB operations
- **Class-validator**: DTO validation
- **Swagger**: API documentation

### Data Layer
- **MongoDB**: Primary database (NoSQL)
- **Redis**: Caching và message queue
- **ioredis**: Redis client library

### External Services
- **Firebase Admin SDK**: Push notifications
- **WordPress Server**: JWT token verification và user management

### Development & Deployment
- **Docker**: Containerization
- **Docker Compose**: Multi-service orchestration
- **Jest**: Testing framework

## Environment Configuration

### Required Variables
```env
# Server
NODE_ENV=development|production
PORT=3000

# Database
MONGODB_URL=mongodb://admin:password123@localhost:27017/notification?authSource=admin

# Cache
REDIS_HOST=localhost
REDIS_PORT=6379

# External Services
WORDPRESS_AUTH_URL=https://your-wordpress.com/wp-json/jwt-auth/v1/token/validate
AUTH_VERIFY_URL=http://localhost:3000/api/auth/verify  # Fallback
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# Performance Tuning
QUEUE_RETRY_ATTEMPTS=3
QUEUE_RETRY_DELAY=5000
CAMPAIGN_BATCH_SIZE=100
```

## Design Principles

### 1. Separation of Concerns
- Mỗi service có trách nhiệm cụ thể
- Module isolation với clear interfaces
- Business logic tách biệt khỏi infrastructure

### 2. Dependency Injection
- Constructor injection pattern
- Interface-based dependencies
- Testable và mockable services

### 3. Async Processing
- Queue-based background processing
- Non-blocking campaign execution
- Scalable notification delivery

### 4. Error Resilience
- Graceful degradation
- Retry mechanisms
- Comprehensive error logging

### 5. Security First
- Authentication trên tất cả protected routes
- Authorization checks per resource
- Input validation và sanitization

## Scalability Considerations

### Horizontal Scaling
- Stateless API design
- Redis cho shared state
- Queue-based processing

### Performance Optimization
- Redis caching cho frequent data
- Batch processing cho campaigns
- Connection pooling cho databases

### Monitoring & Observability
- Structured logging với levels
- Health checks cho dependencies
- Metrics tracking cho business KPIs 