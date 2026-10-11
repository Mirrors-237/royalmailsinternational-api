import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { BCRYPT_ROUNDS } from './password';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Incorrect email address or password.');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Incorrect email address or password.');

    return {
      accessToken: this.sign(user),
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  async me(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return { id: user.id, email: user.email, role: user.role };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    // 400, not 401: a wrong current password must not sign the user out
    if (!(await bcrypt.compare(dto.currentPassword, user.passwordHash))) {
      throw new BadRequestException('The current password is incorrect.');
    }
    if (dto.newPassword === dto.currentPassword) {
      throw new BadRequestException('The new password must be different from the current one.');
    }

    // Tokens issued before this moment are refused from now on (see JwtStrategy)
    user.passwordHash      = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);
    user.passwordChangedAt = new Date();
    await this.userRepo.save(user);

    return { accessToken: this.sign(user) };
  }

  private sign(user: User) {
    return this.jwt.sign({ sub: user.id, email: user.email });
  }
}
