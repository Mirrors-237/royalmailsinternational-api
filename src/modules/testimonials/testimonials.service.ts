import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Testimonial } from '../../entities/testimonial.entity';

@Injectable()
export class TestimonialsService {
  constructor(
    @InjectRepository(Testimonial) private repo: Repository<Testimonial>,
  ) {}

  findActive(): Promise<Testimonial[]> {
    return this.repo.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  findAll(): Promise<Testimonial[]> {
    return this.repo.find({ order: { displayOrder: 'ASC', createdAt: 'ASC' } });
  }

  create(dto: Partial<Testimonial>): Promise<Testimonial> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: number, dto: Partial<Testimonial>): Promise<Testimonial> {
    await this.repo.update(id, dto);
    return this.repo.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
