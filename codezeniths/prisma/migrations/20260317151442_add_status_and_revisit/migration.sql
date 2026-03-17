-- CreateEnum
CREATE TYPE "Status" AS ENUM ('SOLVED', 'NOT_SOLVED');

-- AlterTable
ALTER TABLE "problem" ADD COLUMN     "revisit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'NOT_SOLVED';
