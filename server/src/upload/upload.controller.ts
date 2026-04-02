import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  async uploadImage(@Body() body: { fileData: string; fileName: string }) {
    const result = await this.uploadService.uploadImage(
      body.fileData,
      body.fileName,
    );
    return {
      code: 200,
      msg: '上传成功',
      data: result,
    };
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      return {
        code: 400,
        msg: '请选择文件',
        data: null,
      };
    }

    const result = await this.uploadService.uploadBuffer(
      file.buffer,
      file.originalname,
      file.mimetype,
    );

    return {
      code: 200,
      msg: '上传成功',
      data: result,
    };
  }
}
