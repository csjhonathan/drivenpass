import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { UserFactories } from '../factories/userFactories';
import { faker } from '@faker-js/faker';
import { CredentialFactories } from '../factories/credentialFactories';
import { TestHelpers } from '../helpers/test.helpers';

describe('CredentialController (e2e)', () => {
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

  describe('POST /credentials', () => {
    describe('when token is invalid', () => {
      it('should respond with status 401 when token is empty', async () => {
        const { statusCode, body } = await server.post('/credentials').send({});

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
          .post('/credentials')
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
          .post('/credentials')
          .send({})
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(body).toEqual({
          error: 'Bad Request',
          message: [
            'title must be a string',
            'title should not be empty',
            'url must be a URL address',
            'url must be a string',
            'url should not be empty',
            'username must be a string',
            'username should not be empty',
            'password must be a string',
            'password should not be empty',
          ],
          statusCode: 400,
        });
      });

      it('should respond with status 400 when title is missing', async () => {
        const { token } = await UserFactories.createUserAndValidToken(prisma);
        const { statusCode, body } = await server
          .post('/credentials')
          .send(CredentialFactories.credentialWithoutFieldorFullBody('title'))
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(body).toEqual({
          error: 'Bad Request',
          message: ['title must be a string', 'title should not be empty'],
          statusCode: 400,
        });
      });

      it('should respond with status 400 when url is missing', async () => {
        const { token } = await UserFactories.createUserAndValidToken(prisma);
        const { statusCode, body } = await server
          .post('/credentials')
          .send(CredentialFactories.credentialWithoutFieldorFullBody('url'))
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(body).toEqual({
          error: 'Bad Request',
          message: [
            'url must be a URL address',
            'url must be a string',
            'url should not be empty',
          ],
          statusCode: 400,
        });
      });

      it('should respond with status 400 when username is missing', async () => {
        const { token } = await UserFactories.createUserAndValidToken(prisma);
        const { statusCode, body } = await server
          .post('/credentials')
          .send(
            CredentialFactories.credentialWithoutFieldorFullBody('username'),
          )
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(body).toEqual({
          error: 'Bad Request',
          message: [
            'username must be a string',
            'username should not be empty',
          ],
          statusCode: 400,
        });
      });

      it('should respond with status 400 when password is missing', async () => {
        const { token } = await UserFactories.createUserAndValidToken(prisma);
        const { statusCode, body } = await server
          .post('/credentials')
          .send(
            CredentialFactories.credentialWithoutFieldorFullBody('password'),
          )
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

      it('should respond with status 409 when credential already exists', async () => {
        const { token, user } =
          await UserFactories.createUserAndValidToken(prisma);

        const credential =
          CredentialFactories.credentialWithoutFieldorFullBody('full');

        await CredentialFactories.createDbCredential(
          prisma,
          credential,
          user.id,
        );

        const { statusCode, body } = await server
          .post('/credentials')
          .send(credential)
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.CONFLICT);
        expect(body).toEqual({
          error: 'Conflict',
          message:
            'This credential title is already in use in your collection!',
          statusCode: 409,
        });
      });

      it('should respond with status 201 and credential data when credential is successfully created', async () => {
        const { token, user } =
          await UserFactories.createUserAndValidToken(prisma);

        const credential =
          CredentialFactories.credentialWithoutFieldorFullBody('full');

        const { statusCode, body } = await server
          .post('/credentials')
          .send(credential)
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.CREATED);
        expect(body).toEqual({
          ...credential,
          password: expect.any(String),
          id: expect.any(Number),
          userId: user.id,
        });
      });
    });
  });

  describe('GET /credentials', () => {
    describe('when token is invalid', () => {
      it('should respond with status 401 when token is empty', async () => {
        const { statusCode, body } = await server.get('/credentials');

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
          .get('/credentials')
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.UNAUTHORIZED);
        expect(body).toEqual({ message: 'Unauthorized', statusCode: 401 });
      });
    });

    describe('when token is valid', () => {
      it('should respond with status 200 and empty array when user have no credentials', async () => {
        const { token } = await UserFactories.createUserAndValidToken(prisma);
        const { statusCode, body } = await server
          .get('/credentials')
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.OK);
        expect(body).toEqual([]);
      });

      it('should respond with status 200 and an array with 10 credentials', async () => {
        const { token, user } =
          await UserFactories.createUserAndValidToken(prisma);
        for (let i = 0; i < 10; i++) {
          await CredentialFactories.createDbCredential(
            prisma,
            CredentialFactories.credentialWithoutFieldorFullBody('full'),
            user.id,
          );
        }

        const expectedLength = 10;
        const { statusCode, body } = await server
          .get('/credentials')
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.OK);
        expect(body).toHaveLength(expectedLength);
        expect(body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(Number),
              title: expect.any(String),
              url: expect.any(String),
              password: expect.any(String),
              userId: expect.any(Number),
            }),
          ]),
        );
      });
    });
  });

  describe('GET /credentials/:id', () => {
    describe('when token is invalid', () => {
      it('should respond with status 401 when token is empty', async () => {
        const id = faker.number.int({ min: 1, max: 10 });
        const { statusCode, body } = await server.get(`/credentials/${id}`);

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
          .get(`/credentials/${id}`)
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.UNAUTHORIZED);
        expect(body).toEqual({ message: 'Unauthorized', statusCode: 401 });
      });
    });

    describe('when token is valid', () => {
      it('should respond with status 404 when credential not exists', async () => {
        const { token } = await UserFactories.createUserAndValidToken(prisma);
        const { statusCode, body } = await server
          .get(`/credentials/${faker.number.int({ min: 1, max: 10 })}`)
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.NOT_FOUND);
        expect(body).toEqual({
          error: 'Not Found',
          message: 'Credential doesnt exists!',
          statusCode: 404,
        });
      });

      it('should respond with status 403 when credential not exists is user collection', async () => {
        const { token } = await UserFactories.createUserAndValidToken(prisma);
        const { user } = await UserFactories.createUserAndValidToken(prisma);
        const cred =
          CredentialFactories.credentialWithoutFieldorFullBody('full');
        const credential = await CredentialFactories.createDbCredential(
          prisma,
          cred,
          user.id,
        );

        const { statusCode, body } = await server
          .get(`/credentials/${credential.id}`)
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.FORBIDDEN);
        expect(body).toEqual({
          error: 'Forbidden',
          message: 'This credential doesnt exists in your collection!',
          statusCode: 403,
        });
      });

      it('should respond with status 200 and credential data', async () => {
        const { token, user } =
          await UserFactories.createUserAndValidToken(prisma);
        const cred =
          CredentialFactories.credentialWithoutFieldorFullBody('full');
        const credential = await CredentialFactories.createDbCredential(
          prisma,
          cred,
          user.id,
        );

        const { statusCode, body } = await server
          .get(`/credentials/${credential.id}`)
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.OK);
        expect(body).toEqual({
          id: expect.any(Number),
          title: cred.title,
          url: cred.url,
          username: cred.username,
          password: cred.password,
          userId: user.id,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        });
      });
    });
  });

  describe('DELETE /credentials:id', () => {
    describe('when token is invalid', () => {
      it('should respond with status 401 when token is empty', async () => {
        const id = faker.number.int({ min: 1, max: 10 });
        const { statusCode, body } = await server.delete(`/credentials/${id}`);

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
          .delete(`/credentials/${id}`)
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.UNAUTHORIZED);
        expect(body).toEqual({ message: 'Unauthorized', statusCode: 401 });
      });
    });

    describe('when token is valid', () => {
      it('should respond with status 404 when credential not exists', async () => {
        const { token } = await UserFactories.createUserAndValidToken(prisma);
        const { statusCode, body } = await server
          .delete(`/credentials/${faker.number.int({ min: 1, max: 10 })}`)
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.NOT_FOUND);
        expect(body).toEqual({
          error: 'Not Found',
          message: 'Credential doesnt exists!',
          statusCode: 404,
        });
      });

      it('should respond with status 403 when credential not exists is user collection', async () => {
        const { token } = await UserFactories.createUserAndValidToken(prisma);
        const { user } = await UserFactories.createUserAndValidToken(prisma);
        const cred =
          CredentialFactories.credentialWithoutFieldorFullBody('full');
        const credential = await CredentialFactories.createDbCredential(
          prisma,
          cred,
          user.id,
        );

        const { statusCode, body } = await server
          .delete(`/credentials/${credential.id}`)
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.FORBIDDEN);
        expect(body).toEqual({
          error: 'Forbidden',
          message: 'This credential doesnt exists in your collection!',
          statusCode: 403,
        });
      });

      it('should respond with status 204 and credential data', async () => {
        const { token, user } =
          await UserFactories.createUserAndValidToken(prisma);
        const cred =
          CredentialFactories.credentialWithoutFieldorFullBody('full');
        const credential = await CredentialFactories.createDbCredential(
          prisma,
          cred,
          user.id,
        );

        const { statusCode } = await server
          .delete(`/credentials/${credential.id}`)
          .set('Authorization', token);

        const verify = await CredentialFactories.getCredentialByIdOnPrisma(
          prisma,
          credential.id,
        );

        expect(statusCode).toBe(HttpStatus.NO_CONTENT);
        expect(verify).toBeNull();
      });
    });
  });
});
