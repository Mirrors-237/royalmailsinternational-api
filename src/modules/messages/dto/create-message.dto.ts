import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

// Public contact message: every text field is bounded (stored in the database and copied into an email)
export class CreateMessageDto {
  @IsString() @MaxLength(120) fullName: string;
  @IsEmail() @MaxLength(254) email: string;
  @IsString() @IsOptional() @MaxLength(40) phone?: string;
  @IsString() @MaxLength(200) subject: string;
  @IsString() @MinLength(10) @MaxLength(5000) message: string;
}
