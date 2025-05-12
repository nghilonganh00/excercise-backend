import { Job } from 'bull';
import { NotificationService } from './notification.service';
import { Process, Processor } from '@nestjs/bull';

@Processor('notificationQueue')
export class NotificationProcessor {
  constructor(private readonly notificationService: NotificationService) {}

  @Process('sendNotification')
  async handleSendNotification(job: Job) {
    console.log('send notification: ', job.data);
    const { userId, title, body } = job.data;
    await this.notificationService.sendPushNotification(userId, title, body);
  }
}
