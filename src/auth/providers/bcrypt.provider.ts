import { Injectable } from '@nestjs/common';
import { HashingProvider } from './hashing.provider';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptProvider implements HashingProvider {
  public async hash(value: string | Buffer): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(10);
      return bcrypt.hash(value, salt);
    } catch (error) {
      throw new Error(error);
    }
  }

  public async compare(value: string | Buffer, hash: string): Promise<boolean> {
    console.log('bcrypt compare: ', value, 'hash: ', hash);
    return bcrypt.compare(value, hash);
  }
}
