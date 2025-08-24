/*
  Warnings:

  - A unique constraint covering the columns `[parentId,name]` on the table `Section` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Section_name_key";

-- AlterTable
ALTER TABLE "Section" ADD COLUMN     "parentId" TEXT;

-- CreateIndex
CREATE INDEX "Document_sectionId_idx" ON "Document"("sectionId");

-- CreateIndex
CREATE INDEX "Section_parentId_idx" ON "Section"("parentId");

-- CreateIndex
CREATE INDEX "Section_name_idx" ON "Section"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Section_parentId_name_key" ON "Section"("parentId", "name");

-- CreateIndex
CREATE INDEX "UserDocumentPermission_documentId_idx" ON "UserDocumentPermission"("documentId");

-- CreateIndex
CREATE INDEX "UserDocumentPermission_userId_idx" ON "UserDocumentPermission"("userId");

-- CreateIndex
CREATE INDEX "UserDocumentPermission_roleId_idx" ON "UserDocumentPermission"("roleId");

-- CreateIndex
CREATE INDEX "UserPermission_sectionId_idx" ON "UserPermission"("sectionId");

-- CreateIndex
CREATE INDEX "UserPermission_userId_idx" ON "UserPermission"("userId");

-- CreateIndex
CREATE INDEX "UserPermission_roleId_idx" ON "UserPermission"("roleId");

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;
