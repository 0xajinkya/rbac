/*
  Warnings:

  - A unique constraint covering the columns `[organization_id,user_id]` on the table `staff` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "staff_organization_id_user_id_key" ON "staff"("organization_id", "user_id");
