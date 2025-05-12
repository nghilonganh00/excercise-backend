// notification.service.ts
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { Expo } from 'expo-server-sdk';

@Injectable()
export class NotificationService {
  constructor(
    @InjectQueue('notificationQueue') private notificationQueue: Queue,
  ) {}

  private expo = new Expo();
  private userTokens: any[] = [];

  async registerToken(userId: string, token: string) {
    if (!this.userTokens.includes(token)) {
      this.userTokens.push({ userId, token });
    }
  }

  async scheduleNotification(
    userId: string,
    title: string,
    body: string,
    delayMs: number,
  ) {
    await this.notificationQueue.add(
      'sendNotification',
      {
        userId,
        title,
        body,
      },
      {
        delay: delayMs,
        attempts: 3,
      },
    );
  }

  async sendPushNotification(userId: string, title: string, body: string) {
    console.log('send push noti: ', this.userTokens);
    const pushToken = this.userTokens.find(
      (item) => item.userId === userId,
    ).token;
    console.log('push token: ', pushToken);
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`❌ Token không hợp lệ: ${pushToken}`);
      return;
    }

    const message = {
      to: pushToken,
      sound: 'default',
      title,
      body,
      data: { screen: 'Home' },
    };

    try {
      const receipt = await this.expo.sendPushNotificationsAsync([message]);
      console.log('✅ Notification sent:', receipt);
    } catch (err) {
      console.error('❌ Gửi thất bại:', err);
    }
  }
}
