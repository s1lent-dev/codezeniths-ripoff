-- CreateEnum
CREATE TYPE "Level" AS ENUM ('FUNDAMENTAL', 'INTERMEDIATE', 'ADVANCED');

-- AlterTable
ALTER TABLE "sheet_topic" ADD COLUMN     "description" TEXT,
ADD COLUMN     "level" "Level";
