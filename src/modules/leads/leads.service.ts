import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ListQueryDto, likeTerm } from '../../common/dto/list-query.dto';
import { Lead, LeadStatus } from '../../entities/lead.entity';
import { CreateLeadDto } from './dto/create-lead.dto';
import { MailService } from '../../common/mail/mail.service';

export class UpdateLeadStatusDto {
  @IsEnum(LeadStatus) status: LeadStatus;
  @IsOptional() @IsString() @MaxLength(5000) adminNotes?: string;
}

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead) private repo: Repository<Lead>,
    private mailService: MailService,
  ) {}

  async create(dto: CreateLeadDto): Promise<Lead> {
    const lead = await this.repo.save(this.repo.create(dto));
    
    this.mailService.sendLeadNotification(lead).catch(() => {
      // Logged by MailService
    });

    return lead;
  }

  async findAll({ page, limit, q, status }: ListQueryDto) {
    const qb = this.repo.createQueryBuilder('l').orderBy('l.createdAt', 'DESC').skip((page - 1) * limit).take(limit);
    if (status) qb.andWhere('l.status = :status', { status });
    if (q) {
      qb.andWhere(`(l.fullName ILIKE :q OR l.email ILIKE :q OR l.company ILIKE :q OR l.originCity ILIKE :q OR l.destinationCity ILIKE :q)`, { q: likeTerm(q) });
    }
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async findOne(id: string): Promise<Lead> {
    const lead = await this.repo.findOne({ where: { id } });
    if (!lead) throw new NotFoundException('Quote request not found');
    return lead;
  }

  async updateStatus(id: string, dto: UpdateLeadStatusDto): Promise<Lead> {
    const lead = await this.findOne(id);
    lead.status = dto.status;
    if (dto.adminNotes !== undefined) lead.adminNotes = dto.adminNotes;
    return this.repo.save(lead);
  }

  async remove(id: string): Promise<void> {
    const lead = await this.findOne(id);
    await this.repo.remove(lead);
  }

  async getStats() {
    const total      = await this.repo.count();
    const newLeads   = await this.repo.count({ where: { status: LeadStatus.NEW } });
    const contacted  = await this.repo.count({ where: { status: LeadStatus.CONTACTED } });
    const converted  = await this.repo.count({ where: { status: LeadStatus.CONVERTED } });
    return { total, new: newLeads, contacted, converted };
  }
}
