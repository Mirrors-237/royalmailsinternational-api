import { IsEmail, IsIn, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ShipmentCategory, TransportMode } from '../../../entities/shipment.entity';

// Public quote request: every text field is bounded (stored in the database and copied into an email)
export class CreateLeadDto {
  @IsString() @MaxLength(120) fullName: string;
  @IsEmail() @MaxLength(254) email: string;
  @IsString() @MaxLength(40) phone: string;
  @IsString() @IsOptional() @MaxLength(120) company?: string;
  @IsString() @MaxLength(100) originCity: string;
  @IsString() @MaxLength(100) originCountry: string;
  @IsString() @MaxLength(100) destinationCity: string;
  @IsString() @MaxLength(100) destinationCountry: string;
  @Type(() => Number) @IsNumber() @Min(0.01) @Max(100_000) weightKg: number;
  @Type(() => Number) @IsNumber() @IsOptional() @Min(1) @Max(10_000) lengthCm?: number;
  @Type(() => Number) @IsNumber() @IsOptional() @Min(1) @Max(10_000) widthCm?: number;
  @Type(() => Number) @IsNumber() @IsOptional() @Min(1) @Max(10_000) heightCm?: number;
  @IsOptional() @IsIn(Object.values(TransportMode)) transportMode?: string;
  @IsOptional() @IsIn(Object.values(ShipmentCategory)) category?: string;
  @IsString() @IsOptional() @MaxLength(5000) message?: string;
}
