import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteSettings } from '../../entities/site-settings.entity';
import { StorageService } from '../../common/storage/storage.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { BrandingKind, BRANDING_COLUMN, prepareBrandingFile } from './branding.util';
import { MediaSlot, mediaUrl, prepareMediaFile } from './media.util';

// Public response: S3 keys are replaced by URLs relative to the API base
export type PublicSiteSettings = Omit<SiteSettings, 'logoKey' | 'logoOnDarkKey' | 'faviconKey' | 'imageKeys'> & {
  logoUrl:       string | null;
  logoOnDarkUrl: string | null;
  faviconUrl:    string | null;
  images:        Partial<Record<MediaSlot, string>>;
};

const toUrl = (key: string | null) => (key ? `/branding/${key.replace(/^branding\//, '')}` : null);

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(SiteSettings) private repo: Repository<SiteSettings>,
    private storage: StorageService,
  ) {}

  async get(): Promise<SiteSettings> {
    return this.repo.findOne({ where: { id: 1 } });
  }

  async getPublic(): Promise<PublicSiteSettings> {
    const { logoKey, logoOnDarkKey, faviconKey, imageKeys, ...rest } = await this.get();
    return {
      ...rest,
      logoUrl:       toUrl(logoKey),
      logoOnDarkUrl: toUrl(logoOnDarkKey),
      faviconUrl:    toUrl(faviconKey),
      images:        Object.fromEntries(Object.entries(imageKeys ?? {}).map(([slot, key]) => [slot, mediaUrl(key)])),
    };
  }

  async update(dto: UpdateSettingsDto): Promise<PublicSiteSettings> {
    if (Object.keys(dto).length) await this.repo.update(1, dto as any);
    return this.getPublic();
  }

  async setImage(slot: MediaSlot, file: Express.Multer.File): Promise<PublicSiteSettings> {
    const { key, body, contentType } = prepareMediaFile(slot, file);
    const current = (await this.get()).imageKeys ?? {};

    await this.storage.put(key, body, contentType);
    await this.repo.update(1, { imageKeys: { ...current, [slot]: key } });

    if (current[slot] && current[slot] !== key) await this.storage.delete(current[slot]);
    return this.getPublic();
  }

  async removeImage(slot: MediaSlot): Promise<PublicSiteSettings> {
    const { [slot]: old, ...rest } = (await this.get()).imageKeys ?? {};

    await this.repo.update(1, { imageKeys: rest });
    if (old) await this.storage.delete(old);
    return this.getPublic();
  }

  async setBranding(kind: BrandingKind, file: Express.Multer.File): Promise<PublicSiteSettings> {
    const { key, body, contentType } = prepareBrandingFile(kind, file);
    const column  = BRANDING_COLUMN[kind];
    const current = await this.get();

    await this.storage.put(key, body, contentType);
    await this.repo.update(1, { [column]: key });

    if (current[column] && current[column] !== key) await this.storage.delete(current[column]);
    return this.getPublic();
  }

  async removeBranding(kind: BrandingKind): Promise<PublicSiteSettings> {
    const column  = BRANDING_COLUMN[kind];
    const current = await this.get();

    await this.repo.update(1, { [column]: null });
    if (current[column]) await this.storage.delete(current[column]);
    return this.getPublic();
  }
}
