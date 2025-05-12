import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module';
import { ConfigModule } from '@nestjs/config';
import { FoodModule } from './food/food.module';
import { HealthMetricHistoryModule } from './health-metric-history/health-metric-history.module';
import { MealScheduleModule } from './meal-schedule/meal-schedule.module';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisModule } from '@nestjs-modules/ioredis';
import { TrainingSessionModule } from './training-session/training-session.module';
import { NotificationModule } from './notification/notification.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    ConfigModule.forRoot({}),
    CacheModule.register({ isGlobal: true }),
    RedisModule.forRoot({
      type: 'single',
      url: 'redis://localhost:6379',
    }),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    SupabaseModule,
    FoodModule,
    HealthMetricHistoryModule,
    MealScheduleModule,
    TrainingSessionModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
