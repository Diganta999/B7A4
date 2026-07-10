-- DropForeignKey
ALTER TABLE "gear_items" DROP CONSTRAINT "gear_items_categoryId_fkey";

-- AddForeignKey
ALTER TABLE "gear_items" ADD CONSTRAINT "gear_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
