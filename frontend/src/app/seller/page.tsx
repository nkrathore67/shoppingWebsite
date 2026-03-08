"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Package, CheckCircle, Archive } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SellerDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["seller-stats"],
    queryFn: async () => {
      const { data } = await api.get("/seller/stats");
      return data as { total: number; active: number; totalStock: number };
    },
  });

  const cards = [
    { label: "Total Products", value: stats?.total ?? 0, icon: Package, color: "text-emerald-600" },
    { label: "Active Products", value: stats?.active ?? 0, icon: CheckCircle, color: "text-blue-600" },
    { label: "Total Stock", value: stats?.totalStock ?? 0, icon: Archive, color: "text-purple-600" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your products and inventory</p>
        </div>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
          <Link href="/seller/products/new">+ Add Product</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border p-6 h-28 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {cards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{value.toLocaleString()}</p>
                </div>
                <Icon className={`h-8 w-8 ${color}`} />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-2">Quick Actions</h2>
        <div className="flex gap-3 mt-4">
          <Button asChild variant="outline">
            <Link href="/seller/products">View My Products</Link>
          </Button>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/seller/products/new">Add New Product</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
