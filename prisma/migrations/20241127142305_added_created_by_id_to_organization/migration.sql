/*
  Warnings:

  - Added the required column `created_by_id` to the `organization` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "organization" ADD COLUMN     "created_by_id" VARCHAR(20) NOT NULL;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
