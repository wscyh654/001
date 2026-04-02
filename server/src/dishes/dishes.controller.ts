import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
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

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const dish = await this.dishesService.findOne(id);
    return {
      code: 200,
      msg: '获取菜品详情成功',
      data: dish,
    };
  }

  @Post()
  async create(@Body() createDishDto: {
    name: string;
    category: string;
    cuisineType?: string;
    cookingMethod?: string;
    price: number;
    image?: string;
    images?: string[];
    description?: string;
    stock?: number;
    spiciness?: string;
    temperature?: string;
    specifications?: any;
    isNew?: boolean;
  }) {
    const dish = await this.dishesService.create(createDishDto);
    return {
      code: 200,
      msg: '创建菜品成功',
      data: dish,
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDishDto: Partial<{
    name: string;
    category: string;
    cuisineType: string;
    cookingMethod: string;
    price: number;
    image: string;
    images: string[];
    description: string;
    stock: number;
    spiciness: string;
    temperature: string;
    specifications: any;
    isNew: boolean;
    isAvailable: boolean;
    isBanner: boolean;
  }>) {
    const dish = await this.dishesService.update(id, updateDishDto);
    return {
      code: 200,
      msg: '更新菜品成功',
      data: dish,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.dishesService.remove(id);
    return {
      code: 200,
      msg: '删除菜品成功',
    };
  }
}
