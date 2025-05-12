import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MealScheduleService } from './meal-schedule.service';
import { CreateScheduleDto } from './dtos/create-schedule.dto';
import { UpdateScheduleDto } from './dtos/update-schedule.dto';
import { REQUEST } from '@nestjs/core';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('meal-schedule')
export class MealScheduleController {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly mealScheduleService: MealScheduleService,
  ) {}

  @UseGuards(AuthGuard)
  @Get('/foods')
  async getFoodsOnSchedule(@Query('date') date: string) {
    const userId = this.request['userId'];
    return this.mealScheduleService.handleGetFoodsOnSchedule(userId, date);
  }

  @UseGuards(AuthGuard)
  @Get('/nutrition')
  async getNutrition(@Query('duration') duration: string) {
    const userId = this.request['userId'];
    return this.mealScheduleService.handleGetNutrition(userId, duration);
  }

  @UseGuards(AuthGuard)
  @Get('/:id')
  async getDetail(@Param('id') id: number) {
    const userId = this.request['userId'];
    return this.mealScheduleService.handleGetDetail(userId, id);
  }

  @UseGuards(AuthGuard)
  @Post()
  async createSchedule(@Body() newMealSchedule: CreateScheduleDto) {
    const userId = this.request['userId'];
    return this.mealScheduleService.handleCreate(userId, newMealSchedule);
  }

  @UseGuards(AuthGuard)
  @Put('/:id')
  async updateSchedule(
    @Param('id') id: number,
    @Body() updatedScheduleDto: UpdateScheduleDto,
  ) {
    const userId = this.request['userId'];
    return this.mealScheduleService.handleUpdate(
      userId,
      id,
      updatedScheduleDto,
    );
  }

  @UseGuards(AuthGuard)
  @Delete('/:id')
  async deleteSchedule(@Param('id') id: number) {
    const userId = this.request['userId'];
    return this.mealScheduleService.handleRemove(userId, id);
  }
}
