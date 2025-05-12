import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationProcessor } from './notification.processor';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notificationQueue',
    }),
  ],
  providers: [NotificationService, NotificationProcessor],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
