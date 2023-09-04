import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserRepository {
  private SHUFFLING = 10;

  constructor(private readonly prisma: PrismaService) {}

  getUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  getUserById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true },
    });
  }

  createUser(userDto: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        ...userDto,
        password: bcrypt.hashSync(userDto.password, this.SHUFFLING),
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }

  deleteUserData(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
}
