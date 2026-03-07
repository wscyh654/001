import { Controller, Post, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() createOrderDto: {
    table_number: number;
    items: Array<{
      dishId: string;
      dishName: string;
      dishPrice: number;
      quantity: number;
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
