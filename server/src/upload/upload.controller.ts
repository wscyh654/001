import { Controller, Post, Body } from '@nestjs/common';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  async uploadImage(@Body() body: { fileData: string; fileName: string }) {
    const result = await this.uploadService.uploadImage(body.fileData, body.fileName);
    return {
      code: 200,
      msg: '上传成功',
      data: result,
    };
  }
}
