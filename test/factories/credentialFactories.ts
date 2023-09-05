import { faker } from '@faker-js/faker';
import { PrismaService } from '../../src/prisma/prisma.service';

type InsertCredential = {
  title?: string;
  url?: string;
  username?: string;
  password?: string;
};

export class CredentialFactories {
  private Cryptr = require('cryptr');
  private crypter: any;

  constructor() {
    this.crypter = new this.Cryptr(process.env.CRYPTR_SECRET);
  }

  static credentialWithoutFieldorFullBody(
    field?: 'title' | 'url' | 'username' | 'password' | 'full',
  ): InsertCredential {
    switch (field) {
      case 'full':
        return {
          title: faker.internet.domainWord(),
          url: faker.internet.url(),
          username: faker.person.firstName(),
          password: faker.internet.password(),
        };
      case 'title':
        return {
          url: faker.internet.url(),
          username: faker.person.firstName(),
          password: faker.internet.password(),
        };
      case 'url':
        return {
          title: faker.internet.domainWord(),
          username: faker.person.firstName(),
          password: faker.internet.password(),
        };
      case 'username':
        return {
          title: faker.internet.domainWord(),
          url: faker.internet.url(),
          password: faker.internet.password(),
        };
      case 'password':
        return {
          title: faker.internet.domainWord(),
          url: faker.internet.url(),
          username: faker.person.firstName(),
        };
      default:
        return {};
    }
  }

  static createDbCredential(
    prisma: PrismaService,
    credential: InsertCredential,
    userId: number,
  ) {
    const credentialFactory = new CredentialFactories();
    const { title, url, username, password } =
      credentialFactory.encryptCredential(credential);

    return prisma.credential.create({
      data: {
        title,
        url,
        username,
        password,
        userId,
      },
      select: {
        id: true,
        title: true,
        url: true,
        password: true,
        userId: true,
      },
    });
  }

  static getCredentialByIdOnPrisma(prisma: PrismaService, id: number) {
    return prisma.credential.findUnique({ where: { id } });
  }

  private encryptCredential(cred: InsertCredential): InsertCredential {
    return {
      ...cred,
      password: this.crypter.encrypt(cred.password),
    };
  }
}
