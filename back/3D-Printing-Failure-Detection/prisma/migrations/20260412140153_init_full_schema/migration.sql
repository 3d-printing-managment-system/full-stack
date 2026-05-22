/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PrinterStatus" AS ENUM ('IDLE', 'PRINTING', 'PAUSED', 'OFFLINE');

-- CreateEnum
CREATE TYPE "CommandStatus" AS ENUM ('SENT', 'SUCCESS', 'ERROR');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('QUEUED', 'PRINTING', 'PAUSED', 'DONE', 'FAILED');

-- CreateEnum
CREATE TYPE "MaintenanceType" AS ENUM ('REPAIR', 'ROUTINE', 'UPGRADE');

-- CreateEnum
CREATE TYPE "InventoryType" AS ENUM ('ORDER', 'REDUCTION');

-- CreateEnum
CREATE TYPE "MaterialType" AS ENUM ('PLA', 'PLA_PLUS', 'ABS', 'PETG', 'TPU', 'ASA');

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropTable
DROP TABLE "Post";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Printer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "status" "PrinterStatus" NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "nozzleDiameter" DOUBLE PRECISION NOT NULL,
    "bedTemp" DOUBLE PRECISION NOT NULL,
    "nozzleTemp" DOUBLE PRECISION NOT NULL,
    "cameraLink" TEXT NOT NULL,
    "printerType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Printer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrinterTag" (
    "printerId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "PrinterTag_pkey" PRIMARY KEY ("printerId","tagId")
);

-- CreateTable
CREATE TABLE "CommandLog" (
    "id" TEXT NOT NULL,
    "printerId" TEXT NOT NULL,
    "commandId" TEXT NOT NULL,
    "response" TEXT,
    "status" "CommandStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommandLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GcodeCommand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "command" TEXT NOT NULL,

    CONSTRAINT "GcodeCommand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceLog" (
    "id" TEXT NOT NULL,
    "printerId" TEXT NOT NULL,
    "type" "MaintenanceType" NOT NULL,
    "description" TEXT NOT NULL,
    "cost" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MaintenanceLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrintJob" (
    "id" TEXT NOT NULL,
    "printerId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL,
    "progress" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "estimatedTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrintJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Part" (
    "id" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "nozzleDiameter" DOUBLE PRECISION NOT NULL,
    "filamentUsed" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Part_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FilamentProfile" (
    "id" TEXT NOT NULL,
    "material" "MaterialType" NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "roleSize" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "FilamentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inventory" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "updateType" "InventoryType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "totalCost" DOUBLE PRECISION,
    "date" TIMESTAMP(3) NOT NULL,
    "profileId" TEXT NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_FilamentProfileToPrintJob" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_FilamentProfileToPrintJob_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "CommandLog_commandId_key" ON "CommandLog"("commandId");

-- CreateIndex
CREATE INDEX "_FilamentProfileToPrintJob_B_index" ON "_FilamentProfileToPrintJob"("B");

-- AddForeignKey
ALTER TABLE "PrinterTag" ADD CONSTRAINT "PrinterTag_printerId_fkey" FOREIGN KEY ("printerId") REFERENCES "Printer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrinterTag" ADD CONSTRAINT "PrinterTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommandLog" ADD CONSTRAINT "CommandLog_printerId_fkey" FOREIGN KEY ("printerId") REFERENCES "Printer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommandLog" ADD CONSTRAINT "CommandLog_commandId_fkey" FOREIGN KEY ("commandId") REFERENCES "GcodeCommand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceLog" ADD CONSTRAINT "MaintenanceLog_printerId_fkey" FOREIGN KEY ("printerId") REFERENCES "Printer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrintJob" ADD CONSTRAINT "PrintJob_printerId_fkey" FOREIGN KEY ("printerId") REFERENCES "Printer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrintJob" ADD CONSTRAINT "PrintJob_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "Part"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "FilamentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FilamentProfileToPrintJob" ADD CONSTRAINT "_FilamentProfileToPrintJob_A_fkey" FOREIGN KEY ("A") REFERENCES "FilamentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FilamentProfileToPrintJob" ADD CONSTRAINT "_FilamentProfileToPrintJob_B_fkey" FOREIGN KEY ("B") REFERENCES "PrintJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
