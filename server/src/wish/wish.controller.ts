import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { WishService } from './wish.service';

@Controller('wish')
export class WishController {
  constructor(private readonly wishService: WishService) {}

  @Get()
  async findAll() {
    const wishes = await this.wishService.findAll();
    return {
      code: 200,
      msg: '获取心愿列表成功',
      data: wishes,
    };
  }

  @Post()
  async create(@Body() createWishDto: { dish_name: string; description?: string; user_id?: string }) {
    const wish = await this.wishService.create(createWishDto);
    return {
      code: 200,
      msg: '心愿创建成功',
      data: wish,
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: { dish_name?: string; description?: string; user_id: string },
  ) {
    const wish = await this.wishService.update(id, updateDto, updateDto.user_id);
    return {
      code: 200,
      msg: '心愿更新成功',
      data: wish,
    };
  }

  @Post(':id/vote')
  async vote(
    @Param('id') id: string,
    @Body() body: { user_id: string },
  ) {
    const result = await this.wishService.vote(id, body.user_id);
    return {
      code: 200,
      msg: result.voted ? '投票成功' : '已取消投票',
      data: result,
    };
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Body() body: { user_id?: string; is_admin?: boolean },
  ) {
    await this.wishService.remove(id, body.user_id, body.is_admin);
    return {
      code: 200,
      msg: '心愿删除成功',
    };
  }
}
