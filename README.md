<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# NestJS Notification Service

## Mô tả

Service quản lý và gửi thông báo sử dụng NestJS framework, MongoDB (với TypeORM) và Redis.

## Luồng hoạt động

### 1. Tạo và Gửi Notification

1. **Web Backend tạo Campaign**
   - Client gửi request tạo campaign thông qua API
   - Hệ thống lưu thông tin campaign vào database
   - Trạng thái ban đầu: `pending`

2. **Builder Service xử lý Campaign**
   - Polling campaign mới từ database
   - Build danh sách users cần gửi notification
   - Lưu danh sách users và tokens vào Redis
   - Cập nhật trạng thái campaign: `ready`

3. **Push Worker xử lý gửi Notification**
   - Lấy thông tin users và tokens từ Redis
   - Gửi notification qua Firebase Cloud Messaging
   - Ghi nhận kết quả gửi vào Response Queue
   - Cập nhật tiến độ gửi trong database

4. **Response Service xử lý kết quả**
   - Lấy kết quả từ Response Queue
   - Cập nhật trạng thái notification trong database
   - Cập nhật token state trong Redis (nếu token không hợp lệ)
   - Xử lý retry nếu cần thiết

### 2. Trạng thái Notification

Campaign có các trạng thái sau:
- `pending`: Mới được tạo
- `building`: Đang build danh sách users
- `ready`: Sẵn sàng để gửi
- `processing`: Đang trong quá trình gửi
- `completed`: Đã gửi xong
- `failed`: Gặp lỗi trong quá trình xử lý

Mỗi notification riêng lẻ có các trạng thái:
- `pending`: Chưa gửi
- `delivered`: Đã gửi thành công
- `failed`: Gửi thất bại
- `read`: Người dùng đã đọc

### 3. Xử lý Token

- FCM tokens được lưu trữ trong Redis để truy cập nhanh
- Tokens không hợp lệ sẽ tự động được xóa
- Users có thể cập nhật token mới qua API

### 4. Monitoring và Debug

- Theo dõi tiến độ gửi qua API
- Logs chi tiết cho từng bước xử lý
- Thống kê tỷ lệ thành công/thất bại
- Hỗ trợ retry cho các notification thất bại

## Yêu cầu hệ thống

- Docker và Docker Compose
- Node.js v20 hoặc cao hơn (nếu chạy không dùng Docker)

## Cài đặt và Chạy với Docker

### 1. Cấu hình Firebase

- Tạo thư mục `config` trong thư mục gốc của project
- Copy file `firebase-key.json` vào thư mục `config`
- File này sẽ được tự động mount vào container

### 2. Các Services trong Docker

Project bao gồm các services sau:
- **api**: NestJS application
  - Port: 3000
  - Volumes: Tự động mount firebase-key.json
  - Dependencies: Đợi MongoDB và Redis khởi động xong

- **redis**: Redis server
  - Port: 6379
  - Volume: Persistent data storage
  - Không yêu cầu authentication

- **mongo**: MongoDB server
  - Port: 27017
  - Volume: Persistent data storage
  - Authentication: Enabled
  - Credentials:
    - Username: admin
    - Password: password123
  - Health check: Tự động kiểm tra kết nối

- **mongo-seed**: Service khởi tạo dữ liệu
  - Tự động chạy script khởi tạo
  - Đợi MongoDB sẵn sàng mới chạy
  - Volume: Mount thư mục migrations

- **mongo-express**: MongoDB Web UI
  - Port: 8081
  - Credentials:
    - Username: dev
    - Password: dev123
  - Đợi MongoDB sẵn sàng mới khởi động

### 3. Khởi động Docker

```bash
# Build và chạy tất cả services
docker-compose up --build

# Chạy ở chế độ detached (chạy ngầm)
docker-compose up -d --build
```

### 4. Quản lý Docker

