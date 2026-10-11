import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, IsUrl, Max, MaxLength, Min, MinLength, ValidateIf } from 'class-validator';

const notEmpty = (_: unknown, v: unknown) => v !== '';

export class CreatePartnerDto {
  @IsString() @MinLength(1) @MaxLength(120) name: string;
  @IsOptional() @ValidateIf(notEmpty) @IsUrl({ protocols: ['https'] }) logoUrl?: string;
  @IsOptional() @ValidateIf(notEmpty) @IsUrl({ protocols: ['https'] }) websiteUrl?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(999) displayOrder?: number;
}

export class UpdatePartnerDto extends PartialType(CreatePartnerDto) {}
