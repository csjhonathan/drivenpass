import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { NoteModule } from './note/note.module';
import { CredentialModule } from './credential/credential.module';
import { CardModule } from './card/card.module';

@Module({
  imports: [PrismaModule, UserModule, NoteModule, CredentialModule, CardModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