```bash
# Xem logs của tất cả services
docker-compose logs -f

# Xem logs của service cụ thể
docker-compose logs -f api
docker-compose logs -f mongo

# Khởi động lại service
docker-compose restart api

# Dừng services
docker-compose stop

# Dừng và xóa containers
docker-compose down

# Dừng và xóa containers + volumes (xóa dữ liệu)
docker-compose down -v

# Rebuild một service cụ thể
docker-compose up -d --build api
```

### 5. Thao tác với MongoDB

```bash
# Truy cập MongoDB shell
docker exec -it mongo mongosh -u admin -p password123 --authenticationDatabase admin

# Một số lệnh MongoDB hữu ích
use notification
show collections
db.users.find()
db.notifications.find()
```

### 6. Kiểm tra logs và debug

```bash
# Xem logs realtime của api
docker-compose logs -f api

# Kiểm tra status của các services
docker-compose ps

# Kiểm tra resource usage
docker stats
```

## Cài đặt và Chạy không dùng Docker

```bash
# Cài đặt dependencies
$ npm install

# Chạy ở môi trường development
$ npm run start

# Chạy với watch mode
$ npm run start:dev

# Chạy ở môi trường production
$ npm run start:prod
```

## Cấu trúc Project

```
nestjs-server/
├── src/
│   ├── config/           # Cấu hình Firebase và Redis
│   ├── notification/     # Module xử lý thông báo
│   │   ├── dto/         # Data Transfer Objects
│   │   ├── entities/    # TypeORM Entities
│   │   └── ...
│   └── ...
├── docker-compose.yml    # Cấu hình Docker Compose
├── Dockerfile           # Cấu hình build Docker image
└── ...
```

## Công nghệ sử dụng

- NestJS - Framework Node.js
- TypeORM - ORM cho MongoDB
- Redis - Cache và quản lý token
- MongoDB - Cơ sở dữ liệu chính
- Docker - Container hóa ứng dụng

## API Endpoints

### Users
- `POST /api/notifications/users` - Tạo người dùng mới
- `PUT /api/notifications/users/:userId` - Cập nhật thông tin người dùng
- `GET /api/notifications/users/:userId` - Lấy thông tin người dùng

### Notifications
- `POST /api/notifications/send` - Gửi thông báo đơn lẻ
- `GET /api/notifications/users/:userId` - Lấy danh sách thông báo của người dùng
- `PUT /api/notifications/read/:notificationId` - Đánh dấu thông báo đã đọc

### Campaigns
- `POST /api/notifications/campaigns` - Tạo campaign mới
- `GET /api/notifications/campaigns` - Lấy danh sách campaigns
- `GET /api/notifications/campaigns/:campaignId` - Lấy thông tin chi tiết campaign
- `GET /api/notifications/campaigns/:campaignId/status` - Lấy trạng thái và tiến độ của campaign

### Response Tracking
- `GET /api/notifications/campaigns/:campaignId/stats` - Lấy thống kê gửi notification
- `GET /api/notifications/campaigns/:campaignId/failures` - Lấy danh sách gửi thất bại
- `POST /api/notifications/campaigns/:campaignId/retry` - Thử gửi lại các notification thất bại

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Tài liệu API

Sau khi khởi động server, bạn có thể truy cập documentation của API tại:
http://localhost:3000/api

## Môi trường

File `.env` cần có các biến môi trường sau:
```env
# Server
NODE_ENV=development
PORT=3000

# MongoDB
MONGODB_URL=mongodb://admin:password123@localhost:27017/notification?authSource=admin

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# Authentication
AUTH_VERIFY_URL=http://localhost:3000/api/auth/verify

# Queue Configuration
QUEUE_RETRY_ATTEMPTS=3
QUEUE_RETRY_DELAY=5000
QUEUE_PROCESS_TIMEOUT=30000

# Campaign Configuration
CAMPAIGN_BATCH_SIZE=100
CAMPAIGN_PROCESS_INTERVAL=5000
```

Các biến môi trường này có thể được cấu hình trong file `.env` hoặc thông qua Docker environment variables trong `docker-compose.yml`.

## License

[MIT licensed](LICENSE)
