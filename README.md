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

### Notifications
- `POST /api/notifications/send` - Gửi thông báo
- `GET /api/notifications/users/:userId` - Lấy danh sách thông báo của người dùng
- `PUT /api/notifications/read/:notificationId` - Đánh dấu thông báo đã đọc

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
NODE_ENV=development
MONGO_URI=mongodb://admin:password123@localhost:27017/notification?authSource=admin
REDIS_HOST=localhost
REDIS_PORT=6379
```

## License

[MIT licensed](LICENSE)
