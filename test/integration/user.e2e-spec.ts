import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { UserFactories } from '../factories/userFactories';
import { TestHelpers } from '../helpers/test.helpers';
import { CredentialFactories } from '../factories/credentialFactories';
import { NoteFactories } from '../factories/noteFactories';
import { CardFactories } from '../factories/cardFactories';

describe('UserController (e2e)', () => {
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

  describe('POST /user', () => {
    describe('/auth', () => {
      describe('/sign-up', () => {
        it('should respond with status 400 when body is empty', async () => {
          const { statusCode, body } = await server
            .post('/user/auth/sign-up')
            .send(UserFactories.userWithoutField());

          expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(body).toEqual({
            message: [
              'email must be an email',
              'email must be a string',
              'email should not be empty',
              'name must be a string',
              'name should not be empty',
              'password is not strong enough',
              'password must be a string',
              'password should not be empty',
            ],
            error: 'Bad Request',
            statusCode: 400,
          });
        });

        it('should respond with status 400 when email is missing', async () => {
          const { statusCode, body } = await server
            .post('/user/auth/sign-up')
            .send(UserFactories.userWithoutField('email', true));

          expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(body).toEqual({
            message: [
              'email must be an email',
              'email must be a string',
              'email should not be empty',
            ],
            error: 'Bad Request',
            statusCode: 400,
          });
        });

        it('should respond with status 400 when name is missing', async () => {
          const { statusCode, body } = await server
            .post('/user/auth/sign-up')
            .send(UserFactories.userWithoutField('name', true));

          expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(body).toEqual({
            message: ['name must be a string', 'name should not be empty'],
            error: 'Bad Request',
            statusCode: 400,
          });
        });

        it('should respond with status 400 when password missing', async () => {
          const { statusCode, body } = await server
            .post('/user/auth/sign-up')
            .send(UserFactories.userWithoutField('password'));

          expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(body).toEqual({
            message: [
              'password is not strong enough',
              'password must be a string',
              'password should not be empty',
            ],
            error: 'Bad Request',
            statusCode: 400,
          });
        });

        it('should respond with status 400 when password is weak', async () => {
          const { statusCode, body } = await server
            .post('/user/auth/sign-up')
            .send(UserFactories.fullBodyUser());

          expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(body).toEqual({
            message: ['password is not strong enough'],
            error: 'Bad Request',
            statusCode: 400,
          });
        });

        it('should respond with status 409 and conflict message when user already exists', async () => {
          const { email, name } = await UserFactories.createDbUser(prisma);
          const { statusCode, body } = await server
            .post('/user/auth/sign-up')
            .send({ email, name, password: '@Passw0rd' });

          expect(statusCode).toBe(HttpStatus.CONFLICT);
          expect(body).toEqual({
            error: 'Conflict',
            message: 'User already exists!',
            statusCode: 409,
          });
        });

        it('should respond with status 201 and user data when password is strong', async () => {
          const user = UserFactories.fullBodyUser(true);
          const { statusCode, body } = await server
            .post('/user/auth/sign-up')
            .send(user);

          expect(statusCode).toBe(HttpStatus.CREATED);
          expect(body).toEqual({
            id: expect.any(Number),
            email: user.email,
            name: user.name,
          });
        });
      });

      describe('/sign-in', () => {
        it('should respond with status 400 when body is empty', async () => {
          const { statusCode, body } = await server
            .post('/user/auth/sign-in')
            .send(UserFactories.userWithoutField());

          expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(body).toEqual({
            message: [
              'email must be an email',
              'email must be a string',
              'email should not be empty',
              'password must be a string',
              'password should not be empty',
            ],
            error: 'Bad Request',
            statusCode: 400,
          });
        });

        it('should respond with status 400 when email is missing', async () => {
          const { statusCode, body } = await server
            .post('/user/auth/sign-in')
            .send(UserFactories.userWithoutField('email', true));

          expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(body).toEqual({
            message: [
              'email must be an email',
              'email must be a string',
              'email should not be empty',
            ],
            error: 'Bad Request',
            statusCode: 400,
          });
        });

        it('should respond with status 400 when password missing', async () => {
          const { statusCode, body } = await server
            .post('/user/auth/sign-in')
            .send(UserFactories.userWithoutField('password'));

          expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(body).toEqual({
            message: [
              'password must be a string',
              'password should not be empty',
            ],
            error: 'Bad Request',
            statusCode: 400,
          });
        });

        it('should respond with status 401 user is not registered', async () => {
          const { statusCode, body } = await server
            .post('/user/auth/sign-in')
            .send(UserFactories.fullBodyUser());

          expect(statusCode).toBe(HttpStatus.UNAUTHORIZED);
          expect(body).toEqual({
            message: 'Invalid credentials!',
            error: 'Unauthorized',
            statusCode: 401,
          });
        });

        it('should respond with status 401 when password is invalid', async () => {
          const user = UserFactories.fullBodyUser(true);
          await UserFactories.createDbUserEncrypted(prisma, user);

          const { statusCode, body } = await server
            .post('/user/auth/sign-in')
            .send({ email: user.email, password: 'pãoDeBatata' });

          expect(statusCode).toBe(HttpStatus.UNAUTHORIZED);
          expect(body).toEqual({
            message: 'Invalid credentials!',
            error: 'Unauthorized',
            statusCode: 401,
          });
        });

        it('should respond with status 200 and token when password is valid', async () => {
          const user = UserFactories.fullBodyUser(true);
          await UserFactories.createDbUserEncrypted(prisma, user);

          const { statusCode, body } = await server
            .post('/user/auth/sign-in')
            .send({ email: user.email, password: user.password });

          expect(statusCode).toBe(HttpStatus.OK);
          expect(body).toEqual({ token: expect.any(String) });
        });
      });
    });
  });

  describe('/erase', () => {
    describe('when token is invalid', () => {
      it('should respond with status 401 when token is empty', async () => {
        const { statusCode, body } = await server
          .delete('/user/erase')
          .send(UserFactories.fullBodyUser());

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
          .delete('/user/erase')
          .send(UserFactories.fullBodyUser())
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.UNAUTHORIZED);
        expect(body).toEqual({ message: 'Unauthorized', statusCode: 401 });
      });
    });

    describe('when token is valid', () => {
      it('should respond with status 404 when user not exists (email)', async () => {
        const user = UserFactories.fullBodyUser(true);
        const { id, name } = await UserFactories.createDbUserEncrypted(
          prisma,
          user,
        );
        const token = UserFactories.generateToken({ id, email: 'oi', name });

        const { statusCode, body } = await server
          .delete('/user/erase')
          .send({ password: user.password })
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.NOT_FOUND);
        expect(body).toEqual({
          message: 'User not found!',
          statusCode: HttpStatus.NOT_FOUND,
          error: 'Not Found',
        });
      });

      it('should respond with status 404 when user not exists (id)', async () => {
        const user = UserFactories.fullBodyUser(true);
        const { id, email, name } = await UserFactories.createDbUserEncrypted(
          prisma,
          user,
        );
        const token = UserFactories.generateToken({ id: id + 1, email, name });

        const { statusCode, body } = await server
          .delete('/user/erase')
          .send({ password: user.password })
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.NOT_FOUND);
        expect(body).toEqual({
          message: 'User not found!',
          statusCode: HttpStatus.NOT_FOUND,
          error: 'Not Found',
        });
      });

      it('should respond with status 400 when password is not provide', async () => {
        const user = UserFactories.fullBodyUser(true);
        const { id, email, name } = await UserFactories.createDbUserEncrypted(
          prisma,
          user,
        );
        const token = UserFactories.generateToken({ id, email, name });

        const { statusCode, body } = await server
          .delete('/user/erase')
          .send()
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

      it('should respond with status 401 when password is invalid', async () => {
        const user = UserFactories.fullBodyUser(true);
        const { id, email, name } = await UserFactories.createDbUserEncrypted(
          prisma,
          user,
        );
        const token = UserFactories.generateToken({ id, email, name });

        const { statusCode, body } = await server
          .delete('/user/erase')
          .send({ password: 'pessego' })
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.UNAUTHORIZED);
        expect(body).toEqual({
          error: 'Unauthorized',
          message: 'Invalid credentials!',
          statusCode: 401,
        });
      });

      it('should respond with status 204 and delete user data', async () => {
        const user = UserFactories.fullBodyUser(true);
        const { id, email, name } = await UserFactories.createDbUserEncrypted(
          prisma,
          user,
        );

        const [type1, type2] =
          await CardFactories.createAndGetCardTypesDb(prisma);

        for (let i = 0; i < 5; i++) {
          const fakerCredential =
            CredentialFactories.credentialWithoutFieldorFullBody('full');
          await CredentialFactories.createDbCredential(
            prisma,
            fakerCredential,
            id,
          );

          const fakerNote = NoteFactories.noteWithoutFieldorFullBody();
          await NoteFactories.createDbNote(prisma, fakerNote, id);

          const fakerCard = CardFactories.cardWithoutFieldorFullBody(
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
            { ...fakerCard, title: `${fakerCard.title}-${i}` },
            id,
          );
        }

        const token = UserFactories.generateToken({ id, email, name });

        const { statusCode } = await server
          .delete('/user/erase')
          .send({ password: user.password })
          .set('Authorization', token);

        const {
          user: deletedUser,
          cards,
          creds,
          notes,
        } = await UserFactories.prismaGetFullUserDataById(prisma, id);

        expect(statusCode).toBe(HttpStatus.NO_CONTENT);
        expect(deletedUser).toBeNull();
        expect(cards).toHaveLength(0);
        expect(creds).toHaveLength(0);
        expect(notes).toHaveLength(0);
      });
    });
  });
});
