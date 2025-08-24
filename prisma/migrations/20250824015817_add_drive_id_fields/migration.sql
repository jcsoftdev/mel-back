/*
  Warnings:

  - You are about to drop the column `level` on the `RoleDocumentAccess` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `RoleSectionAccess` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[driveId]` on the table `Document` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[driveId]` on the table `Section` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "driveId" TEXT;

-- AlterTable
ALTER TABLE "RoleDocumentAccess" DROP COLUMN "level";

-- AlterTable
ALTER TABLE "RoleSectionAccess" DROP COLUMN "level";

-- AlterTable
ALTER TABLE "Section" ADD COLUMN     "driveId" TEXT;

-- DropEnum
DROP TYPE "AccessLevel";

-- CreateIndex
CREATE UNIQUE INDEX "Document_driveId_key" ON "Document"("driveId");

-- CreateIndex
CREATE INDEX "Document_driveId_idx" ON "Document"("driveId");

-- CreateIndex
CREATE UNIQUE INDEX "Section_driveId_key" ON "Section"("driveId");

-- CreateIndex
CREATE INDEX "Section_driveId_idx" ON "Section"("driveId");
