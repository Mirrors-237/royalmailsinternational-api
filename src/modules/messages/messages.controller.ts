import { Controller, Get, Post, Delete, Patch, Param, Body, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { UpdateMessageStatusDto } from './messages.service';
import { RateLimit } from '../../common/rate-limit/rate-limit.decorator';

@Controller('messages')
export class MessagesController {
  constructor(private service: MessagesService) {}

  // Public
  @Post()
  @RateLimit(5, 10 * 60_000)
  create(@Body() dto: CreateMessageDto) {
    return this.service.create(dto);
  }

  // Admin
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
  @Patch(':id/read')
  markRead(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.markRead(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  setStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateMessageStatusDto) {
    return this.service.setStatus(id, dto.status);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
