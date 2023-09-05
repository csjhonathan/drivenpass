import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { UserFactories } from '../factories/userFactories';
import { faker } from '@faker-js/faker';
import { TestHelpers } from '../helpers/test.helpers';
import { CardFactories } from '../factories/cardFactories';

describe('CardController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService = new PrismaService();
  let server: request.SuperTest<request.Test>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    server = request(app.getHttpServer());

    await TestHelpers.cleanDb(prisma);
  });

  it('expect true', () => {
    expect(true).toBe(true);
  });

  describe('POST /cards', () => {
    describe('when token is invalid', () => {
      it('should respond with status 401 when token is empty', async () => {
        const { statusCode, body } = await server.post('/cards').send({});

        expect(statusCode).toBe(HttpStatus.UNAUTHORIZED);
        expect(body).toEqual({
          message: 'Authorization must been provider!',
          error: 'Unauthorized',
          statusCode: 401,
        });
      });

      it('should respond with status 401 when token is invalid', async () => {
        const token = UserFactories.generateInvalidToken();
        const { statusCode, body } = await server
          .post('/cards')
          .send({})
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.UNAUTHORIZED);
        expect(body).toEqual({ message: 'Unauthorized', statusCode: 401 });
      });
    });

    describe('when token is valid', () => {
      it('should respond with status 400 when body is empty', async () => {
        const { token } = await UserFactories.createUserAndValidToken(prisma);
        const { statusCode, body } = await server
          .post('/cards')
          .send({})
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(body).toEqual({
          error: 'Bad Request',
          message: [
            'title must be a string',
            'title should not be empty',
            'Card number must have 16 digits!',
            'number must be a number string',
            'number should not be empty',
            'owner must be a string',
            'owner should not be empty',
            'Card cvv number must have 3 digits!',
            'cvv must be a number string',
            'cvv should not be empty',
            'Expiration date must have format "MM/YYYY"!',
            'expiration must be a string',
            'expiration should not be empty',
            'password must be a string',
            'password should not be empty',
            'Type must be a number or a list of numbers!',
            'type should not be empty',
          ],
          statusCode: 400,
        });
      });

      it('should respond with status 400 when title is missing', async () => {
        const { token } = await UserFactories.createUserAndValidToken(prisma);
        const card = CardFactories.cardWithoutFieldorFullBody('title', {
          validCardNumber: true,
          validCvvNumber: true,
          validDateFormat: true,
        });

        const { statusCode, body } = await server
          .post('/cards')
          .send(card)
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(body).toEqual({
          error: 'Bad Request',
          message: ['title must be a string', 'title should not be empty'],
          statusCode: 400,
        });
      });

      it('should respond with status 400 when card number is missing', async () => {
        const { token } = await UserFactories.createUserAndValidToken(prisma);
        const card = CardFactories.cardWithoutFieldorFullBody('number', {
          validCardNumber: true,
          validCvvNumber: true,
          validDateFormat: true,
        });

        const { statusCode, body } = await server
          .post('/cards')
          .send(card)
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(body).toEqual({
          error: 'Bad Request',
          message: [
            'Card number must have 16 digits!',
            'number must be a number string',
            'number should not be empty',
          ],
          statusCode: 400,
        });
      });

      it('should respond with status 400 when owner is missing', async () => {
        const { token } = await UserFactories.createUserAndValidToken(prisma);
        const card = CardFactories.cardWithoutFieldorFullBody('owner', {
          validCardNumber: true,
          validCvvNumber: true,
          validDateFormat: true,
        });

        const { statusCode, body } = await server
          .post('/cards')
          .send(card)
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(body).toEqual({
          error: 'Bad Request',
          message: ['owner must be a string', 'owner should not be empty'],
          statusCode: 400,
        });
      });

      it('should respond with status 400 when cvv is missing', async () => {
        const { token } = await UserFactories.createUserAndValidToken(prisma);
        const card = CardFactories.cardWithoutFieldorFullBody('cvv', {
          validCardNumber: true,
          validCvvNumber: true,
          validDateFormat: true,
        });

        const { statusCode, body } = await server
          .post('/cards')
          .send(card)
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(body).toEqual({
          error: 'Bad Request',
          message: [
            'Card cvv number must have 3 digits!',
            'cvv must be a number string',
            'cvv should not be empty',
          ],
          statusCode: 400,
        });
      });

      it('should respond with status 400 when expiration date is missing', async () => {
        const { token } = await UserFactories.createUserAndValidToken(prisma);
        const card = CardFactories.cardWithoutFieldorFullBody('expiration', {
          validCardNumber: true,
          validCvvNumber: true,
          validDateFormat: true,
        });

        const { statusCode, body } = await server
          .post('/cards')
          .send(card)
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(body).toEqual({
          error: 'Bad Request',
          message: [
            'Expiration date must have format "MM/YYYY"!',
            'expiration must be a string',
            'expiration should not be empty',
          ],
          statusCode: 400,
        });
      });

      it('should respond with status 400 when password is missing', async () => {
        const { token } = await UserFactories.createUserAndValidToken(prisma);
        const card = CardFactories.cardWithoutFieldorFullBody('password', {
          validCardNumber: true,
          validCvvNumber: true,
          validDateFormat: true,
        });

        const { statusCode, body } = await server
          .post('/cards')
          .send(card)
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(body).toEqual({
          error: 'Bad Request',
          message: [
            'password must be a string',
            'password should not be empty',
          ],
          statusCode: 400,
        });
      });

      it('should respond with status 400 when types is missing', async () => {
        const { token } = await UserFactories.createUserAndValidToken(prisma);
        const card = CardFactories.cardWithoutFieldorFullBody('types', {
          validCardNumber: true,
          validCvvNumber: true,
          validDateFormat: true,
        });

        const { statusCode, body } = await server
          .post('/cards')
          .send(card)
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(body).toEqual({
          error: 'Bad Request',
          message: [
            'Type must be a number or a list of numbers!',
            'type should not be empty',
          ],
          statusCode: 400,
        });
      });

      it('should respond with status 400 when card number have invalid format', async () => {
        const { token } = await UserFactories.createUserAndValidToken(prisma);
        const card = CardFactories.cardWithoutFieldorFullBody('', {
          validCardNumber: false,
          validCvvNumber: true,
          validDateFormat: true,
        });

        const { statusCode, body } = await server
          .post('/cards')
          .send(card)
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(body).toEqual({
          error: 'Bad Request',
          message: ['Card number must have 16 digits!'],
          statusCode: 400,
        });
      });

      it('should respond with status 400 when cvv have invalid format', async () => {
        const { token } = await UserFactories.createUserAndValidToken(prisma);
        const card = CardFactories.cardWithoutFieldorFullBody('', {
          validCardNumber: true,
          validCvvNumber: false,
          validDateFormat: true,
        });

        const { statusCode, body } = await server
          .post('/cards')
          .send(card)
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(body).toEqual({
          error: 'Bad Request',
          message: ['Card cvv number must have 3 digits!'],
          statusCode: 400,
        });
      });

      it('should respond with status 400 when expiration date have invalid format', async () => {
        const { token } = await UserFactories.createUserAndValidToken(prisma);
        const card = CardFactories.cardWithoutFieldorFullBody('', {
          validCardNumber: true,
          validCvvNumber: true,
          validDateFormat: false,
        });

        const { statusCode, body } = await server
          .post('/cards')
          .send(card)
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(body).toEqual({
          error: 'Bad Request',
          message: ['Expiration date must have format "MM/YYYY"!'],
          statusCode: 400,
        });
      });

      it('should respond with status 201 and card data when card is successfully created', async () => {
        const { token, user } =
          await UserFactories.createUserAndValidToken(prisma);
        const [type1, type2] =
          await CardFactories.createAndGetCardTypesDb(prisma);
        const card = CardFactories.cardWithoutFieldorFullBody(
          '',
          {
            validCardNumber: true,
            validCvvNumber: true,
            validDateFormat: true,
          },
          [type1.id, type2.id],
        );

        const { statusCode, body } = await server
          .post('/cards')
          .send(card)
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.CREATED);
        expect(body).toEqual({
          id: expect.any(Number),
          title: card.title,
          number: card.number,
          owner: card.owner,
          cvv: expect.any(String),
          expiration: card.expiration,
          password: expect.any(String),
          userId: user.id,
          CardType: expect.arrayContaining([{ type: expect.any(String) }]),
        });
      });
    });
  });

  describe('GET /cards', () => {
    describe('when token is invalid', () => {
      it('should respond with status 401 when token is empty', async () => {
        const { statusCode, body } = await server.get('/cards');

        expect(statusCode).toBe(HttpStatus.UNAUTHORIZED);
        expect(body).toEqual({
          message: 'Authorization must been provider!',
          error: 'Unauthorized',
          statusCode: 401,
        });
      });

      it('should respond with status 401 when token is invalid', async () => {
        const token = UserFactories.generateInvalidToken();
        const { statusCode, body } = await server
          .get('/cards')
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.UNAUTHORIZED);
        expect(body).toEqual({ message: 'Unauthorized', statusCode: 401 });
      });
    });

    describe('when token is valid', () => {
      it('should respond with status 200 and empty array when user have no credentials', async () => {
        const { token } = await UserFactories.createUserAndValidToken(prisma);
        const { statusCode, body } = await server
          .get('/cards')
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.OK);
        expect(body).toEqual([]);
      });

      it('should respond with status 200 and an array with 10 credentials', async () => {
        const { token, user } =
          await UserFactories.createUserAndValidToken(prisma);
        const [type1, type2] =
          await CardFactories.createAndGetCardTypesDb(prisma);

        const expectedLength = 10;

        for (let i = 0; i < expectedLength; i++) {
          const card = CardFactories.cardWithoutFieldorFullBody(
            '',
            {
              validCardNumber: true,
              validCvvNumber: true,
              validDateFormat: true,
            },
            [type1.id, type2.id],
          );

          await CardFactories.createDbCard(
            prisma,
            { ...card, title: `${card.title}-${i}` },
            user.id,
          );
        }

        const { statusCode, body } = await server
          .get('/cards')
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.OK);
        expect(body).toHaveLength(expectedLength);
        expect(body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(Number),
              title: expect.any(String),
              number: expect.any(String),
              owner: expect.any(String),
              cvv: expect.any(String),
              expiration: expect.any(String),
              password: expect.any(String),
              userId: user.id,
              CardType: expect.arrayContaining([{ type: expect.any(String) }]),
            }),
          ]),
        );
      });
    });
  });

  describe('GET /cards/:id', () => {
    describe('when token is invalid', () => {
      it('should respond with status 401 when token is empty', async () => {
        const id = faker.number.int({ min: 1, max: 10 });
        const { statusCode, body } = await server.get(`/cards/${id}`);

        expect(statusCode).toBe(HttpStatus.UNAUTHORIZED);
        expect(body).toEqual({
          message: 'Authorization must been provider!',
          error: 'Unauthorized',
          statusCode: 401,
        });
      });

      it('should respond with status 401 when token is invalid', async () => {
        const id = faker.number.int({ min: 1, max: 10 });
        const token = UserFactories.generateInvalidToken();
        const { statusCode, body } = await server
          .get(`/cards/${id}`)
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.UNAUTHORIZED);
        expect(body).toEqual({ message: 'Unauthorized', statusCode: 401 });
      });
    });

    describe('when token is valid', () => {
      it('should respond with status 404 when credential not exists', async () => {
        const { token } = await UserFactories.createUserAndValidToken(prisma);
        const { statusCode, body } = await server
          .get(`/cards/${faker.number.int({ min: 1, max: 10 })}`)
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.NOT_FOUND);
        expect(body).toEqual({
          error: 'Not Found',
          message: 'Card doesnt exists!',
          statusCode: 404,
        });
      });

      it('should respond with status 403 when credential not exists is user collection', async () => {
        const { token } = await UserFactories.createUserAndValidToken(prisma);
        const { user } = await UserFactories.createUserAndValidToken(prisma);
        const [type1, type2] =
          await CardFactories.createAndGetCardTypesDb(prisma);
        const fakerCard = CardFactories.cardWithoutFieldorFullBody(
          '',
          {
            validCardNumber: true,
            validCvvNumber: true,
            validDateFormat: true,
          },
          [type1.id, type2.id],
        );

        const card = await CardFactories.createDbCard(
          prisma,
          fakerCard,
          user.id,
        );

        const { statusCode, body } = await server
          .get(`/cards/${card.id}`)
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.FORBIDDEN);
        expect(body).toEqual({
          error: 'Forbidden',
          message: 'This card doesnt exists in your collection!',
          statusCode: 403,
        });
      });

      it('should respond with status 200 and credential data', async () => {
        const { user, token } =
          await UserFactories.createUserAndValidToken(prisma);
        const [type1, type2] =
          await CardFactories.createAndGetCardTypesDb(prisma);
        const fakerCard = CardFactories.cardWithoutFieldorFullBody(
          '',
          {
            validCardNumber: true,
            validCvvNumber: true,
            validDateFormat: true,
          },
          [type1.id, type2.id],
        );

        const card = await CardFactories.createDbCard(
          prisma,
          fakerCard,
          user.id,
        );

        const { statusCode, body } = await server
          .get(`/cards/${card.id}`)
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.OK);
        expect(body).toEqual({
          id: card.id,
          title: fakerCard.title,
          number: fakerCard.number,
          owner: fakerCard.owner,
          cvv: fakerCard.cvv,
          password: fakerCard.password,
          expiration: fakerCard.expiration,
          userId: user.id,
          CardType: expect.arrayContaining([
            expect.objectContaining({ type: expect.any(String) }),
          ]),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        });
      });
    });
  });

  describe('DELETE /cards/:id', () => {
    describe('when token is invalid', () => {
      it('should respond with status 401 when token is empty', async () => {
        const id = faker.number.int({ min: 1, max: 10 });
        const { statusCode, body } = await server.delete(`/cards/${id}`);

        expect(statusCode).toBe(HttpStatus.UNAUTHORIZED);
        expect(body).toEqual({
          message: 'Authorization must been provider!',
          error: 'Unauthorized',
          statusCode: 401,
        });
      });

      it('should respond with status 401 when token is invalid', async () => {
        const token = UserFactories.generateInvalidToken();
        const id = faker.number.int({ min: 1, max: 10 });
        const { statusCode, body } = await server
          .delete(`/cards/${id}`)
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.UNAUTHORIZED);
        expect(body).toEqual({ message: 'Unauthorized', statusCode: 401 });
      });
    });

    describe('when token is valid', () => {
      it('should respond with status 404 when credential not exists', async () => {
        const { token } = await UserFactories.createUserAndValidToken(prisma);
        const { statusCode, body } = await server
          .get(`/cards/${faker.number.int({ min: 1, max: 10 })}`)
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.NOT_FOUND);
        expect(body).toEqual({
          error: 'Not Found',
          message: 'Card doesnt exists!',
          statusCode: 404,
        });
      });

      it('should respond with status 403 when credential not exists is user collection', async () => {
        const { token } = await UserFactories.createUserAndValidToken(prisma);
        const { user } = await UserFactories.createUserAndValidToken(prisma);
        const [type1, type2] =
          await CardFactories.createAndGetCardTypesDb(prisma);
        const fakerCard = CardFactories.cardWithoutFieldorFullBody(
          '',
          {
            validCardNumber: true,
            validCvvNumber: true,
            validDateFormat: true,
          },
          [type1.id, type2.id],
        );

        const card = await CardFactories.createDbCard(
          prisma,
          fakerCard,
          user.id,
        );

        const { statusCode, body } = await server
          .get(`/cards/${card.id}`)
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.FORBIDDEN);
        expect(body).toEqual({
          error: 'Forbidden',
          message: 'This card doesnt exists in your collection!',
          statusCode: 403,
        });
      });

      it('should respond with status 204', async () => {
        const { user, token } =
          await UserFactories.createUserAndValidToken(prisma);
        const [type1, type2] =
          await CardFactories.createAndGetCardTypesDb(prisma);
        const fakerCard = CardFactories.cardWithoutFieldorFullBody(
          '',
          {
            validCardNumber: true,
            validCvvNumber: true,
            validDateFormat: true,
          },
          [type1.id, type2.id],
        );

        const card = await CardFactories.createDbCard(
          prisma,
          fakerCard,
          user.id,
        );

        const { statusCode } = await server
          .delete(`/cards/${card.id}`)
          .set('Authorization', token);

        const verify = await CardFactories.getCardByIdOnPrisma(prisma, card.id);

        expect(statusCode).toBe(HttpStatus.NO_CONTENT);
        expect(verify).toBeNull();
      });
    });
  });
});
