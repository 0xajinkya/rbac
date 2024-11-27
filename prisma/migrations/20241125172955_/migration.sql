-- CreateEnum
CREATE TYPE "DocumentRequestStatus" AS ENUM ('inprogress', 'completed', 'declined');

-- CreateTable
CREATE TABLE "DocumentRequest" (
    "request_id" TEXT NOT NULL,
    "request_name" TEXT,
    "request_type_id" TEXT NOT NULL,
    "request_type_name" TEXT,
    "owner_email" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "owner_first_name" TEXT NOT NULL,
    "owner_last_name" TEXT NOT NULL,
    "request_status" "DocumentRequestStatus" NOT NULL DEFAULT 'inprogress',
    "self_sign" BOOLEAN NOT NULL DEFAULT false,
    "is_deleted" BOOLEAN NOT NULL,
    "is_sequential" BOOLEAN NOT NULL,
    "modified_time" TEXT NOT NULL,
    "action_time" TEXT NOT NULL,
    "notes" TEXT DEFAULT '',
    "actions" JSON[],
    "created_time" TEXT NOT NULL,
    "description" TEXT,
    "document_fields" JSONB[],
    "document_ids" JSON[],
    "email_reminders" BOOLEAN NOT NULL,
    "expiration_days" INTEGER NOT NULL DEFAULT 7,
    "expire_by" TEXT NOT NULL,
    "in_process" BOOLEAN NOT NULL,
    "is_expiring" BOOLEAN NOT NULL,
    "reminder_period" INTEGER DEFAULT 2,
    "sign_id" TEXT,
    "sign_percentage" DOUBLE PRECISION,
    "sign_submitted_time" TEXT NOT NULL,
    "templates_used" JSON[] DEFAULT ARRAY[]::JSON[],
    "validity" DOUBLE PRECISION NOT NULL,
    "visible_sign_settings" JSON NOT NULL DEFAULT '{}',
    "zsdocumentid" TEXT NOT NULL,
    "orgId" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "templateId" TEXT,

    CONSTRAINT "DocumentRequest_pkey" PRIMARY KEY ("request_id")
);

-- CreateTable
CREATE TABLE "Folder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "zoho_folder_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Folder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "fields" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Folder_orgId_key" ON "Folder"("orgId");

-- AddForeignKey
ALTER TABLE "DocumentRequest" ADD CONSTRAINT "DocumentRequest_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentRequest" ADD CONSTRAINT "DocumentRequest_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
