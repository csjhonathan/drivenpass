import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { User } from '@prisma/client';
import { CredentialRepository } from './credential.repository';

@Injectable()
export class CredentialService {
  Cryptr = require('cryptr');
  crypter = new this.Cryptr(process.env.CRYPTR_SECRET);

  constructor(private readonly credentialRepository: CredentialRepository) {}

  async create(
    createCredentialDto: CreateCredentialDto,
    user: Omit<User, 'password' | 'createdAt' | 'updatedAt'>,
  ) {
    const { title } = createCredentialDto;
    const { id: userId } = user;
    const credential = await this.findOneByTitleAndUserId(title, userId);

    if (credential) {
      throw new ConflictException(
        'This credential title is already in use in your collection!',
      );
    }

    const data: CreateCredentialDto = {
      ...createCredentialDto,
      password: this.crypter.encrypt(createCredentialDto.password),
    };

    return this.credentialRepository.create(data, userId);
  }

  async findAll(userId: number) {
    const credentials = await this.credentialRepository.findAll(userId);

    return credentials.map((cred) => ({
      ...cred,
      password: this.crypter.decrypt(cred.password),
    }));
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

    return {
      ...credential,
      password: this.crypter.decrypt(credential.password),
    };
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);

    return this.credentialRepository.remove(id);
  }

  private findOneByTitleAndUserId(title: string, userId: number) {
    return this.credentialRepository.findOneByTitleAndUserId(title, userId);
  }
}
