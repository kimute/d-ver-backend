import got from 'got';
import * as FormData from 'form-data';
import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { EmailVars, MailModuleOptions } from './mail.interfaces';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {
    //console.log(options)
    //this.sendEmail('testing', 'test')
  }
  // base64: Buffer.from('api:YOUR_API_KEY').toString('base64')
  async sendEmail(
    subject: string,
    template: string,
    emailVars: EmailVars[],
  ): Promise<boolean> {
    const form = new FormData();
    form.append('from', `Excited User <mailgun@${this.options.domain}>`);
    form.append('to', `jkdnekki@naver.com`);
    form.append('subject', subject);
    form.append('template', template); //use mailgun custom email
    emailVars.forEach((elem) => form.append(`v:${elem.key}`, elem.value));
    try {
      const response = await got.post(
        `https://api.mailgun.net/v3/${this.options.domain}/messages`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              `api:${this.options.apiKey}`,
            ).toString('base64')}`,
          },
          body: form,
        },
      );
      return true;
    } catch (error) {
      return false;
    }
    // const response = await got(`https://api.mailgun.net/v3/${this.options.domain}/messages`, {
    //     method: 'POST',
    //     headers: {
    //         Authorization: `Basic ${Buffer.from(
    //             `api:${this.options.apiKey}`).toString('base64')}`
    //     },
    //     body: form},
    //);
    //console.log(response.body);
  }

  sendVerificationEmail(email: string, code: string) {
    this.sendEmail('Verify your email', 'deliver', [
      { key: 'code', value: code },
      { key: 'username', value: email },
    ]);
  }
}
