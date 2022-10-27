/*
  Warnings:

  - Added the required column `position` to the `Episode` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Episode" ADD COLUMN     "position" INTEGER NOT NULL;
