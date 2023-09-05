import { JwtService } from '@nestjs/jwt';
import { faker } from '@faker-js/faker';
import { PrismaService } from '../../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

export class UserFactories {
  static userWithoutField(
    field?: 'email' | 'name' | 'password',
    strong?: boolean,
  ) {
    switch (field) {
      case 'email':
        return {
          name: faker.person.firstName(),
          password: strong ? '@Passw0rd' : 'pãodebatata',
        } satisfies { name: string; password: string };
      case 'name':
        return {
          email: faker.internet.email(),
          password: strong ? '@Passw0rd' : 'pãodebatata',
        } satisfies { email: string; password: string };
      case 'password':
        return {
          name: faker.person.firstName(),
          email: faker.internet.email(),
        } satisfies { name: string; email: string };
      default:
        return {};
    }
  }

  static fullBodyUser(strong?: boolean) {
    return {
      name: faker.person.firstName(),
      email: faker.internet.email(),
      password: strong ? '@Passw0rd' : 'pãodebatata',
    } satisfies { name: string; email: string; password: string };
  }

  static createDbUser(prisma: PrismaService) {
    return prisma.user.create({
      data: {
        email: faker.internet.email(),
        name: faker.person.firstName(),
        password: faker.internet.password(),
      },
      select: {
        name: true,
        email: true,
      },
    });
  }

  static createDbUserEncrypted(prisma: PrismaService, user: any) {
    const SHUFFLING = 10;
    return prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        password: bcrypt.hashSync(user.password, SHUFFLING),
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }

  static generateInvalidToken() {
    return `Bearer ${faker.lorem.word()}`;
  }

  static getFakerUserWithId() {
    return {
      id: faker.number.int({ min: 1, max: 10 }),
      name: faker.person.firstName(),
      email: faker.internet.email(),
    } satisfies { id: number; name: string; email: string };
  }

  static generateToken(user: { id: number; name: string; email: string }) {
    const { id, email, name } = user;
    const jwtService = new JwtService({ secret: process.env.JWT_SECRET });
    const token = jwtService.sign(
      {
        email,
        name,
      },
      { subject: String(id) },
    );
    return `Bearer ${token}`;
  }

  static async prismaGetFullUserDataById(prisma: PrismaService, id: number) {
    const [user, creds, cards, notes] = await Promise.all([
      prisma.user.findUnique({ where: { id } }),
      prisma.credential.findMany({ where: { userId: id } }),
      prisma.card.findMany({ where: { userId: id } }),
      prisma.note.findMany({ where: { userId: id } }),
    ]);

    return { user, creds, cards, notes };
  }

  static async createUserAndValidToken(prisma: PrismaService) {
    const fakerUser = UserFactories.fullBodyUser(true);
    const user = await UserFactories.createDbUserEncrypted(prisma, fakerUser);
    const token = UserFactories.generateToken(user);

    return { user, token };
  }
}
