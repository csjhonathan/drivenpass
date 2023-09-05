import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function dbSeed() {
  try {
    const cardsType = await prisma.cardType.findMany();

    if (cardsType.length === 2) {
      throw 'Já existem 2 tipos de cartão no banco de dados.';
    }

    const cardTypes: string[] = ['Credit', 'Debit'];

    cardTypes.forEach(async (type) => {
      await prisma.cardType.create({
        data: { type },
      });
      console.log(`Card type:${type} added in database!`);
    });

    console.log('Seed concluído com sucesso.');
  } catch (error) {
    console.error('Erro durante o seed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

dbSeed().catch((e) => {
  console.log(e.message);
});
