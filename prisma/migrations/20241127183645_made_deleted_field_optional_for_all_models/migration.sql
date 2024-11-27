-- AlterTable
ALTER TABLE "blog" ALTER COLUMN "deleted" DROP NOT NULL;

-- AlterTable
ALTER TABLE "blog_comment" ALTER COLUMN "deleted" DROP NOT NULL;

-- AlterTable
ALTER TABLE "blog_review" ALTER COLUMN "deleted" DROP NOT NULL;

-- AlterTable
ALTER TABLE "organization" ALTER COLUMN "deleted" DROP NOT NULL;

-- AlterTable
ALTER TABLE "staff" ALTER COLUMN "deleted" DROP NOT NULL;

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "deleted" DROP NOT NULL;
