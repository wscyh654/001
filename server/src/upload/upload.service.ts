import { Injectable } from '@nestjs/common';
import { S3Storage } from 'coze-coding-dev-sdk';

@Injectable()
export class UploadService {
  private storage: S3Storage;

  constructor() {
    this.storage = new S3Storage({
      endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
      accessKey: '',
      secretKey: '',
      bucketName: process.env.COZE_BUCKET_NAME,
      region: 'cn-beijing',
    });
  }

  async uploadImage(fileData: string, fileName: string) {
    // 从 base64 数据中提取文件内容
    const base64Data = fileData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // 根据文件名确定 content type
    const ext = fileName.split('.').pop()?.toLowerCase() || 'jpg';
    const contentTypeMap: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
    };
    const contentType = contentTypeMap[ext] || 'image/jpeg';

    // 上传文件
    const key = await this.storage.uploadFile({
      fileContent: buffer,
      fileName: `dishes/${Date.now()}_${fileName}`,
      contentType,
    });

    // 生成访问 URL（有效期 30 天）
    const url = await this.storage.generatePresignedUrl({
      key,
      expireTime: 2592000,
    });

    return { key, url };
  }

  async uploadBuffer(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
  ) {
    // 上传文件
    const key = await this.storage.uploadFile({
      fileContent: buffer,
      fileName: `uploads/${Date.now()}_${originalName}`,
      contentType: mimeType,
    });

    // 生成访问 URL（有效期 30 天）
    const url = await this.storage.generatePresignedUrl({
      key,
      expireTime: 2592000,
    });

    return { key, url };
  }
}
