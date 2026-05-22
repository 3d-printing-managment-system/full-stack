/*
  Warnings:

  - You are about to drop the `_FilamentProfileToPrintJob` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `queuePosition` to the `PrintJob` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PrintJob" DROP CONSTRAINT "PrintJob_printerId_fkey";

-- DropForeignKey
ALTER TABLE "_FilamentProfileToPrintJob" DROP CONSTRAINT "_FilamentProfileToPrintJob_A_fkey";

-- DropForeignKey
ALTER TABLE "_FilamentProfileToPrintJob" DROP CONSTRAINT "_FilamentProfileToPrintJob_B_fkey";

-- AlterTable
ALTER TABLE "PrintJob" ADD COLUMN     "profileId" TEXT,
ADD COLUMN     "queuePosition" INTEGER NOT NULL,
ADD COLUMN     "requiredTagIds" TEXT[],
ALTER COLUMN "printerId" DROP NOT NULL;

-- DropTable
DROP TABLE "_FilamentProfileToPrintJob";

-- AddForeignKey
ALTER TABLE "PrintJob" ADD CONSTRAINT "PrintJob_printerId_fkey" FOREIGN KEY ("printerId") REFERENCES "Printer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrintJob" ADD CONSTRAINT "PrintJob_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "FilamentProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
