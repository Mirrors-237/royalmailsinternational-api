import {
  Controller, Get, Put, Post, Delete, Body, Param, UseGuards, UseInterceptors,
  UploadedFile, ParseEnumPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { BrandingKind, BRANDING_MAX_BYTES } from './branding.util';
import { MediaSlot, MEDIA_MAX_BYTES } from './media.util';

@Controller('settings')
export class SettingsController {
  constructor(private service: SettingsService) {}

  // Public: the website calls it to display the site information
  @Get()
  get() {
    return this.service.getPublic();
  }

  // Admin only
  @UseGuards(JwtAuthGuard)
  @Put()
  update(@Body() dto: UpdateSettingsDto) {
    return this.service.update(dto);
  }

  // Admin: multipart upload, field "file"; kind = logo | logoOnDark | favicon
  @UseGuards(JwtAuthGuard)
  @Post('branding/:kind')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: BRANDING_MAX_BYTES, files: 1 } }))
  uploadBranding(
    @Param('kind', new ParseEnumPipe(BrandingKind)) kind: BrandingKind,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.setBranding(kind, file);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('branding/:kind')
  removeBranding(@Param('kind', new ParseEnumPipe(BrandingKind)) kind: BrandingKind) {
    return this.service.removeBranding(kind);
  }

  // Admin: website photos, multipart upload, field "file"; slot = hero | air | sea | …
  @UseGuards(JwtAuthGuard)
  @Post('images/:slot')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MEDIA_MAX_BYTES, files: 1 } }))
  uploadImage(
    @Param('slot', new ParseEnumPipe(MediaSlot)) slot: MediaSlot,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.setImage(slot, file);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('images/:slot')
  removeImage(@Param('slot', new ParseEnumPipe(MediaSlot)) slot: MediaSlot) {
    return this.service.removeImage(slot);
  }
}
