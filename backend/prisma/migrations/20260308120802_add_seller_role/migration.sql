-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'SELLER';

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "sellerId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "storeName" TEXT;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
