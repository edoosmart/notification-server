# NestJS Notification Service - Memory Bank 🧠

## Mục đích
Memory-bank này chứa tất cả knowledge, patterns và best practices cho dự án NestJS Notification Service. Được thiết kế để giúp team development maintain consistency và onboard nhanh.

## 📁 Cấu trúc Documentation

```
docs/
├── README.md                 # File này - tổng quan memory-bank
├── architecture/
│   ├── overview.md          # Kiến trúc tổng thể
│   ├── notification-flow.md # Luồng xử lý notification
│   └── service-patterns.md  # Service design patterns
├── data-layer/
│   ├── redis-patterns.md    # Redis caching strategies
│   ├── mongodb-schema.md    # Database schema design
│   └── dto-validation.md    # DTO và validation patterns
├── security/
│   ├── authentication.md   # Auth patterns và security
│   └── error-handling.md   # Error handling strategies
├── integrations/
│   ├── firebase.md         # Firebase integration
│   └── external-apis.md    # External API patterns
├── deployment/
│   ├── docker.md           # Docker và deployment
│   └── environment.md      # Environment configuration
└── api/
    ├── design-patterns.md  # API design patterns
    └── swagger-docs.md     # API documentation standards
```

## 🎯 Cách sử dụng Memory-Bank

### Cho Developers mới
1. Đọc `architecture/overview.md` để hiểu big picture
2. Xem `architecture/notification-flow.md` cho core business logic
3. Follow các patterns trong `data-layer/` và `security/`

### Cho Feature Development
1. Reference patterns từ folder tương ứng
2. Follow naming conventions và code standards
3. Update documentation khi có changes

### Cho Code Review
1. Check compliance với documented patterns
2. Ensure security practices được follow
3. Verify error handling đúng chuẩn

## 📋 Quick Reference

### Core Patterns
- **Authentication**: Bearer token + AuthGuard
- **Database**: MongoDB + TypeORM + ObjectId
- **Caching**: Redis với expiration
- **Validation**: class-validator + @ApiProperty
- **Error Handling**: Typed exceptions + Logger

### Key Files to Reference
- `src/notification/notification.service.ts` - Core business logic
- `src/config/redis.service.ts` - Caching patterns
- `src/auth/auth.guard.ts` - Authentication patterns
- `docker-compose.yml` - Deployment setup

## 🔄 Maintenance

Memory-bank cần được update khi:
- Thêm features mới có patterns khác
- Thay đổi architecture hoặc technology stack
- Discover best practices mới
- Fix security issues hoặc performance problems

## 📞 Support

Nếu có questions về patterns hoặc implementation:
1. Check documentation này trước
2. Reference code examples trong `src/`
3. Ask team lead nếu cần clarification

---
*Last updated: ${new Date().toISOString().split('T')[0]}* 