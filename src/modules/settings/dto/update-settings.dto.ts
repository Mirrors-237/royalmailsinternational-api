import { Type } from 'class-transformer';
import { IsEmail, IsOptional, IsString, IsUrl, Matches, MaxLength, ValidateIf, ValidateNested } from 'class-validator';
import { HomeContentDto } from './home-content.dto';

// All fields optional; link fields also accept an empty string (= not set)
const notEmpty = (_: unknown, v: unknown) => v !== '';

export class UpdateSettingsDto {
  // ── Identity ──────────────────────────────────────────
  @IsOptional() @IsString() @MaxLength(120) siteName?: string;
  @IsOptional() @Matches(/^[A-Za-z0-9]{1,8}$/, { message: 'trackingPrefix must be 1 to 8 letters or digits' })
  trackingPrefix?: string;
  @IsOptional() @IsString() @MaxLength(160) tagline?: string;
  @IsOptional() @IsString() @MaxLength(1000) description?: string;

  // ── Contact ───────────────────────────────────────────
  @IsOptional() @IsString() @MaxLength(200) address?: string;
  @IsOptional() @IsString() @MaxLength(20)  postalCode?: string;
  @IsOptional() @IsString() @MaxLength(100) city?: string;
  @IsOptional() @IsString() @MaxLength(100) country?: string;
  @IsOptional() @ValidateIf(notEmpty) @IsEmail() @MaxLength(254) email?: string;
  @IsOptional() @IsString() @MaxLength(40)  phone?: string;
  @IsOptional() @IsString() @MaxLength(40)  whatsapp?: string;

  // ── Opening hours ──────────────────────────────────────────
  @IsOptional() @IsString() @MaxLength(200) openingHours?: string;
  @IsOptional() @ValidateIf(notEmpty) @IsUrl({ protocols: ['https'] }) mapEmbedUrl?: string;

  // ── Social media ───────────────────────────────────
  @IsOptional() @ValidateIf(notEmpty) @IsUrl({ protocols: ['https'] }) socialFacebook?: string;
  @IsOptional() @ValidateIf(notEmpty) @IsUrl({ protocols: ['https'] }) socialLinkedin?: string;
  @IsOptional() @ValidateIf(notEmpty) @IsUrl({ protocols: ['https'] }) socialTwitter?: string;

  // ── Appearance ─────────────────────────────────────────
  @IsOptional() @Matches(/^#[0-9a-fA-F]{6}$/, { message: 'primaryColor must use the #rrggbb format' })
  primaryColor?: string;
  @IsOptional() @Matches(/^#[0-9a-fA-F]{6}$/, { message: 'accentColor must use the #rrggbb format' })
  accentColor?: string;

  // ── Home page content (null = back to the built-in defaults) ──
  @IsOptional() @ValidateNested() @Type(() => HomeContentDto)
  homeContent?: HomeContentDto | null;

  // ── Legal notice and privacy notice ───────────────────
  @IsOptional() @IsString() @MaxLength(160)  legalForm?: string;
  @IsOptional() @IsString() @MaxLength(80)   registrationNumber?: string;
  @IsOptional() @IsString() @MaxLength(40)   vatNumber?: string;
  @IsOptional() @IsString() @MaxLength(120)  publicationDirector?: string;
  @IsOptional() @IsString() @MaxLength(500)  hostingProvider?: string;
  @IsOptional() @IsString() @MaxLength(1000) dataRetention?: string;
  @IsOptional() @IsString() @MaxLength(1000) dataProcessors?: string;
  @IsOptional() @IsString() @MaxLength(200)  supervisoryAuthority?: string;

  // ── SEO ───────────────────────────────────────────────
  @IsOptional() @IsString() @MaxLength(160) metaTitle?: string;
  @IsOptional() @IsString() @MaxLength(320) metaDescription?: string;
}
