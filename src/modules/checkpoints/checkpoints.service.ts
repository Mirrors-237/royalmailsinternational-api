import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Checkpoint } from '../../entities/checkpoint.entity';
import { Shipment, ShipmentStatus } from '../../entities/shipment.entity';
import { CheckpointStatus } from '../../entities/checkpoint.entity';
import { CreateCheckpointDto } from './dto/create-checkpoint.dto';
import { UpdateCheckpointDto } from './dto/update-checkpoint.dto';

// Mapping checkpoint → shipment status (RETURNED and CUSTOM keep the current status)
const STATUS_MAP: Partial<Record<CheckpointStatus, ShipmentStatus>> = {
  [CheckpointStatus.PICKED_UP]:        ShipmentStatus.PICKED_UP,
  [CheckpointStatus.DEPARTED]:         ShipmentStatus.IN_TRANSIT,
  [CheckpointStatus.IN_TRANSIT]:       ShipmentStatus.IN_TRANSIT,
  [CheckpointStatus.ARRIVED]:          ShipmentStatus.IN_TRANSIT,
  [CheckpointStatus.IN_CUSTOMS]:       ShipmentStatus.IN_CUSTOMS,
  [CheckpointStatus.CUSTOMS_CLEARED]:  ShipmentStatus.IN_TRANSIT,
  [CheckpointStatus.OUT_FOR_DELIVERY]: ShipmentStatus.OUT_FOR_DELIVERY,
  [CheckpointStatus.DELIVERED]:        ShipmentStatus.DELIVERED,
  [CheckpointStatus.EXCEPTION]:        ShipmentStatus.EXCEPTION,
};

@Injectable()
export class CheckpointsService {
  constructor(
    @InjectRepository(Checkpoint) private cpRepo: Repository<Checkpoint>,
    @InjectRepository(Shipment)   private shipRepo: Repository<Shipment>,
  ) {}

  async create(dto: CreateCheckpointDto): Promise<Checkpoint> {
    const shipment = await this.shipRepo.findOne({ where: { id: dto.shipmentId } });
    if (!shipment) throw new NotFoundException('Shipment not found');

    const checkpoint = this.cpRepo.create({
      ...dto,
      customName: dto.status === CheckpointStatus.CUSTOM ? dto.customName : null,
      occurredAt: new Date(dto.occurredAt),
    });
    const saved = await this.cpRepo.save(checkpoint);

    // Update the shipment status automatically
    const newStatus = STATUS_MAP[dto.status];
    if (newStatus) {
      shipment.status = newStatus;
      await this.shipRepo.save(shipment);
    }

    return saved;
  }

  async findByShipment(shipmentId: string): Promise<Checkpoint[]> {
    return this.cpRepo.find({
      where: { shipmentId },
      order: { occurredAt: 'ASC' },
    });
  }

  async update(id: string, dto: UpdateCheckpointDto): Promise<Checkpoint> {
    const cp = await this.cpRepo.findOne({ where: { id }, relations: { shipment: true } });
    if (!cp) throw new NotFoundException('Checkpoint not found');

    // A custom event keeps a name chosen in the admin; the other types never have one
    const status = dto.status ?? cp.status;
    const customName = status === CheckpointStatus.CUSTOM ? (dto.customName !== undefined ? dto.customName : cp.customName) || null : null;
    if (status === CheckpointStatus.CUSTOM && !customName) {
      throw new BadRequestException('Enter the name of the step shown to the customer');
    }
    cp.customName = customName;

    if (dto.occurredAt) cp.occurredAt = new Date(dto.occurredAt);
    if (dto.city)        cp.city        = dto.city;
    if (dto.country)     cp.country     = dto.country;
    if (dto.lat !== undefined) cp.lat   = dto.lat;
    if (dto.lng !== undefined) cp.lng   = dto.lng;
    if (dto.statusLabel) cp.statusLabel = dto.statusLabel;
    if (dto.facility !== undefined) cp.facility = dto.facility;

    if (dto.status) {
      cp.status = dto.status;
      const newShipStatus = STATUS_MAP[dto.status];
      if (newShipStatus && cp.shipment) {
        cp.shipment.status = newShipStatus;
        await this.shipRepo.save(cp.shipment);
      }
    }

    return this.cpRepo.save(cp);
  }

  async remove(id: string): Promise<void> {
    const cp = await this.cpRepo.findOne({ where: { id } });
    if (!cp) throw new NotFoundException('Checkpoint not found');
    await this.cpRepo.remove(cp);
  }
}
