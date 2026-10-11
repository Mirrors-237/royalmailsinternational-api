import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { User }           from '../../entities/user.entity';
import { SiteSettings }   from '../../entities/site-settings.entity';
import { Shipment, ShipmentStatus, ShipmentCategory, TransportMode } from '../../entities/shipment.entity';
import { Checkpoint, CheckpointStatus } from '../../entities/checkpoint.entity';
import { Lead, LeadStatus }  from '../../entities/lead.entity';
import { ContactMessage, MessageStatus } from '../../entities/contact-message.entity';
import { Testimonial }    from '../../entities/testimonial.entity';
import { Partner }        from '../../entities/partner.entity';
import { BCRYPT_ROUNDS, MIN_PASSWORD_LENGTH } from '../../modules/auth/password';

const EXAMPLE_ADMIN_PASSWORD = 'Admin@2024!';

// Runs after migrations (see DatabaseConfig): creates the admin and site settings on first start.
// Demo content (shipments, requests, messages, testimonials, partners) is inserted into an empty
// database only when SEED_DEMO is true, which is the default outside production.
// The schema is never touched here.
@Injectable()
export class SeedService implements OnModuleInit {
  private readonly log = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)           private userRepo:        Repository<User>,
    @InjectRepository(SiteSettings)   private settingsRepo:    Repository<SiteSettings>,
    @InjectRepository(Shipment)       private shipRepo:        Repository<Shipment>,
    @InjectRepository(Checkpoint)     private cpRepo:          Repository<Checkpoint>,
    @InjectRepository(Lead)           private leadRepo:        Repository<Lead>,
    @InjectRepository(ContactMessage) private msgRepo:         Repository<ContactMessage>,
    @InjectRepository(Testimonial)    private testimonialRepo: Repository<Testimonial>,
    @InjectRepository(Partner)        private partnerRepo:     Repository<Partner>,
    private config: ConfigService,
  ) {}

  async onModuleInit() {
    if (await this.userRepo.count()     === 0) await this.seedAdmin();
    if (await this.settingsRepo.count() === 0) await this.seedSettings();

    if (this.demoEnabled() && await this.shipRepo.count() === 0) {
      this.log.log('Empty database: inserting demo content…');
      await this.seedShipments();
      await this.seedLeads();
      await this.seedMessages();
      await this.seedTestimonials();
      await this.seedPartners();
      this.log.log('Demo content inserted.');
    }
  }

  // ─────────────────────────────────────────────────────────
  // Admin
  // ─────────────────────────────────────────────────────────
  private demoEnabled() {
    const fallback = this.config.get('NODE_ENV') === 'production' ? 'false' : 'true';
    return this.config.get<string>('SEED_DEMO', fallback).trim().toLowerCase() === 'true';
  }

  // The first administrator comes from ADMIN_EMAIL and ADMIN_PASSWORD; there is no built-in password.
  // In production the example password from .env.example and short passwords are refused.
  private async seedAdmin() {
    const email = this.config.get<string>('ADMIN_EMAIL', '').trim().toLowerCase();
    const raw   = this.config.get<string>('ADMIN_PASSWORD', '');

    if (!email || !raw) {
      throw new Error('No administrator account yet: set ADMIN_EMAIL and ADMIN_PASSWORD to create it.');
    }
    if (this.config.get('NODE_ENV') === 'production') {
      if (raw === EXAMPLE_ADMIN_PASSWORD) throw new Error('ADMIN_PASSWORD still has the example value from .env.example.');
      if (raw.length < MIN_PASSWORD_LENGTH) throw new Error(`ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters long in production.`);
    }

    const passwordHash = await bcrypt.hash(raw, BCRYPT_ROUNDS);
    await this.userRepo.save({ email, passwordHash, role: 'admin' });
    this.log.log(`Admin created: ${email}`);
  }

  // ─────────────────────────────────────────────────────────
  // Site settings
  // ─────────────────────────────────────────────────────────
  private async seedSettings() {
    await this.settingsRepo.save(this.settingsRepo.create());
    this.log.log('Site settings initialised');
  }

  // ─────────────────────────────────────────────────────────
  // Demo shipments
  // ─────────────────────────────────────────────────────────
  private async seedShipments() {
    const days = (n: number) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

    const demos = [
      {
        shipment: {
          trackingNumber:   'TAC-DEM-001',
          senderName:       'Peter Martin',
          senderEmail:      'peter.martin@example.com',
          senderPhone:      '+33 1 23 45 67 89',
          senderAddress:    '12 Avenue des Champs-Élysées',
          senderCity:       'Paris',
          senderCountry:    'France',
          receiverName:     'Kouassi Amani',
          receiverEmail:    'k.amani@example.com',
          receiverPhone:    '+225 07 00 00 00 01',
          receiverAddress:  '15 Rue du Commerce',
          receiverCity:     'Abidjan',
          receiverCountry:  "Côte d'Ivoire",
          weightKg:         12.5,
          category:         ShipmentCategory.PARCEL,
          transportMode:    TransportMode.AIR,
          status:           ShipmentStatus.IN_TRANSIT,
          declaredValue:    450,
          currency:         'EUR',
          isInsured:        true,
          estimatedDelivery: days(3),
          description:      'Clothing and accessories',
        },
        checkpoints: [
          { city: 'Paris',      country: 'France',  lat: 48.8566, lng: 2.3522,  status: CheckpointStatus.PICKED_UP, statusLabel: 'Parcel collected in Paris',               facility: 'Paris depot',                    hoursAgo: 48 },
          { city: 'Paris',      country: 'France',  lat: 49.0097, lng: 2.5479,  status: CheckpointStatus.DEPARTED,  statusLabel: 'Departed Paris Charles de Gaulle airport', facility: 'CDG airport, cargo terminal',    hoursAgo: 44 },
          { city: 'Casablanca', country: 'Morocco', lat: 33.5731, lng: -7.5898, status: CheckpointStatus.ARRIVED,   statusLabel: 'Arrived in Casablanca for a stopover',     facility: 'Mohammed V airport',             hoursAgo: 36 },
          { city: 'Casablanca', country: 'Morocco', lat: 33.5731, lng: -7.5898, status: CheckpointStatus.DEPARTED,  statusLabel: 'Departed for Abidjan',                     facility: 'Mohammed V airport',             hoursAgo: 32 },
        ],
      },
      {
        shipment: {
          trackingNumber:   'TAC-DEM-002',
          senderName:       'Sophie Leclerc',
          senderEmail:      'sophie.leclerc@example.com',
          senderPhone:      '+33 4 78 00 00 00',
          senderAddress:    '3 Quai Saint-Antoine',
          senderCity:       'Lyon',
          senderCountry:    'France',
          receiverName:     'Global Trade Corp',
          receiverEmail:    'imports@example.com',
          receiverPhone:    '+86 21 0000 0000',
          receiverAddress:  '88 Nanjing Road',
          receiverCity:     'Shanghai',
          receiverCountry:  'China',
          weightKg:         320,
          lengthCm:         120,
          widthCm:          80,
          heightCm:         100,
          category:         ShipmentCategory.FREIGHT,
          transportMode:    TransportMode.SEA,
          status:           ShipmentStatus.IN_CUSTOMS,
          declaredValue:    8500,
          currency:         'EUR',
          isInsured:        true,
          estimatedDelivery: days(12),
          description:      'Industrial equipment',
        },
        checkpoints: [
          { city: 'Lyon',      country: 'France',    lat: 45.7640, lng: 4.8357,   status: CheckpointStatus.PICKED_UP,  statusLabel: 'Collected in Lyon',                      facility: 'Lyon depot',                     hoursAgo: 240 },
          { city: 'Marseille', country: 'France',    lat: 43.2965, lng: 5.3698,   status: CheckpointStatus.DEPARTED,   statusLabel: 'Loaded at the port of Marseille',        facility: 'Port of Marseille, container terminal', hoursAgo: 216 },
          { city: 'Port Said', country: 'Egypt',     lat: 31.2653, lng: 32.3019,  status: CheckpointStatus.ARRIVED,    statusLabel: 'In transit through the Suez Canal',      facility: 'Port of Port Said',              hoursAgo: 168 },
          { city: 'Singapore', country: 'Singapore', lat: 1.3521,  lng: 103.8198, status: CheckpointStatus.ARRIVED,    statusLabel: 'Stopover in Singapore',                  facility: 'Port of Singapore',              hoursAgo: 96 },
          { city: 'Shanghai',  country: 'China',     lat: 31.2304, lng: 121.4737, status: CheckpointStatus.IN_CUSTOMS, statusLabel: 'Arrived in Shanghai, customs clearance in progress', facility: 'Port of Shanghai, customs office', hoursAgo: 12 },
        ],
      },
      {
        shipment: {
          trackingNumber:   'TAC-DEM-003',
          senderName:       'Karim Benali',
          senderEmail:      'k.benali@example.com',
          senderPhone:      '+213 21 00 00 00',
          senderAddress:    '42 Rue Didouche Mourad',
          senderCity:       'Algiers',
          senderCountry:    'Algeria',
          receiverName:     'Marie Fontaine',
          receiverEmail:    'marie.fontaine@example.com',
          receiverPhone:    '+33 5 00 00 00 00',
          receiverAddress:  '7 Rue Sainte-Catherine',
          receiverCity:     'Bordeaux',
          receiverCountry:  'France',
          weightKg:         5.2,
          category:         ShipmentCategory.DOCUMENT,
          transportMode:    TransportMode.AIR,
          status:           ShipmentStatus.DELIVERED,
          declaredValue:    50,
          currency:         'EUR',
          isInsured:        false,
          estimatedDelivery: days(-2),
          description:      'Administrative documents',
        },
        checkpoints: [
          { city: 'Algiers',  country: 'Algeria', lat: 36.7372, lng: 3.0865,  status: CheckpointStatus.PICKED_UP,        statusLabel: 'Collected in Algiers',                 facility: 'Algiers office',            hoursAgo: 96 },
          { city: 'Algiers',  country: 'Algeria', lat: 36.6914, lng: 3.2151,  status: CheckpointStatus.DEPARTED,         statusLabel: 'Departed Algiers Houari Boumediene airport', facility: 'Algiers airport',     hoursAgo: 90 },
          { city: 'Paris',    country: 'France',  lat: 49.0097, lng: 2.5479,  status: CheckpointStatus.ARRIVED,          statusLabel: 'Arrived at Paris CDG',                 facility: 'CDG airport',               hoursAgo: 84 },
          { city: 'Paris',    country: 'France',  lat: 49.0097, lng: 2.5479,  status: CheckpointStatus.CUSTOMS_CLEARED,  statusLabel: 'Cleared customs',                      facility: 'CDG airport customs',       hoursAgo: 80 },
          { city: 'Bordeaux', country: 'France',  lat: 44.8378, lng: -0.5792, status: CheckpointStatus.OUT_FOR_DELIVERY, statusLabel: 'Out for delivery',                     facility: 'Bordeaux sorting centre',   hoursAgo: 50 },
          { city: 'Bordeaux', country: 'France',  lat: 44.8378, lng: -0.5792, status: CheckpointStatus.DELIVERED,        statusLabel: 'Delivered, signed for by M. Fontaine', facility: null,                        hoursAgo: 48 },
        ],
      },
    ];

    for (const demo of demos) {
      const shipment = await this.shipRepo.save(this.shipRepo.create(demo.shipment as any)) as unknown as Shipment;
      for (const cp of demo.checkpoints) {
        await this.cpRepo.save(this.cpRepo.create({
          shipmentId:  shipment.id,
          city:        cp.city,
          country:     cp.country,
          lat:         cp.lat,
          lng:         cp.lng,
          status:      cp.status,
          statusLabel: cp.statusLabel,
          facility:    cp.facility,
          occurredAt:  new Date(Date.now() - cp.hoursAgo * 60 * 60 * 1000),
        }));
      }
      this.log.log(`  Shipment ${shipment.trackingNumber} created`);
    }
  }

  // ─────────────────────────────────────────────────────────
  // Demo quote requests
  // ─────────────────────────────────────────────────────────
  private async seedLeads() {
    const leads = [
      {
        fullName: 'Anthony Dubois', email: 'a.dubois@example.com', phone: '+33 1 00 11 22 33',
        company: 'Export France SARL',
        originCity: 'Paris', originCountry: 'France',
        destinationCity: 'Lagos', destinationCountry: 'Nigeria',
        weightKg: 85, transportMode: 'AIR', category: 'FREIGHT',
        message: 'We need to ship medical equipment urgently. Target lead time: 72 hours.',
        status: LeadStatus.NEW,
      },
      {
        fullName: 'Nadia Ouedraogo', email: 'n.ouedraogo@example.com', phone: '+226 70 00 00 00',
        company: 'Textiles BF',
        originCity: 'Ouagadougou', originCountry: 'Burkina Faso',
        destinationCity: 'Paris', destinationCountry: 'France',
        weightKg: 450, lengthCm: 200, widthCm: 120, heightCm: 150,
        transportMode: 'SEA', category: 'FREIGHT',
        message: 'Regular fabric shipments. Looking for a long-term logistics partner.',
        status: LeadStatus.CONTACTED,
      },
    ];

    for (const l of leads) {
      await this.leadRepo.save(this.leadRepo.create(l as any));
    }
    this.log.log(`  ${leads.length} quote requests created`);
  }

  // ─────────────────────────────────────────────────────────
  // Demo contact messages
  // ─────────────────────────────────────────────────────────
  private async seedMessages() {
    const messages = [
      {
        fullName: 'John Morel', email: 'j.morel@example.com', phone: '+33 6 12 34 56 78',
        subject: 'General enquiry', status: MessageStatus.UNREAD,
        message: 'Hello, do you offer short-term warehouse storage before final delivery? Thank you.',
      },
      {
        fullName: 'Aminata Traoré', email: 'a.traore@example.com',
        subject: 'Shipment tracking', status: MessageStatus.READ,
        message: 'My parcel TAC-DEM-001 was due yesterday. Could you give me an update? Many thanks.',
      },
    ];

    for (const m of messages) {
      await this.msgRepo.save(this.msgRepo.create(m as any));
    }
    this.log.log(`  ${messages.length} messages created`);
  }

  // ─────────────────────────────────────────────────────────
  // Demo testimonials (fictitious — replace with real customer reviews)
  // ─────────────────────────────────────────────────────────
  private async seedTestimonials() {
    const testimonials = [
      {
        name: 'Anthony Dubois', role: 'Export Director', company: 'Export France SARL',
        content: 'Our international shipping is far easier to manage. Lead times are met and live tracking gives us full visibility of every consignment.',
        rating: 5, avatarInitials: 'AD', displayOrder: 1,
      },
      {
        name: 'Nadia Ouedraogo', role: 'Managing Director', company: 'Textiles BF',
        content: 'Since we started shipping between Paris and Ouagadougou with them, we have saved a great deal of time. The team is responsive and the prices are fair.',
        rating: 5, avatarInitials: 'NO', displayOrder: 2,
      },
      {
        name: 'Mark Lefevre', role: 'Supply Chain Manager', company: 'IndustrialPro',
        content: 'The customs clearance service is genuinely efficient. Our industrial equipment gets through customs without a hitch.',
        rating: 5, avatarInitials: 'ML', displayOrder: 3,
      },
      {
        name: 'Yasmine Benali', role: 'Founder', company: 'Artisan DZ',
        content: 'Ideal for a small business like mine. I ship handmade goods from Algeria to Europe every month: on time, nothing lost, clear tracking.',
        rating: 5, avatarInitials: 'YB', displayOrder: 4,
      },
      {
        name: 'Thomas Girard', role: 'Head of Purchasing', company: 'MedSupply',
        content: 'For sensitive medical equipment we needed a carrier we could trust. Cold chain, IATA rules and traceability are all handled professionally.',
        rating: 5, avatarInitials: 'TG', displayOrder: 5,
      },
      {
        name: 'Fatoumata Diallo', role: 'Import-Export Manager', company: 'West Africa Trade',
        content: 'Our volumes have doubled in two years and the service has kept pace. Their West African network is impressive.',
        rating: 4, avatarInitials: 'FD', displayOrder: 6,
      },
    ];

    for (const t of testimonials) {
      await this.testimonialRepo.save(this.testimonialRepo.create(t));
    }
    this.log.log(`  ${testimonials.length} testimonials created`);
  }

  // ─────────────────────────────────────────────────────────
  // Demo partners — fictitious names: listing a real company as a partner requires its agreement
  // ─────────────────────────────────────────────────────────
  private async seedPartners() {
    const partners = [
      { name: 'Northwind Air Cargo', logoUrl: '', websiteUrl: '', displayOrder: 1 },
      { name: 'Bluewave Shipping',   logoUrl: '', websiteUrl: '', displayOrder: 2 },
      { name: 'Sahel Road Freight',  logoUrl: '', websiteUrl: '', displayOrder: 3 },
      { name: 'Harbourline',         logoUrl: '', websiteUrl: '', displayOrder: 4 },
      { name: 'Meridian Customs',    logoUrl: '', websiteUrl: '', displayOrder: 5 },
    ];

    for (const p of partners) {
      await this.partnerRepo.save(this.partnerRepo.create(p as any));
    }
    this.log.log(`  ${partners.length} partners created`);
  }
}
