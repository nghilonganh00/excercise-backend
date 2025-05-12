// notification.controller.ts
import { Controller, Post, Body, UseGuards, Inject } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { REQUEST } from '@nestjs/core';

@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  @UseGuards(AuthGuard)
  @Post('register-token')
  async registerToken(@Body('token') token: string) {
    const userId = this.request['userId'];

    await this.notificationService.registerToken(userId, token);

    return { message: 'Token registered!' };
  }
}
