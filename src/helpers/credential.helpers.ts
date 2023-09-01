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
}
