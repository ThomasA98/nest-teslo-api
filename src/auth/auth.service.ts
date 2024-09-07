import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { BadRequestException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

import { User } from './entities/user.entity';
import { LoginUserDto, CreateUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {

  private readonly logger = new Logger;

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {

      const { password, ...userData } = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });

      await this.userRepository.save(user);

      delete user.password;

      return {
        ...user,
        token: this.getJwtToken({ email: user.email }),
      };

    } catch (error) {
      this.handleDBError(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    try {
      const { email, password } = loginUserDto;

      const user = await this.userRepository.findOne({
        where: { email },
        select: { email: true, password: true },
      });

      if (!user) throw new UnauthorizedException('Credentials are not valid (email)');

      if (!bcrypt.compareSync(password, user.password)) throw new UnauthorizedException('Credentials are not valid (password)');

      return {
        ...user,
        token: this.getJwtToken({ email: user.email }),
      };

    } catch (error) {
      this.handleDBError(error);
    }
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);

    return token;
  }

  private handleDBError(error: any): never {
    if (error?.code === '23505') throw new BadRequestException(error?.detail);
    this.logger.error(error);

    throw new InternalServerErrorException('Please check server logs');
  }
}
