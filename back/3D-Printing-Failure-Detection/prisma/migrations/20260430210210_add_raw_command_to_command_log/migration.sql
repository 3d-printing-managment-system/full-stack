/*
  Warnings:

  - Added the required column `rawCommand` to the `CommandLog` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CommandLog" DROP CONSTRAINT "CommandLog_commandId_fkey";

-- DropIndex
DROP INDEX "CommandLog_commandId_key";

-- AlterTable
ALTER TABLE "CommandLog" ADD COLUMN     "rawCommand" TEXT NOT NULL,
ALTER COLUMN "commandId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "CommandLog" ADD CONSTRAINT "CommandLog_commandId_fkey" FOREIGN KEY ("commandId") REFERENCES "GcodeCommand"("id") ON DELETE SET NULL ON UPDATE CASCADE;
