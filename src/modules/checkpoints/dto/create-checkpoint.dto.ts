import { IsString, IsEnum, IsNumber, IsOptional, IsDateString, IsNotEmpty, IsUUID, Max, MaxLength, Min, ValidateIf } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { CheckpointStatus } from '../../../entities/checkpoint.entity';

export class CreateCheckpointDto {
  @IsUUID() shipmentId: string;
  @IsString() @MaxLength(100) city: string;
  @IsString() @MaxLength(100) country: string;
  @Type(() => Number) @IsNumber() @Min(-90) @Max(90) lat: number;
  @Type(() => Number) @IsNumber() @Min(-180) @Max(180) lng: number;
  @IsEnum(CheckpointStatus) status: CheckpointStatus;
  @IsString() @MaxLength(200) statusLabel: string;
  // Required for a custom event, ignored for the other types
  @ValidateIf((o: CreateCheckpointDto) => o.status === CheckpointStatus.CUSTOM)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString() @IsNotEmpty() @MaxLength(40) customName?: string | null;
  @IsString() @IsOptional() @MaxLength(200) facility?: string;
  @IsDateString() occurredAt: string;
}
