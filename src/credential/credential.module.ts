import { Module } from '@nestjs/common';
import { CredentialService } from './credential.service';
import { CredentialController } from './credential.controller';
import { CredentialRepository } from './credential.repository';

@Module({
  controllers: [CredentialController],
  providers: [CredentialService, CredentialRepository],
})
export class CredentialModule {}
