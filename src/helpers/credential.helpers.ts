import { Credential } from '@prisma/client';
import { CreateCredentialDto } from '../credential/dto/create-credential.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CredentialHelpers {
  private Cryptr = require('cryptr');
  private crypter: any;

  constructor() {
    this.crypter = new this.Cryptr(process.env.CRYPTR_SECRET);
  }

  encryptCredential(cred: CreateCredentialDto): CreateCredentialDto {
    return {
      ...cred,
      password: this.crypter.encrypt(cred.password),
    };
  }

  decryptCredential(cred: Credential): Credential {
    return {
      ...cred,
      password: this.crypter.decrypt(cred.password),
    };
  }

  static getCredentialExample() {
    return {
      id: 'Some id number',
      title: 'Some title',
      url: 'Some text',
      username: 'Some text',
      password: 'the password you use on the website you are saving',
      userId: 'Some user id',
      createdAt: 'The date that credential has been created!',
      updatedAt: 'The last date that credential has been updated!',
    };
  }
}
