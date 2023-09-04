import { Module } from '@nestjs/common';
import { CredentialService } from './credential.service';
import { CredentialController } from './credential.controller';
import { CredentialRepository } from './credential.repository';
import { CredentialHelpers } from '../helpers/credential.helpers';

@Module({
  controllers: [CredentialController],
  providers: [CredentialService, CredentialRepository, CredentialHelpers],
})
export class CredentialModule {}
