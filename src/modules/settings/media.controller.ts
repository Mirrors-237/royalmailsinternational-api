import { Controller, Get, Param, Res, StreamableFile, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import { StorageService } from '../../common/storage/storage.service';
import { CONTENT_TYPES } from './branding.util';
import { MEDIA_FILE_RE } from './media.util';

// Public: serves the website photos uploaded in the admin (the bucket stays private)
@Controller('media')
export class MediaController {
  constructor(private storage: StorageService) {}

  @Get(':file')
  async get(@Param('file') file: string, @Res({ passthrough: true }) res: Response) {
    if (!MEDIA_FILE_RE.test(file)) throw new NotFoundException();

    const obj = await this.storage.get(`media/${file}`);
    if (!obj) throw new NotFoundException();

    const ext = file.split('.').pop() as keyof typeof CONTENT_TYPES;
    res.set({
      'Cache-Control':          'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
      'Cross-Origin-Resource-Policy': 'cross-origin',
    });

    return new StreamableFile(obj.body, { type: CONTENT_TYPES[ext], length: obj.length });
  }
}
