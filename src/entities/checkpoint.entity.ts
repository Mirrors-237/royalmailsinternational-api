import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn,
} from 'typeorm';
import { Shipment } from './shipment.entity';

export enum CheckpointStatus {
  PICKED_UP        = 'PICKED_UP',
  DEPARTED         = 'DEPARTED',
  IN_TRANSIT       = 'IN_TRANSIT',
  ARRIVED          = 'ARRIVED',
  IN_CUSTOMS       = 'IN_CUSTOMS',
  CUSTOMS_CLEARED  = 'CUSTOMS_CLEARED',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED        = 'DELIVERED',
  EXCEPTION        = 'EXCEPTION',
  RETURNED         = 'RETURNED',
}

@Entity('checkpoints')
export class Checkpoint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Shipment, (s) => s.checkpoints, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shipmentId' })
  shipment: Shipment;

  @Column()
  shipmentId: string;

  @Column()
  city: string;

  @Column()
  country: string;

  @Column('decimal', { precision: 10, scale: 7 })
  lat: number;

  @Column('decimal', { precision: 10, scale: 7 })
  lng: number;

  @Column({ type: 'enum', enum: CheckpointStatus })
  status: CheckpointStatus;

  @Column()
  statusLabel: string; // e.g. "Parcel collected at Paris CDG"

  @Column({ nullable: true })
  facility: string; // e.g. "Charles de Gaulle airport"

  @Column({ type: 'timestamptz' })
  occurredAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
