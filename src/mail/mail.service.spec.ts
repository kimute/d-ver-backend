import { Test } from '@nestjs/testing';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailService } from './mail.service';
import got from 'got';
import * as FormData from 'form-data';
import { isEmail } from 'class-validator';
import { string } from 'joi';

jest.mock('got');
jest.mock('form-data');

const TEST_DOMAIN = 'testDomain';

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: CONFIG_OPTIONS,
          useValue: {
            apiKey: 'testApikey',
            domain: TEST_DOMAIN,
            fromEmail: 'testFromEmail',
          },
        },
      ],
    }).compile();
    service = module.get<MailService>(MailService);
  });

  it('it should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendVerificationEmail', () => {
    it('Call sendEmail', () => {
      const sendVerificationEmailTestArgs = {
        email: 'email',
        code: 'code',
      };
      jest.spyOn(service, 'sendEmail').mockImplementation(async () => true);
      service.sendVerificationEmail(
        sendVerificationEmailTestArgs.email,
        sendVerificationEmailTestArgs.code,
      );
      expect(service.sendEmail).toHaveBeenCalledTimes(1);
      expect(service.sendEmail).toHaveBeenCalledWith(
        'Verify your email',
        'deliver',
        [
          { key: 'code', value: sendVerificationEmailTestArgs.code },
          { key: 'username', value: sendVerificationEmailTestArgs.email },
        ],
      );
    });
  });
  describe('sendEmail', () => {
    it('sends emails', async () => {
      const result = await service.sendEmail('', '', []);
      const spyForm = jest.spyOn(FormData.prototype, 'append');
      expect(spyForm).toHaveBeenCalled();
      expect(got.post).toHaveBeenCalledTimes(1);
      expect(got.post).toHaveBeenCalledWith(
        `https://api.mailgun.net/v3/${TEST_DOMAIN}/messages`,
        expect.any(Object),
      );
      expect(result).toEqual(true);
    });
    it('fails on error', async () => {
      jest.spyOn(got, 'post').mockImplementation(() => {
        throw new Error();
      });
      const result = await service.sendEmail('', '', []);
      expect(result).toEqual(false);
    });
  });
});
