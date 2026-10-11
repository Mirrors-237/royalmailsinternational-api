import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Partner } from '../../entities/partner.entity';

@Injectable()
export class PartnersService {
  constructor(
    @InjectRepository(Partner) private repo: Repository<Partner>,
  ) {}

  findActive(): Promise<Partner[]> {
    return this.repo.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  findAll(): Promise<Partner[]> {
    return this.repo.find({ order: { displayOrder: 'ASC', createdAt: 'ASC' } });
  }

  create(dto: Partial<Partner>): Promise<Partner> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: number, dto: Partial<Partner>): Promise<Partner> {
    await this.repo.update(id, dto);
    return this.repo.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
