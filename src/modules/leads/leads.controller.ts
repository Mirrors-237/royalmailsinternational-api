import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, UseGuards, ParseUUIDPipe
} from '@nestjs/common';
import { LeadsService, UpdateLeadStatusDto } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { RateLimit } from '../../common/rate-limit/rate-limit.decorator';

@Controller('leads')
export class LeadsController {
  constructor(private service: LeadsService) {}

  // ── Public: quote request ─────────────────────────────
  @Post()
  @RateLimit(5, 10 * 60_000)
  create(@Body() dto: CreateLeadDto) {
    return this.service.create(dto);
  }

  // ── Admin ─────────────────────────────────────────────
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
  @Put(':id/status')
  updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateLeadStatusDto) {
    return this.service.updateStatus(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
