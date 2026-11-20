import { IsString, IsEnum, IsNumber, IsOptional, IsDateString, Max, MaxLength, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { CheckpointStatus } from '../../../entities/checkpoint.entity';

export class UpdateCheckpointDto {
  @IsString()  @IsOptional() @MaxLength(100) city?: string;
  @IsString()  @IsOptional() @MaxLength(100) country?: string;
  @Type(() => Number) @IsNumber() @IsOptional() @Min(-90) @Max(90) lat?: number;
  @Type(() => Number) @IsNumber() @IsOptional() @Min(-180) @Max(180) lng?: number;
  @IsEnum(CheckpointStatus)   @IsOptional() status?: CheckpointStatus;
  @IsString()  @IsOptional() @MaxLength(200) statusLabel?: string;
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()  @IsOptional() @MaxLength(40) customName?: string | null;
  @IsString()  @IsOptional() @MaxLength(200) facility?: string;
  @IsDateString() @IsOptional() occurredAt?: string;
}
