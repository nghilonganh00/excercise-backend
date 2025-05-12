import { Controller, Get, Query } from '@nestjs/common';
import { TrainingSessionService } from './training-session.service';

@Controller('training-session')
export class TrainingSessionController {
  constructor(
    private readonly trainingSessionService: TrainingSessionService,
  ) {}

  @Get()
  async getTrainingSessionOnSchedule(@Query('date') date: string) {
    return this.trainingSessionService.handleGetAll(date);
  }

  @Get('duration')
  async getTrainingSessionByDuration(@Query('duration') duration: string) {
    return this.trainingSessionService.handleGetAllByDuration(duration);
  }
}
