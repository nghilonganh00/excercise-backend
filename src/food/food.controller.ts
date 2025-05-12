import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { FoodService } from './food.service';
import { ParamQueryDto } from './dto/param-query.dto';

@Controller('foods')
export class FoodController {
  constructor(private readonly foodService: FoodService) {}

  @Get()
  async findAll(@Query() query: ParamQueryDto) {
    return this.foodService.getAllFoods(query);
  }

  @Get('popular')
  async getPopularFoods() {
    return this.foodService.getPopularFoods();
  }

  @Get(':foodId')
  async findById(@Param('foodId', ParseIntPipe) foodId: Number) {
    return this.foodService.handleGetById(foodId);
  }
}
