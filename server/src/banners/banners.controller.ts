import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { BannersService } from './banners.service';

@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  async findAll() {
    const banners = await this.bannersService.findAll();
    return {
      code: 200,
      msg: '获取轮播图列表成功',
      data: banners,
    };
  }

  @Post()
  async create(@Body() createBannerDto: {
    title?: string;
    image: string;
    link_type?: string;
    link_id?: string;
    sort_order?: number;
  }) {
    const banner = await this.bannersService.create(createBannerDto);
    return {
      code: 200,
      msg: '创建轮播图成功',
      data: banner,
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateBannerDto: Partial<{
    title: string;
    image: string;
    link_type: string;
    link_id: string;
    sort_order: number;
    is_active: boolean;
  }>) {
    const banner = await this.bannersService.update(id, updateBannerDto);
    return {
      code: 200,
      msg: '更新轮播图成功',
      data: banner,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.bannersService.remove(id);
    return {
      code: 200,
      msg: '删除轮播图成功',
    };
  }
}
