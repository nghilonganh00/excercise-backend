import { Module } from '@nestjs/common';
import { HealthMetricHistoryController } from './health-metric-history.controller';
import { HealthMetricHistoryService } from './health-metric-history.service';

@Module({
  controllers: [HealthMetricHistoryController],
  providers: [HealthMetricHistoryService]
})
export class HealthMetricHistoryModule {}
