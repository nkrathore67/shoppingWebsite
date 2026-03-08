import { prisma } from "../config/database";
import type { CreateReviewInput, UpdateReviewInput } from "../schemas/reviews.schema";

export async function getProductReviews(
  productId: string,
  page = 1,
  limit = 10,
  rating?: number
) {
  const skip = (page - 1) * limit;
  const where = { productId, ...(rating && { rating }) };
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.review.count({ where }),
  ]);
  return { reviews, total };
}

export async function createReview(
  userId: string,
  productId: string,
  input: CreateReviewInput
) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error("PRODUCT_NOT_FOUND");

  const review = await prisma.review.create({
    data: { userId, productId, ...input },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  });

  await updateProductRating(productId);
  return review;
}

export async function updateReview(
  userId: string,
  reviewId: string,
  input: UpdateReviewInput
) {
  const review = await prisma.review.findFirst({ where: { id: reviewId, userId } });
  if (!review) throw new Error("NOT_FOUND");

  const updated = await prisma.review.update({ where: { id: reviewId }, data: input });
  await updateProductRating(review.productId);
  return updated;
}

export async function deleteReview(userId: string, reviewId: string) {
  const review = await prisma.review.findFirst({ where: { id: reviewId, userId } });
  if (!review) throw new Error("NOT_FOUND");

  await prisma.review.delete({ where: { id: reviewId } });
  await updateProductRating(review.productId);
}

async function updateProductRating(productId: string) {
  const result = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: result._avg.rating ?? 0,
      reviewCount: result._count.rating,
    },
  });
}
