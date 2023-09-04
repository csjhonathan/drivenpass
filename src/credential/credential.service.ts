import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { CredentialRepository } from './credential.repository';
import { CredentialHelpers } from '../helpers/credential.helpers';

@Injectable()
export class CredentialService {
  constructor(
    private readonly credentialRepository: CredentialRepository,
    private readonly credentialHelpers: CredentialHelpers,
  ) {}

  async create(createCredentialDto: CreateCredentialDto, userId: number) {
    const { title } = createCredentialDto;
    const credential = await this.findOneByTitleAndUserId(title, userId);

    if (credential) {
      throw new ConflictException(
        'This credential title is already in use in your collection!',
      );
    }

    const data: CreateCredentialDto =
      this.credentialHelpers.encryptCredential(createCredentialDto);

    return this.credentialRepository.create(data, userId);
  }

  async findAll(userId: number) {
    const credentials = await this.credentialRepository.findAll(userId);

    return credentials.map((cred) =>
      this.credentialHelpers.decryptCredential(cred),
    );
  }

  async findOne(id: number, userId: number) {
    const credential = await this.credentialRepository.findOne(id);

    if (!credential) {
      throw new NotFoundException('Credential doesnt exists!');
    }

    if (credential.userId !== userId) {
      throw new ForbiddenException(
        'This credential doesnt exists in your collection!',
      );
    }

    return this.credentialHelpers.decryptCredential(credential);
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);

    return this.credentialRepository.remove(id, userId);
  }

  private findOneByTitleAndUserId(title: string, userId: number) {
    return this.credentialRepository.findOneByTitleAndUserId(title, userId);
  }
}
