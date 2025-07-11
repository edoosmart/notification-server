import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://192.168.1.16:3000/',
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3003);
}
bootstrap();
