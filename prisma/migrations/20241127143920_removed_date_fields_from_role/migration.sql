/*
  Warnings:

  - You are about to drop the column `created_at` on the `role` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `role` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `role` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "role" DROP COLUMN "created_at",
DROP COLUMN "deleted_at",
DROP COLUMN "updated_at";

 INSERT INTO "role" (id, name)
      VALUES ('super_admin', 'super_admin')
      ON CONFLICT (id) DO NOTHING;

INSERT INTO "role" (id, name)
      VALUES ('admin', 'admin')
      ON CONFLICT (id) DO NOTHING;
    
INSERT INTO "role" (id, name)
      VALUES ('editor', 'editor')
      ON CONFLICT (id) DO NOTHING;
INSERT INTO "role" (id, name)
      VALUES ('reviewer', 'reviewer')
      ON CONFLICT (id) DO NOTHING;
INSERT INTO "role" (id, name)
      VALUES ('user', 'user')
      ON CONFLICT (id) DO NOTHING;