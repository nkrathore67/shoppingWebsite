"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/lib/api";

export default function AccountPage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch("/users/me", { name });
      await update({ name });
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      <div className="bg-white rounded-xl border p-6 max-w-md">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={session?.user?.email || ""} disabled className="bg-gray-50" />
            <p className="text-xs text-gray-500">Email cannot be changed</p>
          </div>

          <Button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </div>
    </div>
  );
}
