import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { JwtModuleOptions } from './jwt.interface';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: JwtModuleOptions,
  ) {
    //console.log(options);
  }
  //for specific user use like below this instead of sign(paylod:object)
  sign(userId: number): string {
    return jwt.sign({ id: userId }, this.options.privateKey);
  }
  //decrypt token
  verify(token: string) {
    return jwt.verify(token, this.options.privateKey);
  }
}
