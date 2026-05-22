/*
  Warnings:

  - Added the required column `printerSelectionMode` to the `PrintJob` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PrinterSelectionMode" AS ENUM ('NEXT_AVAILABLE_WITH_SPECIFIC_TAG', 'SPECIFIC_PRINTER');

-- AlterTable
ALTER TABLE "PrintJob" ADD COLUMN     "printerSelectionMode" "PrinterSelectionMode" NOT NULL;
