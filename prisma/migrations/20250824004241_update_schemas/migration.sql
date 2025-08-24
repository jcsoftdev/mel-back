/*
  Warnings:

  - You are about to drop the `UserDocumentPermission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserPermission` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "AccessLevel" AS ENUM ('READ', 'WRITE', 'ADMIN');

-- DropForeignKey
ALTER TABLE "UserDocumentPermission" DROP CONSTRAINT "UserDocumentPermission_documentId_fkey";

-- DropForeignKey
ALTER TABLE "UserDocumentPermission" DROP CONSTRAINT "UserDocumentPermission_roleId_fkey";

-- DropForeignKey
ALTER TABLE "UserDocumentPermission" DROP CONSTRAINT "UserDocumentPermission_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserPermission" DROP CONSTRAINT "UserPermission_roleId_fkey";

-- DropForeignKey
ALTER TABLE "UserPermission" DROP CONSTRAINT "UserPermission_sectionId_fkey";

-- DropForeignKey
ALTER TABLE "UserPermission" DROP CONSTRAINT "UserPermission_userId_fkey";

-- DropTable
DROP TABLE "UserDocumentPermission";

-- DropTable
DROP TABLE "UserPermission";

-- CreateTable
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleSectionAccess" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "level" "AccessLevel" NOT NULL DEFAULT 'READ',

    CONSTRAINT "RoleSectionAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleDocumentAccess" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "level" "AccessLevel" NOT NULL DEFAULT 'READ',

    CONSTRAINT "RoleDocumentAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserRole_userId_idx" ON "UserRole"("userId");

-- CreateIndex
CREATE INDEX "UserRole_roleId_idx" ON "UserRole"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_userId_roleId_key" ON "UserRole"("userId", "roleId");

-- CreateIndex
CREATE INDEX "RoleSectionAccess_roleId_idx" ON "RoleSectionAccess"("roleId");

-- CreateIndex
CREATE INDEX "RoleSectionAccess_sectionId_idx" ON "RoleSectionAccess"("sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "RoleSectionAccess_roleId_sectionId_key" ON "RoleSectionAccess"("roleId", "sectionId");

-- CreateIndex
CREATE INDEX "RoleDocumentAccess_roleId_idx" ON "RoleDocumentAccess"("roleId");

-- CreateIndex
CREATE INDEX "RoleDocumentAccess_documentId_idx" ON "RoleDocumentAccess"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "RoleDocumentAccess_roleId_documentId_key" ON "RoleDocumentAccess"("roleId", "documentId");

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleSectionAccess" ADD CONSTRAINT "RoleSectionAccess_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleSectionAccess" ADD CONSTRAINT "RoleSectionAccess_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleDocumentAccess" ADD CONSTRAINT "RoleDocumentAccess_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleDocumentAccess" ADD CONSTRAINT "RoleDocumentAccess_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
