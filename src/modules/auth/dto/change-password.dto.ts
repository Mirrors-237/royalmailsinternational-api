import { IsString, MaxLength, MinLength } from 'class-validator';
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from '../password';

export class ChangePasswordDto {
  @IsString()
  @MaxLength(MAX_PASSWORD_LENGTH)
  currentPassword: string;

  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH, { message: `The new password must be at least ${MIN_PASSWORD_LENGTH} characters long.` })
  @MaxLength(MAX_PASSWORD_LENGTH, { message: `The new password must be at most ${MAX_PASSWORD_LENGTH} characters long.` })
  newPassword: string;
}
