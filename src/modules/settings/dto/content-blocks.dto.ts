import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional, IsString, Matches, MaxLength, ValidateIf, ValidateNested } from 'class-validator';

export class ContentBlockDto {
  @IsBoolean() enabled: boolean;
  @IsString() @MaxLength(100)  title: string;
  @IsString() @MaxLength(1000) text: string;
  @IsString() @MaxLength(40)   buttonLabel: string;

  // A page of the website (/quote, /send#prepare) or an https:// address; empty = no button
  @IsString() @ValidateIf((_, v) => v !== '')
  @Matches(/^(\/(?!\/)\S*|https:\/\/\S+)$/, { message: 'The button link must be a page of the website (starting with /) or an https:// address' })
  @MaxLength(300)
  buttonUrl: string;

  @IsString() @MaxLength(200)  imageAlt: string;
  @IsIn(['left', 'right'])     imageSide: 'left' | 'right';
}

// One optional block per placement (see entities/content-block.ts)
export class ContentBlocksDto {
  @IsOptional() @ValidateNested() @Type(() => ContentBlockDto) home?: ContentBlockDto;
  @IsOptional() @ValidateNested() @Type(() => ContentBlockDto) send?: ContentBlockDto;
  @IsOptional() @ValidateNested() @Type(() => ContentBlockDto) receive?: ContentBlockDto;
  @IsOptional() @ValidateNested() @Type(() => ContentBlockDto) business?: ContentBlockDto;
  @IsOptional() @ValidateNested() @Type(() => ContentBlockDto) about?: ContentBlockDto;
}
