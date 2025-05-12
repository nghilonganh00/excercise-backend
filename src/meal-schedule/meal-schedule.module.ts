import { Module } from '@nestjs/common';
import { MealScheduleController } from './meal-schedule.controller';
import { MealScheduleService } from './meal-schedule.service';
import { NotificationModule } from 'src/notification/notification.module';
import { NotificationService } from 'src/notification/notification.service';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    NotificationModule,
    BullModule.registerQueue({
      name: 'notificationQueue',
    }),
  ],
  controllers: [MealScheduleController],
  providers: [MealScheduleService, NotificationService],
})
export class MealScheduleModule {}
