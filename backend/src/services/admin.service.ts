import { prisma } from "../config/database";

export async function getAdminStats() {
  const [
    totalUsers,
    totalProducts,
    totalOrders,
    revenueResult,
    recentOrders,
    lowStockVariants,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { paymentStatus: "PAID" },
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.productVariant.findMany({
      where: { stock: { lt: 5, gt: 0 } },
      include: {
        product: { select: { id: true, name: true, images: true } },
      },
      take: 10,
    }),
  ]);

  // Revenue by day for last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const revenueByDay = await prisma.order.groupBy({
    by: ["createdAt"],
    _sum: { total: true },
    where: {
      paymentStatus: "PAID",
      createdAt: { gte: thirtyDaysAgo },
    },
  });

  return {
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue: revenueResult._sum.total ?? 0,
    recentOrders,
    lowStockVariants,
    revenueByDay,
  };
}
