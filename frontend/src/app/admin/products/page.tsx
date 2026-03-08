"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Edit, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";
import type { Product, PaginationMeta } from "@/types";

export default function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ products: Product[]; pagination: PaginationMeta }>({
    queryKey: ["adminProducts", page, search],
    queryFn: async () => {
      const { data } = await api.get("/products", {
        params: { page, limit: 20, q: search || undefined },
      });
      return data;
    },
  });

  const { mutate: toggleActive } = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/products/${id}/toggle-active`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
      toast.success("Product status updated");
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Button asChild className="bg-purple-600 hover:bg-purple-700">
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search products..."
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Price</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Stock</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              : data?.products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Image
                          src={product.images?.[0] || `https://picsum.photos/seed/${product.slug}/40/50`}
                          alt={product.name}
                          width={40}
                          height={50}
                          className="rounded-md object-cover w-10 h-12"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-600">{product.category?.name}</p>
                      <Badge variant="secondary" className="text-xs mt-1">{product.gender}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{formatPrice(product.price)}</p>
                      {product.comparePrice && (
                        <p className="text-xs text-gray-400 line-through">{formatPrice(product.comparePrice)}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${product.totalStock === 0 ? "text-red-500" : "text-gray-900"}`}>
                        {product.totalStock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={product.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}>
                        {product.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <Link href={`/admin/products/${product.id}/edit`}>
                            <Edit className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => toggleActive(product.id)}
                        >
                          {product.isActive
                            ? <ToggleRight className="h-3.5 w-3.5 text-green-600" />
                            : <ToggleLeft className="h-3.5 w-3.5 text-gray-400" />
                          }
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>

        {data && data.pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t">
            <Button variant="outline" size="sm" disabled={!data.pagination.hasPrev} onClick={() => setPage(p => p - 1)}>
              Previous
            </Button>
            <span className="flex items-center text-sm text-gray-600 px-2">
              {page} / {data.pagination.totalPages}
            </span>
            <Button variant="outline" size="sm" disabled={!data.pagination.hasNext} onClick={() => setPage(p => p + 1)}>
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
