/*
  Warnings:

  - The primary key for the `SeriesTags` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "SeriesTags" DROP CONSTRAINT "SeriesTags_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "SeriesTags_pkey" PRIMARY KEY ("id");
