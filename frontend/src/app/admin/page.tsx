"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { Users, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: Array<{
    id: string;
    total: number;
    status: string;
    createdAt: string;
    user: { name: string; email: string };
  }>;
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const { data } = await api.get("/admin/stats");
      return data;
    },
  });

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Welcome back, Admin
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          label="Total Revenue"
          value={formatPrice(stats?.totalRevenue ?? 0)}
          icon={TrendingUp}
          color="bg-purple-600"
        />
        <StatCard
          label="Total Orders"
          value={stats?.totalOrders.toLocaleString() ?? "0"}
          icon={ShoppingCart}
          color="bg-blue-600"
        />
        <StatCard
          label="Total Products"
          value={stats?.totalProducts.toLocaleString() ?? "0"}
          icon={Package}
          color="bg-green-600"
        />
        <StatCard
          label="Total Customers"
          value={stats?.totalUsers.toLocaleString() ?? "0"}
          icon={Users}
          color="bg-orange-600"
        />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {stats?.recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders`}
                className="flex items-center justify-between py-2 border-b last:border-0 hover:opacity-75"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{order.user.name}</p>
                  <p className="text-xs text-gray-500">#{order.id.slice(-8).toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatPrice(order.total)}</p>
                  <span className="text-xs text-gray-500">{order.status}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/admin/products/new"
              className="block w-full text-center px-4 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              + Add New Product
            </Link>
            <Link
              href="/admin/products"
              className="block w-full text-center px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Manage Products
            </Link>
            <Link
              href="/admin/orders"
              className="block w-full text-center px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Manage Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
