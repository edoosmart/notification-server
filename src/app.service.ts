import { Injectable } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class AppService {
  getHello() {
    return { message: 'Post successful' };
  }
}
