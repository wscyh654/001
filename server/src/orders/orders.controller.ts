import { Controller, Post, Body, Get } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async findAll() {
    const orders = await this.ordersService.findAll();
    return {
      code: 200,
      msg: '获取订单列表成功',
      data: orders,
    };
  }

  @Post()
  async create(@Body() createOrderDto: {
    table_number?: number;
    items: Array<{
      dishId: string;
      dishName: string;
      price: number;
      quantity: number;
      specs?: any;
    }>;
    note?: string;
  }) {
    const order = await this.ordersService.create(createOrderDto);
    return {
      code: 200,
      msg: '订单创建成功',
      data: order,
    };
  }
}
