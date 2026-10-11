import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckpointsController } from './checkpoints.controller';
import { CheckpointsService } from './checkpoints.service';
import { Checkpoint } from '../../entities/checkpoint.entity';
import { Shipment } from '../../entities/shipment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Checkpoint, Shipment])],
  controllers: [CheckpointsController],
  providers: [CheckpointsService],
})
export class CheckpointsModule {}
