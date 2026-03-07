import { Controller, Get, Post, Body } from '@nestjs/common';
import { DishesService } from './dishes.service';

@Controller('dishes')
export class DishesController {
  constructor(private readonly dishesService: DishesService) {}

  @Get()
  async findAll() {
    const dishes = await this.dishesService.findAll();
    return {
      code: 200,
      msg: '获取菜品列表成功',
      data: dishes,
    };
  }
}
