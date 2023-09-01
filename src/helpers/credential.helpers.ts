import { Credential } from '@prisma/client';
import { CreateCredentialDto } from '../credential/dto/create-credential.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CredentialHelpers {
  private Cryptr = require('cryptr');
  private crypter = new this.Cryptr(process.env.CRYPTR_SECRET);

  formatCredential(
    cred: Credential | CreateCredentialDto,
  ): Credential | CreateCredentialDto {
    return {
      ...cred,
      password: this.crypter.decrypt(cred.password),
    };
  }
}
