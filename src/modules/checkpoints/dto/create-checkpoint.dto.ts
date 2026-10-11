import { IsString, IsEnum, IsNumber, IsOptional, IsDateString, IsUUID, Max, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CheckpointStatus } from '../../../entities/checkpoint.entity';

export class CreateCheckpointDto {
  @IsUUID() shipmentId: string;
  @IsString() @MaxLength(100) city: string;
  @IsString() @MaxLength(100) country: string;
  @Type(() => Number) @IsNumber() @Min(-90) @Max(90) lat: number;
  @Type(() => Number) @IsNumber() @Min(-180) @Max(180) lng: number;
  @IsEnum(CheckpointStatus) status: CheckpointStatus;
  @IsString() @MaxLength(200) statusLabel: string;
  @IsString() @IsOptional() @MaxLength(200) facility?: string;
  @IsDateString() occurredAt: string;
}
