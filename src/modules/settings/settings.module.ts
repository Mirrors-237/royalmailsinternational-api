import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsController } from './settings.controller';
import { BrandingController } from './branding.controller';
import { MediaController } from './media.controller';
import { SettingsService } from './settings.service';
import { SiteSettings } from '../../entities/site-settings.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SiteSettings])],
  controllers: [SettingsController, BrandingController, MediaController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
