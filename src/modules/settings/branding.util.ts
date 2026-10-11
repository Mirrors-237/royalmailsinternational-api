import { createHash } from 'node:crypto';
import { BadRequestException } from '@nestjs/common';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

export enum BrandingKind {
  LOGO         = 'logo',
  LOGO_ON_DARK = 'logoOnDark',
  FAVICON      = 'favicon',
}

// site_settings column that stores the S3 key of each image
export const BRANDING_COLUMN = {
  [BrandingKind.LOGO]:         'logoKey',
  [BrandingKind.LOGO_ON_DARK]: 'logoOnDarkKey',
  [BrandingKind.FAVICON]:      'faviconKey',
} as const;

export const BRANDING_MAX_BYTES = 2 * 1024 * 1024;

export type ImageType = 'png' | 'jpg' | 'webp' | 'svg' | 'ico';

export const CONTENT_TYPES: Record<ImageType, string> = {
  png:  'image/png',
  jpg:  'image/jpeg',
  webp: 'image/webp',
  svg:  'image/svg+xml',
  ico:  'image/x-icon',
};

const ALLOWED: Record<BrandingKind, ImageType[]> = {
  [BrandingKind.LOGO]:         ['png', 'jpg', 'webp', 'svg'],
  [BrandingKind.LOGO_ON_DARK]: ['png', 'jpg', 'webp', 'svg'],
  [BrandingKind.FAVICON]:      ['png', 'svg', 'ico'],
};

// Public file name: {kind}-{hash}.{ext}; immutable, so it can be cached indefinitely
export const BRANDING_FILE_RE = /^(logo|logoOnDark|favicon)-[a-f0-9]{16}\.(png|jpg|webp|svg|ico)$/;

// Detection by file signature; the mimetype sent by the client is not trusted
export function detectType(buf: Buffer): ImageType | null {
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (buf.length >= 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  if (buf.length >= 4 && buf[0] === 0 && buf[1] === 0 && buf[2] === 1 && buf[3] === 0) return 'ico';

  const head = buf.toString('utf8', 0, Math.min(buf.length, 2048)).replace(/^﻿/, '').trimStart();
  if (head.startsWith('<') && /<svg[\s>]/i.test(head)) return 'svg';
  return null;
}

let purify: ReturnType<typeof createDOMPurify> | null = null;

// Removes scripts, event handlers, foreignObject, javascript: links, etc.
function sanitizeSvg(buf: Buffer): Buffer {
  purify ??= createDOMPurify(new JSDOM('').window as any);
  const clean = purify.sanitize(buf.toString('utf8'), {
    USE_PROFILES: { svg: true, svgFilters: true },
  });
  if (!/<svg[\s>]/i.test(clean)) {
    throw new BadRequestException('SVG is invalid after sanitisation');
  }
  return Buffer.from(clean, 'utf8');
}

export function prepareBrandingFile(kind: BrandingKind, file?: Express.Multer.File) {
  if (!file?.buffer?.length) {
    throw new BadRequestException('Missing file (field "file")');
  }

  const type = detectType(file.buffer);
  if (!type || !ALLOWED[kind].includes(type)) {
    throw new BadRequestException(`Unsupported format for ${kind}. Accepted: ${ALLOWED[kind].join(', ')}`);
  }

  const body = type === 'svg' ? sanitizeSvg(file.buffer) : file.buffer;
  const hash = createHash('sha256').update(body).digest('hex').slice(0, 16);

  return {
    key:         `branding/${kind}-${hash}.${type}`,
    body,
    contentType: CONTENT_TYPES[type],
  };
}
