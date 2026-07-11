-- Remove SSLCOMMERZ from PaymentProvider enum
-- DB is in partial state: PaymentProvider_old exists, payments.provider is still of that type

-- Step 1: Update SSLCOMMERZ rows using text cast (column is PaymentProvider_old)
UPDATE "payments" SET "provider" = 'STRIPE'::"PaymentProvider_old" WHERE "provider"::text = 'SSLCOMMERZ';

-- Step 2: Create the new clean enum (only STRIPE)
DROP TYPE IF EXISTS "PaymentProvider";
CREATE TYPE "PaymentProvider" AS ENUM ('STRIPE');

-- Step 3: Migrate column to new enum type
ALTER TABLE "payments" ALTER COLUMN "provider" TYPE "PaymentProvider" USING "provider"::text::"PaymentProvider";

-- Step 4: Drop old enum
DROP TYPE "PaymentProvider_old";
