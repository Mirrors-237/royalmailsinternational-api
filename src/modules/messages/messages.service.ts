import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsEnum } from 'class-validator';
import { ListQueryDto, likeTerm } from '../../common/dto/list-query.dto';
import { ContactMessage, MessageStatus } from '../../entities/contact-message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { MailService } from '../../common/mail/mail.service';

export class UpdateMessageStatusDto {
  @IsEnum(MessageStatus) status: MessageStatus;
}

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(ContactMessage) private repo: Repository<ContactMessage>,
    private mailService: MailService,
  ) {}

  async create(dto: CreateMessageDto): Promise<ContactMessage> {
    const msg = await this.repo.save(this.repo.create(dto));
    
    // Send the email in the background (non-blocking)
    this.mailService.sendContactNotification(msg).catch(() => {
      // Logged by MailService
    });

    return msg;
  }

  async findAll({ page, limit, q, status }: ListQueryDto) {
    const qb = this.repo.createQueryBuilder('m').orderBy('m.createdAt', 'DESC').skip((page - 1) * limit).take(limit);
    if (status) qb.andWhere('m.status = :status', { status });
    if (q) qb.andWhere('(m.fullName ILIKE :q OR m.email ILIKE :q OR m.subject ILIKE :q OR m.message ILIKE :q)', { q: likeTerm(q) });
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async setStatus(id: string, status: MessageStatus): Promise<ContactMessage> {
    const msg = await this.repo.findOne({ where: { id } });
    if (!msg) throw new NotFoundException();
    msg.status = status;
    return this.repo.save(msg);
  }

  async markRead(id: string): Promise<ContactMessage> {
    const msg = await this.repo.findOne({ where: { id } });
    if (!msg) throw new NotFoundException();
    msg.status = MessageStatus.READ;
    return this.repo.save(msg);
  }

  async remove(id: string): Promise<void> {
    const msg = await this.repo.findOne({ where: { id } });
    if (!msg) throw new NotFoundException();
    await this.repo.remove(msg);
  }

  async getStats() {
    const total  = await this.repo.count();
    const unread = await this.repo.count({ where: { status: MessageStatus.UNREAD } });
    return { total, unread };
  }
}
