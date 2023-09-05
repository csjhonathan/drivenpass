import { faker } from '@faker-js/faker';
import { PrismaService } from '../../src/prisma/prisma.service';

type InsertCard = {
  title?: string;
  number?: string;
  owner?: string;
  cvv?: string;
  expiration?: string;
  password?: string;
  type?: number[];
};

export class CardFactories {
  private Cryptr = require('cryptr');
  private crypter: any;

  constructor() {
    this.crypter = new this.Cryptr(process.env.CRYPTR_SECRET);
  }

  static cardWithoutFieldorFullBody(
    field?:
      | ''
      | 'title'
      | 'number'
      | 'owner'
      | 'cvv'
      | 'expiration'
      | 'password'
      | 'types',
    options?: {
      validCardNumber: boolean;
      validCvvNumber: boolean;
      validDateFormat: boolean;
    },
    types?: number[],
  ): InsertCard {
    const { validCardNumber, validCvvNumber, validDateFormat } = options;

    switch (field) {
      case 'title':
        return {
          number: validCardNumber
            ? faker.string.numeric({ length: 16 })
            : faker.string.numeric({ length: 8 }),
          owner: faker.person.firstName(),
          cvv: validCvvNumber
            ? faker.string.numeric({ length: 3 })
            : faker.string.numeric({ length: 6 }),
          expiration: validDateFormat
            ? new CardFactories().generateMMYYYYDate(faker.date.future())
            : faker.date.future().toISOString(),
          password: faker.internet.password(),
          type: types ?? [
            faker.number.int({ min: 1, max: 10 }),
            faker.number.int({ min: 1, max: 10 }),
          ],
        };
      case 'number':
        return {
          title: faker.commerce.department(),
          owner: faker.person.firstName(),
          cvv: validCvvNumber
            ? faker.string.numeric({ length: 3 })
            : faker.string.numeric({ length: 6 }),
          expiration: validDateFormat
            ? new CardFactories().generateMMYYYYDate(faker.date.future())
            : faker.date.future().toISOString(),
          password: faker.internet.password(),
          type: types ?? [
            faker.number.int({ min: 1, max: 10 }),
            faker.number.int({ min: 1, max: 10 }),
          ],
        };
      case 'owner':
        return {
          title: faker.commerce.department(),
          number: validCardNumber
            ? faker.string.numeric({ length: 16 })
            : faker.string.numeric({ length: 8 }),
          cvv: validCvvNumber
            ? faker.string.numeric({ length: 3 })
            : faker.string.numeric({ length: 6 }),
          expiration: validDateFormat
            ? new CardFactories().generateMMYYYYDate(faker.date.future())
            : faker.date.future().toISOString(),
          password: faker.internet.password(),
          type: types ?? [
            faker.number.int({ min: 1, max: 10 }),
            faker.number.int({ min: 1, max: 10 }),
          ],
        };
      case 'cvv':
        return {
          title: faker.commerce.department(),
          number: validCardNumber
            ? faker.string.numeric({ length: 16 })
            : faker.string.numeric({ length: 8 }),
          owner: faker.person.firstName(),
          expiration: validDateFormat
            ? new CardFactories().generateMMYYYYDate(faker.date.future())
            : faker.date.future().toISOString(),
          password: faker.internet.password(),
          type: types ?? [
            faker.number.int({ min: 1, max: 10 }),
            faker.number.int({ min: 1, max: 10 }),
          ],
        };
      case 'expiration':
        return {
          title: faker.commerce.department(),
          number: validCardNumber
            ? faker.string.numeric({ length: 16 })
            : faker.string.numeric({ length: 8 }),
          owner: faker.person.firstName(),
          cvv: validCvvNumber
            ? faker.string.numeric({ length: 3 })
            : faker.string.numeric({ length: 6 }),
          password: faker.internet.password(),
          type: types ?? [
            faker.number.int({ min: 1, max: 10 }),
            faker.number.int({ min: 1, max: 10 }),
          ],
        };

      case 'password':
        return {
          title: faker.commerce.department(),
          number: validCardNumber
            ? faker.string.numeric({ length: 16 })
            : faker.string.numeric({ length: 8 }),
          owner: faker.person.firstName(),
          cvv: validCvvNumber
            ? faker.string.numeric({ length: 3 })
            : faker.string.numeric({ length: 6 }),
          expiration: validDateFormat
            ? new CardFactories().generateMMYYYYDate(faker.date.future())
            : faker.date.future().toISOString(),
          type: types ?? [
            faker.number.int({ min: 1, max: 10 }),
            faker.number.int({ min: 1, max: 10 }),
          ],
        };
      case 'types':
        return {
          title: faker.commerce.department(),
          number: validCardNumber
            ? faker.string.numeric({ length: 16 })
            : faker.string.numeric({ length: 8 }),
          owner: faker.person.firstName(),
          cvv: validCvvNumber
            ? faker.string.numeric({ length: 3 })
            : faker.string.numeric({ length: 6 }),
          password: faker.internet.password(),
          expiration: validDateFormat
            ? new CardFactories().generateMMYYYYDate(faker.date.future())
            : faker.date.future().toISOString(),
        };
      default:
        return {
          title: faker.commerce.department(),
          number: validCardNumber
            ? faker.string.numeric({ length: 16 })
            : faker.string.numeric({ length: 8 }),
          owner: faker.person.firstName(),
          cvv: validCvvNumber
            ? faker.string.numeric({ length: 3 })
            : faker.string.numeric({ length: 6 }),
          expiration: validDateFormat
            ? new CardFactories().generateMMYYYYDate(faker.date.future())
            : faker.date.future().toISOString(),
          password: faker.internet.password(),
          type: types ?? [
            faker.number.int({ min: 1, max: 10 }),
            faker.number.int({ min: 1, max: 10 }),
          ],
        };
    }
  }

  static createDbCard(prisma: PrismaService, card: InsertCard, userId: number) {
    const cardFactory = new CardFactories();
    const { title, number, owner, cvv, expiration, password, type } =
      cardFactory.encryptCard(card);

    return prisma.card.create({
      data: {
        title,
        number,
        owner,
        cvv,
        expiration,
        password,
        userId,
        CardType: {
          connect: type.map((id) => ({
            id,
          })),
        },
      },
      select: {
        id: true,
        title: true,
        number: true,
        owner: true,
        cvv: true,
        expiration: true,
        password: true,
        userId: true,
        CardType: {
          select: {
            type: true,
          },
        },
      },
    });
  }

  static getCardByIdOnPrisma(prisma: PrismaService, id: number) {
    return prisma.card.findUnique({ where: { id } });
  }

  static async createAndGetCardTypesDb(prisma: PrismaService) {
    await prisma.cardType.createMany({
      data: [{ type: 'Débito' }, { type: 'Crédito' }],
    });

    return prisma.cardType.findMany({
      select: {
        id: true,
      },
    });
  }

  private encryptCard(card: InsertCard): InsertCard {
    return {
      ...card,
      password: this.crypter.encrypt(card.password),
      cvv: this.crypter.encrypt(card.cvv),
    };
  }

  private generateMMYYYYDate(date: Date) {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return `${month}/${year}`;
  }
}
