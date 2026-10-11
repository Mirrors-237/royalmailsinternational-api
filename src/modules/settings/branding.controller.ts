import { Controller, Get, Param, Res, StreamableFile, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import { StorageService } from '../../common/storage/storage.service';
import { BRANDING_FILE_RE, CONTENT_TYPES } from './branding.util';

// Public: serves logos and favicon from S3 (the bucket stays private)
@Controller('branding')
export class BrandingController {
  constructor(private storage: StorageService) {}

  @Get(':file')
  async get(@Param('file') file: string, @Res({ passthrough: true }) res: Response) {
    if (!BRANDING_FILE_RE.test(file)) throw new NotFoundException();

    const obj = await this.storage.get(`branding/${file}`);
    if (!obj) throw new NotFoundException();

    const ext = file.split('.').pop() as keyof typeof CONTENT_TYPES;
    res.set({
      'Cache-Control':           'public, max-age=31536000, immutable',
      'X-Content-Type-Options':  'nosniff',
      // Even when opened directly, an SVG cannot run any script
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      'Cross-Origin-Resource-Policy': 'cross-origin',
    });

    return new StreamableFile(obj.body, { type: CONTENT_TYPES[ext], length: obj.length });
  }
}
