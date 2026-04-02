import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  async findAll() {
    const messages = await this.messagesService.findAll();
    return {
      code: 200,
      msg: '获取留言列表成功',
      data: messages,
    };
  }

  @Post()
  async create(@Body() createMessageDto: { content: string; user_id?: string }) {
    const message = await this.messagesService.create(createMessageDto);
    return {
      code: 200,
      msg: '留言创建成功',
      data: message,
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: { content: string; user_id: string },
  ) {
    const message = await this.messagesService.update(id, updateDto, updateDto.user_id);
    return {
      code: 200,
      msg: '留言更新成功',
      data: message,
    };
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Body() body: { user_id?: string; is_admin?: boolean },
  ) {
    await this.messagesService.remove(id, body.user_id, body.is_admin);
    return {
      code: 200,
      msg: '留言删除成功',
    };
  }
}
