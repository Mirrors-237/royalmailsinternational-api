import { createHash } from 'node:crypto';
import { BadRequestException } from '@nestjs/common';
import { CONTENT_TYPES, detectType, type ImageType } from './branding.util';

// Images that can be uploaded from the admin (same names as in the Nuxt app, utils/media.ts):
// - website photos, replacing the built-in ones;
// - photos replacing an illustration, everywhere it appears (illustration-*);
// - photos of the image and text blocks (block-*, see entities/content-block.ts).
export enum MediaSlot {
  HERO     = 'hero',
  AIR      = 'air',
  SEA      = 'sea',
  ROAD     = 'road',
  CUSTOMS  = 'customs',
  PORT     = 'port',
  SORTING  = 'sorting',
  RECEIVE  = 'receive',
  BUSINESS = 'business',

  ILLUSTRATION_SEND      = 'illustration-send',
  ILLUSTRATION_RECEIVE   = 'illustration-receive',
  ILLUSTRATION_TRACK     = 'illustration-track',
  ILLUSTRATION_BUSINESS  = 'illustration-business',
  ILLUSTRATION_CUSTOMS   = 'illustration-customs',
  ILLUSTRATION_COURIER   = 'illustration-courier',
  ILLUSTRATION_SUPPORT   = 'illustration-support',
  ILLUSTRATION_WORLDWIDE = 'illustration-worldwide',

  BLOCK_HOME     = 'block-home',
  BLOCK_SEND     = 'block-send',
  BLOCK_RECEIVE  = 'block-receive',
  BLOCK_BUSINESS = 'block-business',
  BLOCK_ABOUT    = 'block-about',
}

export const MEDIA_MAX_BYTES = 6 * 1024 * 1024;

const ALLOWED: ImageType[] = ['jpg', 'png', 'webp'];

// Public file name: {slot}-{hash}.{ext}; immutable, so it can be cached indefinitely
export const MEDIA_FILE_RE = new RegExp(`^(${Object.values(MediaSlot).join('|')})-[a-f0-9]{16}\\.(jpg|png|webp)$`);

export const mediaUrl = (key: string) => `/media/${key.replace(/^media\//, '')}`;

export function prepareMediaFile(slot: MediaSlot, file?: Express.Multer.File) {
  if (!file?.buffer?.length) {
    throw new BadRequestException('Missing file (field "file")');
  }

  // Detection by file signature; the mimetype sent by the client is not trusted
  const type = detectType(file.buffer);
  if (!type || !ALLOWED.includes(type)) {
    throw new BadRequestException(`Unsupported format. Accepted: ${ALLOWED.join(', ')}`);
  }

  const hash = createHash('sha256').update(file.buffer).digest('hex').slice(0, 16);
  return {
    key:         `media/${slot}-${hash}.${type}`,
    body:        file.buffer,
    contentType: CONTENT_TYPES[type],
  };
}
