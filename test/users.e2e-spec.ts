import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Verification } from 'src/users/entities/verification.entity';

jest.mock('got', () => {
  return {
    post: jest.fn(),
  };
});
// graphql endpoint
const ENDPOINT = '/graphql';

const testUser = {
  email: 'test_client@account.com',
  password: 'testclient1234',
};

describe('UserModule (e2e test)', () => {
  let app: INestApplication;
  let usersRepository: Repository<User>;
  let verificationsRepository: Repository<Verification>;
  let jwt_token: string;

  //call all module before test start
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    verificationsRepository = module.get<Repository<Verification>>(
      getRepositoryToken(Verification),
    );
    await app.init();
  });

  //application close
  afterAll(async () => {
    await getConnection().dropDatabase();
    app.close();
  });
  describe('createAccount', () => {
    it('create account (E2E)', () => {
      return request(app.getHttpServer())
        .post(ENDPOINT)
        .send({
          query: `mutation {
          createAccount(input: {
            email: "${testUser.email}",
            password:"${testUser.password}",
            role:owner
          }){
            ok
            error
          }
        }`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.ok).toBe(true);
          expect(res.body.data.createAccount.error).toBe(null);
        });
    });

    it('Fail if account already exists (E2E)', () => {
      return request(app.getHttpServer())
        .post(ENDPOINT)
        .send({
          query: `mutation {
          createAccount(input: {
            email: "${testUser.email}",
            password:"${testUser.password}"
            role:owner
          }){
            ok
            error
          }
        }`,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { createAccount },
            },
          } = res;
          expect(createAccount.ok).toBe(false);
          expect(createAccount.error).toEqual(expect.any(String));
        });
    });
  });

  describe('login', () => {
    it('login with correct TOKEN', () => {
      return request(app.getHttpServer())
        .post(ENDPOINT)
        .send({
          query: `mutation {
            login(input:{
              email: "${testUser.email}",
              password:"${testUser.password}"
            }){
              ok
              token
              error
            }
          }`,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { login },
            },
          } = res;
          expect(login.ok).toBe(true);
          expect(login.error).toBe(null);
          expect(login.token).toEqual(expect.any(String));
          jwt_token = login.token;
        });
    });
    it('can not be able to login with wrong TOKEN', () => {
      return request(app.getHttpServer())
        .post(ENDPOINT)
        .send({
          query: `mutation {
            login(input:{
              email: "${testUser.email}",
              password:"wrongpassword"
            }){
              ok
              token
              error
            }
          }`,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { login },
            },
          } = res;
          expect(login.ok).toBe(false);
          expect(login.error).toBe('Wrong password');
          expect(login.token).toEqual(null);
        });
    });
  });
  describe('userProfile', () => {
    let userId: number;
    beforeAll(async () => {
      const [user] = await usersRepository.find();
      userId = user.id;
    });
    it("user's profile (E2E)", () => {
      return request(app.getHttpServer())
        .post(ENDPOINT)
        .set('X-JWT', jwt_token)
        .send({
          query: `
        {
          userProfile(userId:${userId}){
            ok
            error
            user {
              id
            }
          }
        }
        `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                userProfile: {
                  ok,
                  error,
                  user: { id },
                },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
          expect(id).toBe(userId);
        });
    });
    it('not find a profile(E2E)', () => {
      return request(app.getHttpServer())
        .post(ENDPOINT)
        .set('x-JWT', jwt_token)
        .send({
          query: `
        {
          userProfile(userId:999){
            ok
            error
            user {
              id
            }
          }
        }
        `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                userProfile: { ok, error, user },
              },
            },
          } = res;
          expect(ok).toBe(false);
          expect(error).toBe('User Not Found');
          expect(user).toBe(null);
        });
    });
  });
  describe('me', () => {
    it('find my profile', () => {
      return request(app.getHttpServer())
        .post(ENDPOINT)
        .set('X-JWT', jwt_token)
        .send({
          query: `
          {
            me {email}
          }
        `,
        })
        .expect(200);
    });
    it('should not allow logged out user', () => {
      return request(app.getHttpServer())
        .post(ENDPOINT)
        .send({
          query: `
        {
          me {
            email
          }
        }
      `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: { errors },
          } = res;
          const [error] = errors;
          expect(error.message).toBe('Forbidden resource');
        });
    });
  });

  describe('editProfile', () => {
    const NEW_EMAIL = 'test@test.com';
    it('should change email', () => {
      return request(app.getHttpServer())
        .post(ENDPOINT)
        .set('X-JWT', jwt_token)
        .send({
          query: `
            mutation {
              editProfile(input:{
                email: "${NEW_EMAIL}"
              }) {
                ok
                error
              }
            }
        `,
        })
        .expect(200);
    });
    it('test new email', () => {
      return request(app.getHttpServer())
        .post(ENDPOINT)
        .set('X-JWT', jwt_token)
        .send({
          query: `
          {
            me {
              email
            }
          }
        `,
        })
        .expect(200);
    });
  });
  describe('verifyEmail', () => {
    let verificationCode: string;
    beforeAll(async () => {
      const [verification] = await verificationsRepository.find();
      verificationCode = verification.code;
    });
    it('should verify email', () => {
      return request(app.getHttpServer())
        .post(ENDPOINT)
        .send({
          query: `
          mutation {
            verifyEmail(input:{
              code:"${verificationCode}"
            }){
              ok
              error
            }
          }
        `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                verifyEmail: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });
    it('should fail on verification code not found', () => {
      return request(app.getHttpServer())
        .post(ENDPOINT)
        .send({
          query: `
          mutation {
            verifyEmail(input:{
              code:"xxxxx"
            }){
              ok
              error
            }
          }
        `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                verifyEmail: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(false);
          expect(error).toBe('Verification not found');
        });
    });
  });
});
