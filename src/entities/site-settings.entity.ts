import type { HomeContent } from './home-content';
import type { ContentBlocks } from './content-block';
import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('site_settings')
export class SiteSettings {
  @PrimaryGeneratedColumn()
  id: number;

  // ── Identity ──────────────────────────────────────────
  @Column({ default: 'Transport Atlantic Courier' })
  siteName: string;

  @Column({ default: 'TAC', length: 8 })
  trackingPrefix: string;

  @Column({ default: 'International shipping you can track' })
  tagline: string;

  @Column({ default: 'International air, sea and road freight, with customs clearance and tracking at every step.' })
  description: string;

  // ── Contact ───────────────────────────────────────────
  @Column({ default: '123 Rue du Commerce' })
  address: string;

  @Column({ default: '75001' })
  postalCode: string;

  @Column({ default: 'Paris' })
  city: string;

  @Column({ default: 'France' })
  country: string;

  @Column({ default: 'contact@example.com' })
  email: string;

  @Column({ default: '+33 1 00 00 00 00' })
  phone: string;

  @Column({ default: '' })
  whatsapp: string;

  // ── Opening hours ──────────────────────────────────────────
  @Column({ default: 'Mon–Fri, 8am–6pm' })
  openingHours: string;

  @Column({ default: '' })
  mapEmbedUrl: string;

  // ── Social media ───────────────────────────────────
  @Column({ default: '' })
  socialFacebook: string;

  @Column({ default: '' })
  socialLinkedin: string;

  @Column({ default: '' })
  socialTwitter: string;

  // ── Appearance ─────────────────────────────────────────
  @Column({ default: '#0b5bd3' })
  primaryColor: string;

  @Column({ default: '#f59e0b' })
  accentColor: string;

  // S3 keys of the brand images (null = no image; the website shows the initials instead)
  @Column({ type: 'varchar', nullable: true })
  logoKey: string | null;

  @Column({ type: 'varchar', nullable: true })
  logoOnDarkKey: string | null;

  @Column({ type: 'varchar', nullable: true })
  faviconKey: string | null;

  // ── Website content ────────────────────────────────────
  // Home page texts, key figures and example shipments (null = the website's built-in defaults)
  @Column({ type: 'jsonb', nullable: true })
  homeContent: HomeContent | null;

  // S3 keys of the website photos, by slot (a missing slot = the built-in photo or illustration)
  @Column({ type: 'jsonb', default: {} })
  imageKeys: Partial<Record<string, string>>;

  // Image and text blocks, by placement (their photos are in imageKeys, block-{placement})
  @Column({ type: 'jsonb', default: {} })
  contentBlocks: ContentBlocks;

  // ── Legal notice and privacy notice (empty = not shown on the website) ──
  @Column({ default: '' })
  legalForm: string;

  @Column({ default: '' })
  registrationNumber: string;

  @Column({ default: '' })
  vatNumber: string;

  @Column({ default: '' })
  publicationDirector: string;

  @Column({ type: 'text', default: '' })
  hostingProvider: string;

  @Column({ type: 'text', default: '' })
  dataRetention: string;

  @Column({ type: 'text', default: '' })
  dataProcessors: string;

  @Column({ default: '' })
  supervisoryAuthority: string;

  // ── SEO ───────────────────────────────────────────────
  @Column({ default: 'Transport Atlantic Courier | Air, Sea & Road Freight' })
  metaTitle: string;

  @Column({ default: 'International air, sea and road freight to 150+ countries. Live tracking at every step. Free quote within 24 hours.' })
  metaDescription: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
