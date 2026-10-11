import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateTestimonialDto {
  @IsString() @MinLength(1) @MaxLength(120) name: string;
  @IsOptional() @IsString() @MaxLength(120) role?: string;
  @IsOptional() @IsString() @MaxLength(120) company?: string;
  @IsString() @MinLength(10) @MaxLength(1000) content: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(5) rating?: number;
  @IsOptional() @IsString() @MaxLength(3) avatarInitials?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(999) displayOrder?: number;
}

export class UpdateTestimonialDto extends PartialType(CreateTestimonialDto) {}
