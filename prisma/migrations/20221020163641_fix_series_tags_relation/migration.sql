/*
  Warnings:

  - The primary key for the `SeriesTags` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `SeriesTags` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SeriesTags" DROP CONSTRAINT "SeriesTags_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "SeriesTags_pkey" PRIMARY KEY ("seriesId", "tagId");
