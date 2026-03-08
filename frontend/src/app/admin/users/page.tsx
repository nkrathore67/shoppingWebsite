"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function AdminUsersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: async () => {
      const { data } = await api.get("/admin/users");
      return data;
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Users</h1>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Orders</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 4 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                    ))}
                  </tr>
                ))
              : data?.users.map((user: { id: string; name: string; email: string; role: string; createdAt: string; _count: { orders: number } }) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={user.role === "ADMIN" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-600"}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700">{user._count?.orders ?? 0}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {format(new Date(user.createdAt), "d MMM yyyy")}
                      </span>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
