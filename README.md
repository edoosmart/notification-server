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

Service quản lý và gửi thông báo sử dụng NestJS framework, MongoDB và Redis.

## Yêu cầu hệ thống

- Docker và Docker Compose
- Node.js v20 hoặc cao hơn (nếu chạy không dùng Docker)

## Cài đặt và Chạy với Docker

### 1. Khởi động toàn bộ services

```bash
# Build và chạy tất cả services
docker-compose up --build

# Chạy ở chế độ detached (chạy ngầm)
docker-compose up -d --build
```

Sau khi chạy xong, các services sẽ có sẵn tại:
- API: http://localhost:3000
- MongoDB Express: http://localhost:8081
  - Username: dev
  - Password: dev123

### 2. Quản lý containers

```bash
# Xem logs
docker-compose logs -f

# Dừng services
docker-compose stop

# Dừng và xóa containers
docker-compose down

# Dừng và xóa containers + volumes
docker-compose down -v
```

### 3. Thao tác với MongoDB

```bash
# Truy cập MongoDB shell
docker exec -it mongo mongosh -u admin -p password123 --authenticationDatabase admin

# Một số lệnh MongoDB hữu ích
use notification
show collections
db.users.find()
db.notifications.find()
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
│   │   ├── schemas/     # MongoDB schemas
│   │   └── ...
│   └── ...
├── docker-compose.yml    # Cấu hình Docker Compose
├── Dockerfile           # Cấu hình build Docker image
└── ...
```

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
