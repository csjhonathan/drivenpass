import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { UserFactories } from '../factories/userFactories';
import { faker } from '@faker-js/faker';
import { TestHelpers } from '../helpers/test.helpers';
import { NoteFactories } from '../factories/noteFactories';

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

  describe('POST /notes', () => {
    describe('when token is invalid', () => {
      it('should respond with status 401 when token is empty', async () => {
        const { statusCode, body } = await server.post('/notes').send({});

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
          .post('/notes')
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
          .post('/notes')
          .send({})
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(body).toEqual({
          error: 'Bad Request',
          message: [
            'title must be a string',
            'title should not be empty',
            'text must be a string',
            'text should not be empty',
          ],
          statusCode: 400,
        });
      });
    });

    it('should respond with status 400 when title is missing', async () => {
      const { token } = await UserFactories.createUserAndValidToken(prisma);
      const { statusCode, body } = await server
        .post('/notes')
        .send(NoteFactories.noteWithoutFieldorFullBody('title'))
        .set('Authorization', token);

      expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(body).toEqual({
        error: 'Bad Request',
        message: ['title must be a string', 'title should not be empty'],
        statusCode: 400,
      });
    });

    it('should respond with status 400 when text is missing', async () => {
      const { token } = await UserFactories.createUserAndValidToken(prisma);
      const { statusCode, body } = await server
        .post('/notes')
        .send(NoteFactories.noteWithoutFieldorFullBody('text'))
        .set('Authorization', token);

      expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(body).toEqual({
        error: 'Bad Request',
        message: ['text must be a string', 'text should not be empty'],
        statusCode: 400,
      });
    });

    it('should respond with status 409 when note already exists in user collection', async () => {
      const { token, user } =
        await UserFactories.createUserAndValidToken(prisma);

      const note = NoteFactories.noteWithoutFieldorFullBody();

      await NoteFactories.createDbNote(prisma, note, user.id);

      const { statusCode, body } = await server
        .post('/notes')
        .send(note)
        .set('Authorization', token);

      expect(statusCode).toBe(HttpStatus.CONFLICT);
      expect(body).toEqual({
        error: 'Conflict',
        message: 'This note title is already in use in your collection!',
        statusCode: 409,
      });
    });

    it('should respond with status 201 when note is successfully created', async () => {
      const { token } = await UserFactories.createUserAndValidToken(prisma);

      const note = NoteFactories.noteWithoutFieldorFullBody();

      const { statusCode, body } = await server
        .post('/notes')
        .send(note)
        .set('Authorization', token);

      expect(statusCode).toBe(HttpStatus.CREATED);
      expect(body).toEqual({
        id: expect.any(Number),
        title: note.title,
        text: note.text,
      });
    });
  });

  describe('GET /notes', () => {
    describe('when token is invalid', () => {
      it('should respond with status 401 when token is empty', async () => {
        const { statusCode, body } = await server.get('/notes');

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
          .get('/notes')
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.UNAUTHORIZED);
        expect(body).toEqual({ message: 'Unauthorized', statusCode: 401 });
      });
    });

    describe('when token is valid', () => {
      it('should respond with status 200 and empty array when user have no notes', async () => {
        const { token } = await UserFactories.createUserAndValidToken(prisma);
        const { statusCode, body } = await server
          .get('/notes')
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.OK);
        expect(body).toEqual([]);
      });

      it('should respond with status 200 and an array with 10 credentials', async () => {
        const { token, user } =
          await UserFactories.createUserAndValidToken(prisma);
        for (let i = 0; i < 10; i++) {
          await NoteFactories.createDbNote(
            prisma,
            NoteFactories.noteWithoutFieldorFullBody(),
            user.id,
          );
        }

        const expectedLength = 10;
        const { statusCode, body } = await server
          .get('/notes')
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.OK);
        expect(body).toHaveLength(expectedLength);
        expect(body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(Number),
              title: expect.any(String),
              text: expect.any(String),
              userId: expect.any(Number),
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            }),
          ]),
        );
      });
    });
  });

  describe('GET /notes/:id', () => {
    describe('when token is invalid', () => {
      it('should respond with status 401 when token is empty', async () => {
        const id = faker.number.int({ min: 1, max: 10 });
        const { statusCode, body } = await server.get(`/notes/${id}`);

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
          .get(`/notes/${id}`)
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.UNAUTHORIZED);
        expect(body).toEqual({ message: 'Unauthorized', statusCode: 401 });
      });
    });

    describe('when token is valid', () => {
      it('should respond with status 404 when note not exists', async () => {
        const { token } = await UserFactories.createUserAndValidToken(prisma);
        const { statusCode, body } = await server
          .get(`/notes/${faker.number.int({ min: 1, max: 10 })}`)
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.NOT_FOUND);
        expect(body).toEqual({
          error: 'Not Found',
          message: 'Note doesnt exists!',
          statusCode: 404,
        });
      });

      it('should respond with status 403 when note not exists is user collection', async () => {
        const { token } = await UserFactories.createUserAndValidToken(prisma);
        const { user } = await UserFactories.createUserAndValidToken(prisma);
        const fakerNote = NoteFactories.noteWithoutFieldorFullBody();
        const note = await NoteFactories.createDbNote(
          prisma,
          fakerNote,
          user.id,
        );

        const { statusCode, body } = await server
          .get(`/notes/${note.id}`)
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.FORBIDDEN);
        expect(body).toEqual({
          error: 'Forbidden',
          message: 'This note doesnt exists in your collection!',
          statusCode: 403,
        });
      });

      it('should respond with status 200 and note data', async () => {
        const { token, user } =
          await UserFactories.createUserAndValidToken(prisma);
        const fakerNote = NoteFactories.noteWithoutFieldorFullBody();
        const note = await NoteFactories.createDbNote(
          prisma,
          fakerNote,
          user.id,
        );

        const { statusCode, body } = await server
          .get(`/notes/${note.id}`)
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.OK);
        expect(body).toEqual({
          id: note.id,
          title: fakerNote.title,
          text: fakerNote.text,
          userId: user.id,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        });
      });
    });
  });

  describe('DELETE /notes:id', () => {
    describe('when token is invalid', () => {
      it('should respond with status 401 when token is empty', async () => {
        const id = faker.number.int({ min: 1, max: 10 });
        const { statusCode, body } = await server.delete(`/notes/${id}`);

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
          .delete(`/notes/${id}`)
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.UNAUTHORIZED);
        expect(body).toEqual({ message: 'Unauthorized', statusCode: 401 });
      });
    });

    describe('when token is valid', () => {
      it('should respond with status 404 when note not exists', async () => {
        const { token } = await UserFactories.createUserAndValidToken(prisma);
        const { statusCode, body } = await server
          .delete(`/notes/${faker.number.int({ min: 1, max: 10 })}`)
          .set('Authorization', token);

        expect(statusCode).toBe(HttpStatus.NOT_FOUND);
        expect(body).toEqual({
          error: 'Not Found',
          message: 'Note doesnt exists!',
          statusCode: 404,
        });
      });
    });

    it('should respond with status 403 when note not exists is user collection', async () => {
      const { token } = await UserFactories.createUserAndValidToken(prisma);
      const { user } = await UserFactories.createUserAndValidToken(prisma);
      const fakerNote = NoteFactories.noteWithoutFieldorFullBody();
      const note = await NoteFactories.createDbNote(prisma, fakerNote, user.id);

      const { statusCode, body } = await server
        .delete(`/notes/${note.id}`)
        .set('Authorization', token);

      expect(statusCode).toBe(HttpStatus.FORBIDDEN);
      expect(body).toEqual({
        error: 'Forbidden',
        message: 'This note doesnt exists in your collection!',
        statusCode: 403,
      });
    });

    it('should respond with status 204 and note data', async () => {
      const { token, user } =
        await UserFactories.createUserAndValidToken(prisma);
      const fakerNote = NoteFactories.noteWithoutFieldorFullBody();
      const note = await NoteFactories.createDbNote(prisma, fakerNote, user.id);

      const { statusCode } = await server
        .delete(`/notes/${note.id}`)
        .set('Authorization', token);

      const verify = await NoteFactories.getNoteByIdOnPrisma(prisma, note.id);

      expect(statusCode).toBe(HttpStatus.NO_CONTENT);
      expect(verify).toBeNull();
    });
  });
});
