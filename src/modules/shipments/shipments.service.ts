import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListQueryDto, likeTerm } from '../../common/dto/list-query.dto';
import { Shipment } from '../../entities/shipment.entity';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { generateTrackingId } from '../../common/utils/tracking-id.util';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class ShipmentsService {
  constructor(
    @InjectRepository(Shipment) private repo: Repository<Shipment>,
    private settingsService: SettingsService,
  ) {}

  async create(dto: CreateShipmentDto): Promise<Shipment> {
    const settings = await this.settingsService.get();
    const prefix   = settings?.trackingPrefix || 'TAC';

    // Generate a tracking number that is guaranteed to be unique
    let trackingNumber: string;
    let attempts = 0;
    do {
      trackingNumber = generateTrackingId(prefix);
      const exists = await this.repo.findOne({ where: { trackingNumber } });
      if (!exists) break;
      attempts++;
    } while (attempts < 10);

    if (attempts >= 10) {
      throw new ConflictException('Could not generate a unique tracking number');
    }

    const shipment = this.repo.create({ ...dto, trackingNumber });
    return this.repo.save(shipment);
  }

  async findAll({ page, limit, q, status }: ListQueryDto) {
    const qb = this.repo.createQueryBuilder('s').orderBy('s.createdAt', 'DESC').skip((page - 1) * limit).take(limit);
    if (status) qb.andWhere('s.status = :status', { status });
    if (q) {
      qb.andWhere(
        `(s.trackingNumber ILIKE :q OR s.senderName ILIKE :q OR s.receiverName ILIKE :q OR s.senderCity ILIKE :q OR s.receiverCity ILIKE :q)`,
        { q: likeTerm(q) },
      );
    }
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async findByTracking(trackingNumber: string): Promise<Shipment> {
    const shipment = await this.repo.findOne({
      where: { trackingNumber: trackingNumber.toUpperCase() },
      relations: { checkpoints: true },
      order: { checkpoints: { occurredAt: 'ASC' } } as any,
    });
    if (!shipment) throw new NotFoundException(`Tracking number not found: ${trackingNumber}`);
    return shipment;
  }

  async findOne(id: string): Promise<Shipment> {
    const shipment = await this.repo.findOne({
      where: { id },
      relations: { checkpoints: true },
      order: { checkpoints: { occurredAt: 'ASC' } } as any,
    });
    if (!shipment) throw new NotFoundException('Shipment not found');
    return shipment;
  }

  async update(id: string, dto: UpdateShipmentDto): Promise<Shipment> {
    const shipment = await this.findOne(id);
    Object.assign(shipment, dto);
    return this.repo.save(shipment);
  }

  async remove(id: string): Promise<void> {
    const shipment = await this.findOne(id);
    await this.repo.remove(shipment);
  }

  async getStats() {
    const total    = await this.repo.count();
    const delivered = await this.repo.count({ where: { status: 'DELIVERED' as any } });
    const inTransit = await this.repo.count({ where: { status: 'IN_TRANSIT' as any } });
    const inCustoms = await this.repo.count({ where: { status: 'IN_CUSTOMS' as any } });
    return { total, delivered, inTransit, inCustoms };
  }
}
