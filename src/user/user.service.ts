import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './user.repository';
import { SignInDto } from './dto/signIn.dto';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { email } = createUserDto;

    const user = await this.userRepository.getUserByEmail(email);
    if (user) throw new ConflictException('User already exists!');

    return this.userRepository.createUser(createUserDto);
  }

  async findOne(signInDto: SignInDto) {
    const { email, password } = signInDto;

    const user = await this.userRepository.getUserByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials!');

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      throw new UnauthorizedException('Invalid credentials!');
    }

    return this.generateToken(user);
  }

  private generateToken(user: User) {
    const { id, email, name } = user;

    return {
      token: this.jwtService.sign(
        {
          email,
          name,
        },
        { subject: String(id) },
      ),
    };
  }
}
