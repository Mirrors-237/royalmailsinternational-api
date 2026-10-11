import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { User }           from '../../entities/user.entity';
import { SiteSettings }   from '../../entities/site-settings.entity';
import { Shipment }       from '../../entities/shipment.entity';
import { Checkpoint }     from '../../entities/checkpoint.entity';
import { Lead }           from '../../entities/lead.entity';
import { ContactMessage } from '../../entities/contact-message.entity';
import { Testimonial }    from '../../entities/testimonial.entity';
import { Partner }        from '../../entities/partner.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, SiteSettings, Shipment, Checkpoint, Lead, ContactMessage,
      Testimonial, Partner,
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
