import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { HealthMetricHistoryService } from './health-metric-history.service';
import { CreateHealthMetricHistoryDto } from './dtos/create-health-metric-history.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { REQUEST } from '@nestjs/core';

@Controller('health-metric-history')
export class HealthMetricHistoryController {
  constructor(
    private readonly healthMetricHistoryService: HealthMetricHistoryService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  @UseGuards(AuthGuard)
  @Get('/latest')
  async getLatest() {
    const userId = this.request['userId'];
    console.log('userId: ', userId);
    return this.healthMetricHistoryService.handleGetLatest(userId);
  }

  @Get('range')
  @UseGuards(AuthGuard)
  async getHealthHistoryByMonthRange(
    @Query('month1') month1: number,
    @Query('month2') month2: number,
  ) {
    const userId = this.request['userId'];
    try {
      if (
        month1 < 1 ||
        month1 > 12 ||
        month2 < 1 ||
        month2 > 12 ||
        month1 > month2
      ) {
        throw new Error('Invalid month range');
      }
      return await this.healthMetricHistoryService.handleGetByMonthRange(
        userId,
        month1,
        month2,
      );
    } catch (error) {
      console.error('Error fetching health history by month range:', error);
      throw new Error('Error fetching health history by month range');
    }
  }

  @Post()
  @UseGuards(AuthGuard)
  async createHealthMetricHistory(
    @Body() createHealthMetricHistoryDto: CreateHealthMetricHistoryDto,
  ) {
    const userId = this.request['userId'];
    return this.healthMetricHistoryService.handleCreate(
      userId,
      createHealthMetricHistoryDto,
    );
  }
}
