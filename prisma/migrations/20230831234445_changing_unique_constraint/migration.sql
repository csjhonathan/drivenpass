/*
  Warnings:

  - A unique constraint covering the columns `[title,userId]` on the table `Card` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[title,userId]` on the table `Credential` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[title,userId]` on the table `Note` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Card_title_number_key";

-- DropIndex
DROP INDEX "Credential_title_key";

-- DropIndex
DROP INDEX "Note_text_key";

-- CreateIndex
CREATE UNIQUE INDEX "Card_title_userId_key" ON "Card"("title", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Credential_title_userId_key" ON "Credential"("title", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Note_title_userId_key" ON "Note"("title", "userId");
