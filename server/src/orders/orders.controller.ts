import { Controller, Post, Body, Get, Put, Param, Delete, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async findAll(
    @Query('user_id') userId?: string,
    @Query('is_admin') isAdmin?: string,
  ) {
    const isAdminMode = isAdmin === 'true';
    const orders = await this.ordersService.findAll(userId, isAdminMode);
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
    user_id?: string;
  }) {
    const order = await this.ordersService.create(createOrderDto);
    return {
      code: 200,
      msg: '订单创建成功',
      data: order,
    };
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    const order = await this.ordersService.updateStatus(id, body.status);
    return {
      code: 200,
      msg: '订单状态更新成功',
      data: order,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.ordersService.remove(id);
    return {
      code: 200,
      msg: '订单删除成功',
      data: null,
    };
  }
}
