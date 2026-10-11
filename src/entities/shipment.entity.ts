import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, OneToMany,
} from 'typeorm';
import { Checkpoint } from './checkpoint.entity';

export enum ShipmentStatus {
  PENDING    = 'PENDING',
  PICKED_UP  = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  IN_CUSTOMS = 'IN_CUSTOMS',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED  = 'DELIVERED',
  EXCEPTION  = 'EXCEPTION',
}

export enum ShipmentCategory {
  DOCUMENT   = 'DOCUMENT',
  PARCEL     = 'PARCEL',
  FREIGHT    = 'FREIGHT',
  FRAGILE    = 'FRAGILE',
  PERISHABLE = 'PERISHABLE',
  DANGEROUS  = 'DANGEROUS',
}

export enum TransportMode {
  AIR   = 'AIR',
  SEA   = 'SEA',
  ROAD  = 'ROAD',
  MULTI = 'MULTI',
}

@Entity('shipments')
export class Shipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  trackingNumber: string; // e.g. TAC9XJ4KL2MNP

  // ── Sender ────────────────────────────────────────
  @Column()
  senderName: string;

  @Column()
  senderEmail: string;

  @Column()
  senderPhone: string;

  @Column()
  senderAddress: string;

  @Column()
  senderCity: string;

  @Column()
  senderCountry: string;

  // ── Recipient ──────────────────────────────────────
  @Column()
  receiverName: string;

  @Column()
  receiverEmail: string;

  @Column()
  receiverPhone: string;

  @Column()
  receiverAddress: string;

  @Column()
  receiverCity: string;

  @Column()
  receiverCountry: string;

  // ── Parcel ─────────────────────────────────────────────
  @Column('decimal', { precision: 10, scale: 2 })
  weightKg: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  lengthCm: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  widthCm: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  heightCm: number;

  @Column({ type: 'enum', enum: ShipmentCategory, default: ShipmentCategory.PARCEL })
  category: ShipmentCategory;

  @Column({ type: 'enum', enum: TransportMode, default: TransportMode.AIR })
  transportMode: TransportMode;

  @Column({ nullable: true })
  description: string;

  // ── Status & dates ────────────────────────────────────
  @Column({ type: 'enum', enum: ShipmentStatus, default: ShipmentStatus.PENDING })
  status: ShipmentStatus;

  @Column({ type: 'date', nullable: true })
  estimatedDelivery: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  declaredValue: number;

  @Column({ nullable: true })
  currency: string;

  @Column({ default: false })
  isInsured: boolean;

  @Column({ nullable: true })
  notes: string;

  @OneToMany(() => Checkpoint, (cp) => cp.shipment, { cascade: true, eager: false })
  checkpoints: Checkpoint[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
