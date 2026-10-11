import { Controller, Post, Get, Patch, Delete, Param, Body, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { CheckpointsService } from './checkpoints.service';
import { CreateCheckpointDto } from './dto/create-checkpoint.dto';
import { UpdateCheckpointDto } from './dto/update-checkpoint.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('checkpoints')
@UseGuards(JwtAuthGuard)
export class CheckpointsController {
  constructor(private service: CheckpointsService) {}

  @Post()
  create(@Body() dto: CreateCheckpointDto) {
    return this.service.create(dto);
  }

  @Get('shipment/:shipmentId')
  findByShipment(@Param('shipmentId', ParseUUIDPipe) shipmentId: string) {
    return this.service.findByShipment(shipmentId);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCheckpointDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
