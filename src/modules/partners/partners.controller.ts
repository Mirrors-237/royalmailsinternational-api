import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PartnersService } from './partners.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePartnerDto, UpdatePartnerDto } from './dto/partner.dto';

@Controller('partners')
export class PartnersController {
  constructor(private service: PartnersService) {}

  @Get()
  findActive() {
    return this.service.findActive();
  }

  @UseGuards(JwtAuthGuard)
  @Get('all')
  findAll() {
    return this.service.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreatePartnerDto) {
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePartnerDto) {
    return this.service.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
