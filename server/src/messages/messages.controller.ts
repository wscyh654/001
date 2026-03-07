import { Controller, Get, Post, Body } from '@nestjs/common';
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
  async create(@Body() createMessageDto: { content: string }) {
    const message = await this.messagesService.create(createMessageDto);
    return {
      code: 200,
      msg: '留言创建成功',
      data: message,
    };
  }
}
