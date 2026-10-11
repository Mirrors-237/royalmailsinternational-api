import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

// Admin lists: bounded pagination, free-text search and status filter
export class ListQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page = 1;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100)
  limit = 20;

  @IsOptional() @IsString() @MaxLength(100)
  q?: string;

  @IsOptional() @IsString() @MaxLength(30)
  status?: string;
}

// Escapes the LIKE wildcards in user input
export const likeTerm = (q: string) => `%${q.trim().replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
