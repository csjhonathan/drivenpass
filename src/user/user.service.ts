import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './user.repository';
import { SignInDto } from './dto/signIn.dto';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { DeleteUserDto } from './dto/delete-user.dto';
import { AuthenticatedUser } from '../protocols/protocols';

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

  async findOneByEmail(signInDto: SignInDto) {
    const { email, password } = signInDto;

    const user = await this.userRepository.getUserByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials!');

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      throw new UnauthorizedException('Invalid credentials!');
    }

    return this.generateToken(user);
  }

  async findOneById(id: number) {
    const user = await this.userRepository.getUserById(id);
    if (!user) throw new NotFoundException('User not found!');

    return user;
  }

  async deleteUser(
    deleteUserDto: DeleteUserDto,
    loggedUser: AuthenticatedUser,
    userId: number,
  ) {
    const userById = await this.findOneById(userId);

    if (loggedUser.id !== userById.id) {
      throw new UnauthorizedException(
        'You have not permission to delete this user!',
      );
    }
    const { email } = loggedUser;
    const { password } = deleteUserDto;

    const user = await this.userRepository.getUserByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials!');

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      throw new UnauthorizedException('Invalid credentials!');
    }

    return this.userRepository.deleteUserData(userId);
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

  checkToken(token: string) {
    const tokenData = this.jwtService.verify(token);
    return { ...tokenData, sub: parseInt(tokenData.sub) } as {
      email: string;
      name: string;
      sub: number;
    };
  }
}
