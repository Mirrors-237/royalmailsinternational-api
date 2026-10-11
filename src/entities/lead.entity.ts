import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

export enum LeadStatus {
  NEW       = 'NEW',
  CONTACTED = 'CONTACTED',
  QUOTED    = 'QUOTED',
  CONVERTED = 'CONVERTED',
  LOST      = 'LOST',
}

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ── Contact ───────────────────────────────────────────
  @Column()
  fullName: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  company: string;

  // ── Freight ───────────────────────────────────────────
  @Column()
  originCity: string;

  @Column()
  originCountry: string;

  @Column()
  destinationCity: string;

  @Column()
  destinationCountry: string;

  @Column('decimal', { precision: 10, scale: 2 })
  weightKg: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  lengthCm: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  widthCm: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  heightCm: number;

  @Column({ nullable: true })
  transportMode: string;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  message: string;

  // ── Management ────────────────────────────────────────
  @Column({ type: 'enum', enum: LeadStatus, default: LeadStatus.NEW })
  status: LeadStatus;

  @Column({ nullable: true })
  adminNotes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
