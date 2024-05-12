/*
  Warnings:

  - You are about to drop the column `meta` on the `take_answers` table. All the data in the column will be lost.
  - You are about to drop the column `endedAt` on the `takes` table. All the data in the column will be lost.
  - You are about to drop the column `meta` on the `takes` table. All the data in the column will be lost.
  - You are about to drop the column `startedAt` on the `takes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "take_answers" DROP COLUMN "meta";

-- AlterTable
ALTER TABLE "takes" DROP COLUMN "endedAt",
DROP COLUMN "meta",
DROP COLUMN "startedAt";
