import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async findAll() {
    const items = await this.cartService.findAll();
    return {
      code: 200,
      msg: '获取购物车成功',
      data: items,
    };
  }

  @Post()
  async create(@Body() createCartDto: {
    dishId: string;
    dishName: string;
    price: number;
    quantity: number;
    specs?: any;
    note?: string;
  }) {
    const item = await this.cartService.create(createCartDto);
    return {
      code: 200,
      msg: '加入购物车成功',
      data: item,
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateCartDto: { quantity?: number; note?: string | null }) {
    const item = await this.cartService.update(id, updateCartDto.quantity, updateCartDto.note);
    return {
      code: 200,
      msg: '更新购物车成功',
      data: item,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.cartService.remove(id);
    return {
      code: 200,
      msg: '删除购物车项成功',
    };
  }

  @Delete()
  async clearAll() {
    await this.cartService.clearAll();
    return {
      code: 200,
      msg: '清空购物车成功',
    };
  }
}
