-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('active', 'paused', 'expired');

-- CreateEnum
CREATE TYPE "CampaignCategory" AS ENUM ('marketing', 'sales', 'product', 'events', 'other');

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'active',
    "category" "CampaignCategory" NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);
