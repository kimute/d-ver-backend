import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UserService } from './users.service';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';

//mock function
const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  findOneOrFail: jest.fn(),
  delete: jest.fn(),
});

const mockJwtService = {
  sign: jest.fn(() => 'signed-token'),
  verify: jest.fn(),
};

const mockMailService = {
  sendVerificationEmail: jest.fn(),
};
//partial: make all properties optional
type mockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UserService', () => {
  let service: UserService;
  let usersRepository: mockRepository<User>;
  let VerificationRepository: mockRepository<Verification>;
  let mailService: MailService;
  let jwtService: JwtService;
  // before test run create test module
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          //from TypeORM testing
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository(),
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();
    service = module.get<UserService>(UserService);
    usersRepository = module.get(getRepositoryToken(User));
    VerificationRepository = module.get(getRepositoryToken(Verification));
    mailService = module.get<MailService>(MailService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('check be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    const createAccountTestArgs = {
      email: 'test@test.com',
      password: 'testpassword1234',
      role: 0,
    };
    //test case: create user exists fail
    it('Fail: if user exists', async () => {
      usersRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
      });
      const result = await service.createAccount(createAccountTestArgs);
      expect(result).toMatchObject({
        ok: false,
        error: 'user with this email already exist',
      });
    });
    // test case: create user exists success
    it('create a new user', async () => {
      usersRepository.findOne.mockResolvedValue(undefined);
      usersRepository.create.mockReturnValue(createAccountTestArgs);
      usersRepository.save.mockReturnValue(createAccountTestArgs);
      VerificationRepository.create.mockReturnValue({
        user: createAccountTestArgs,
      });
      VerificationRepository.save.mockResolvedValue({
        code: 'code',
      });
      const result = await service.createAccount(createAccountTestArgs);
      //call 1 time
      expect(usersRepository.create).toHaveBeenCalledTimes(1);
      //write expect result
      expect(usersRepository.create).toHaveBeenCalledWith(
        createAccountTestArgs,
      );
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      //write expect result
      expect(usersRepository.save).toHaveBeenCalledWith(createAccountTestArgs);
      expect(VerificationRepository.create).toHaveBeenCalledTimes(1);
      expect(VerificationRepository.create).toHaveBeenCalledWith({
        user: createAccountTestArgs,
      });
      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
      );
      expect(result).toEqual({ ok: true });
    });
    //test case: fail on exception
    it('Fail on Exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error('some things'));
      const result = await service.createAccount(createAccountTestArgs);
      expect(result).toEqual({ ok: false, error: 'create account failed!' });
    });
  });

  describe('login', () => {
    const testLoginArgs = {
      email: 'test@test.com',
      password: 'testpass1234',
    };
    it('Fail: if user doese not exist', async () => {
      usersRepository.findOne.mockResolvedValue(null);
      const result = await service.login(testLoginArgs);

      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
      );
      expect(result).toEqual({
        ok: false,
        error: 'user not found',
      });
    });

    it('Fail: if the password is wrong', async () => {
      const mockUservals = {
        checkPassword: jest.fn(() => Promise.resolve(false)),
      };
      usersRepository.findOne.mockResolvedValue(mockUservals);
      const result = await service.login(testLoginArgs);
      expect(result).toEqual({ ok: false, error: 'Wrong password' });
    });

    it('return token if the password is correct', async () => {
      const mockUservals = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true)),
      };
      usersRepository.findOne.mockResolvedValue(mockUservals);
      const result = await service.login(testLoginArgs);
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number));
      expect(result).toEqual({ ok: true, token: 'signed-token' });
    });
    it('Login Fail on Exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await service.login(testLoginArgs);
      expect(result).toEqual({
        ok: false,
        error: "can't log in",
      });
    });
    describe('findById', () => {
      const findbyIdTestArgs = {
        id: 1,
      };
      it('Find an existing user', async () => {
        usersRepository.findOneOrFail.mockResolvedValue(findbyIdTestArgs);
        const result = await service.findById(1);
        console.log(result);
        expect(result).toEqual({ ok: true, user: findbyIdTestArgs });
      });

      it('Fail if no user is  found', async () => {
        usersRepository.findOneOrFail.mockRejectedValue(new Error());
        const result = await service.findById(1);
        expect(result).toEqual({ ok: false, error: 'User Not Found' });
      });
    });

    describe('editProfile', () => {
      it('change email', async () => {
        const oldUser = {
          email: 'test@old.com',
          verified: true,
        };
        const editProfileTestArgs = {
          userId: 1,
          input: { email: 'test@new.com' },
        };
        const newVerification = {
          code: 'test_code',
        };
        const newUser = {
          verified: false,
          email: editProfileTestArgs.input.email,
        };

        usersRepository.findOne.mockResolvedValue(oldUser);
        // create return mockeReturnValue (no promise return)
        VerificationRepository.create.mockReturnValue(newVerification);
        VerificationRepository.save.mockResolvedValue(newVerification);
        await service.editProfile(
          editProfileTestArgs.userId,
          editProfileTestArgs.input,
        );
        expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
        expect(usersRepository.findOne).toHaveBeenCalledWith(
          editProfileTestArgs.userId,
        );
        expect(VerificationRepository.create).toHaveBeenCalledWith({
          user: newUser,
        });
        expect(VerificationRepository.save).toHaveBeenCalledWith(
          newVerification,
        );
        expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
          newUser.email,
          newVerification.code,
        );
      });
      it('change password', async () => {
        const editProfileTestArgs = {
          userId: 1,
          input: { password: 'testPassword' },
        };
        usersRepository.findOne.mockReturnValue({ password: 'oldPassword' });
        const result = await service.editProfile(
          editProfileTestArgs.userId,
          editProfileTestArgs.input,
        );
        expect(usersRepository.save).toHaveBeenCalledTimes(1);
        expect(usersRepository.save).toHaveBeenCalledWith(
          editProfileTestArgs.input,
        );
        expect(result).toEqual({ ok: true });
      });
      it('Fail on exception', async () => {
        usersRepository.findOne.mockRejectedValue(new Error());
        const result = await service.editProfile(1, { email: '111' });
        expect(result).toEqual({
          ok: false,
          error: 'Could not update profile.',
        });
      });
    });
    describe('verifyEmail', () => {
      it('verify email test', async () => {
        const mockVerification = {
          user: {
            verified: false,
          },
          id: 1,
        };
        VerificationRepository.findOne.mockResolvedValue(mockVerification);
        const result = await service.verifyEmail('');
        expect(VerificationRepository.findOne).toHaveBeenCalledTimes(1);
        expect(VerificationRepository.findOne).toHaveBeenCalledWith(
          expect.any(Object),
          expect.any(Object),
        );
        expect(usersRepository.save).toHaveBeenCalledTimes(1);
        expect(usersRepository.save).toHaveBeenCalledWith({ verified: true });
        expect(VerificationRepository.delete).toHaveBeenCalledTimes(1);
        expect(VerificationRepository.delete).toHaveBeenCalledWith(
          mockVerification.id,
        );
        expect(result).toEqual({ ok: true });
      });
      it('Fail if verification not found', async () => {
        VerificationRepository.findOne.mockResolvedValue(undefined);
        const result = await service.verifyEmail('');
        expect(result).toEqual({ ok: false, error: 'Verification not found' });
      });
      it('Fail on exception', async () => {
        VerificationRepository.findOne.mockRejectedValue(new Error());
        const result = await service.verifyEmail('');
        expect(result).toEqual({ ok: false, error: 'Could not verify email' });
      });
    });
  });
});
