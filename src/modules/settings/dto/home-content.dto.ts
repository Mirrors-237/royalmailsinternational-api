import { Type } from 'class-transformer';
import {
  ArrayMaxSize, ArrayMinSize, IsArray, IsIn, IsOptional, IsString, MaxLength, MinLength, ValidateNested,
} from 'class-validator';

export class HomeStatDto {
  @IsString() @MinLength(1) @MaxLength(12) value: string;
  @IsString() @MinLength(1) @MaxLength(40) label: string;
}

export class HomeSampleDto {
  @IsString() @MinLength(1) @MaxLength(60) from: string;
  @IsOptional() @IsString() @MaxLength(60) via?: string;
  @IsString() @MinLength(1) @MaxLength(60) to: string;
  @IsIn(['AIR', 'SEA', 'ROAD']) mode: 'AIR' | 'SEA' | 'ROAD';
  @IsIn(['COLLECTED', 'IN_TRANSIT', 'IN_CUSTOMS', 'DELIVERED']) status: 'COLLECTED' | 'IN_TRANSIT' | 'IN_CUSTOMS' | 'DELIVERED';
}

export class HomeContentDto {
  @IsString() @MaxLength(80)  heroBadge: string;
  @IsString() @MinLength(1) @MaxLength(80) heroTitle: string;
  @IsString() @MaxLength(60)  heroHighlight: string;
  @IsString() @MaxLength(300) heroText: string;

  @IsArray() @ArrayMinSize(3) @ArrayMaxSize(3)
  @ValidateNested({ each: true }) @Type(() => HomeStatDto)
  stats: HomeStatDto[];

  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(6)
  @ValidateNested({ each: true }) @Type(() => HomeSampleDto)
  samples: HomeSampleDto[];
}
