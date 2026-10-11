import {
  IsString, IsEmail, IsEnum, IsNumber, IsOptional,
  IsBoolean, IsDateString, Min, Max, MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ShipmentCategory, ShipmentStatus, TransportMode } from '../../../entities/shipment.entity';

export class CreateShipmentDto {
  // Sender
  @IsString() @MaxLength(120) senderName: string;
  @IsEmail() @MaxLength(254) senderEmail: string;
  @IsString() @MaxLength(120) senderPhone: string;
  @IsString() @MaxLength(200) senderAddress: string;
  @IsString() @MaxLength(120) senderCity: string;
  @IsString() @MaxLength(120) senderCountry: string;

  // Recipient
  @IsString() @MaxLength(120) receiverName: string;
  @IsEmail() @MaxLength(254) receiverEmail: string;
  @IsString() @MaxLength(120) receiverPhone: string;
  @IsString() @MaxLength(200) receiverAddress: string;
  @IsString() @MaxLength(120) receiverCity: string;
  @IsString() @MaxLength(120) receiverCountry: string;

  // Parcel
  @Type(() => Number) @IsNumber() @Min(0.01) @Max(100000) weightKg: number;
  @Type(() => Number) @IsNumber() @IsOptional() lengthCm?: number;
  @Type(() => Number) @IsNumber() @IsOptional() widthCm?: number;
  @Type(() => Number) @IsNumber() @IsOptional() heightCm?: number;

  @IsEnum(ShipmentCategory) @IsOptional() category?: ShipmentCategory;
  @IsEnum(TransportMode)    @IsOptional() transportMode?: TransportMode;
  @IsEnum(ShipmentStatus)   @IsOptional() status?: ShipmentStatus;

  @IsString()  @IsOptional() @MaxLength(500) description?: string;
  @IsDateString() @IsOptional() estimatedDelivery?: string;
  @Type(() => Number) @IsNumber() @IsOptional() declaredValue?: number;
  @IsString()  @IsOptional() @MaxLength(3) currency?: string;
  @IsBoolean() @IsOptional() isInsured?: boolean;
  @IsString()  @IsOptional() @MaxLength(2000) notes?: string;
}
