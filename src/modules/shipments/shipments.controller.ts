import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, UseGuards, ParseUUIDPipe
} from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { toPublicTracking } from './public-tracking';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { RateLimit } from '../../common/rate-limit/rate-limit.decorator';

@Controller('shipments')
export class ShipmentsController {
  constructor(private service: ShipmentsService) {}

  // ── Public route: tracking (reduced view, no personal data) ──
  @Get('track/:trackingNumber')
  @RateLimit(30, 60_000) // limits guessing tracking numbers
  async trackPublic(@Param('trackingNumber') trackingNumber: string) {
    return toPublicTracking(await this.service.findByTracking(trackingNumber));
  }

  // ── Admin routes ──────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateShipmentDto) {
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query: ListQueryDto) {
    return this.service.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  stats() {
    return this.service.getStats();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateShipmentDto) {
    return this.service.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
