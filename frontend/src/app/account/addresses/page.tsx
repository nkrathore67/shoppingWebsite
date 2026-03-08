"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Address } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, MapPin, X } from "lucide-react";

interface AddressFormData {
  label: string;
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

const EMPTY_FORM: AddressFormData = {
  label: "Home",
  firstName: "",
  lastName: "",
  street: "",
  city: "",
  state: "",
  zip: "",
  country: "India",
  phone: "",
  isDefault: false,
};

export default function AddressesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressFormData>(EMPTY_FORM);

  const { data: addresses, isLoading } = useQuery<Address[]>({
    queryKey: ["addresses"],
    queryFn: async () => {
      const { data } = await api.get("/users/me/addresses");
      return data;
    },
  });

  const { mutate: saveAddress, isPending: saving } = useMutation({
    mutationFn: (payload: AddressFormData) =>
      editId
        ? api.patch(`/users/me/addresses/${editId}`, payload)
        : api.post("/users/me/addresses", payload),
    onSuccess: () => {
      toast.success(editId ? "Address updated!" : "Address added!");
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      setShowForm(false);
      setEditId(null);
      setForm(EMPTY_FORM);
    },
    onError: () => toast.error("Failed to save address"),
  });

  const { mutate: deleteAddress } = useMutation({
    mutationFn: (id: string) => api.delete(`/users/me/addresses/${id}`),
    onSuccess: () => {
      toast.success("Address deleted");
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: () => toast.error("Failed to delete address"),
  });

  const handleEdit = (address: Address) => {
    setEditId(address.id);
    setForm({
      label: address.label,
      firstName: address.firstName,
      lastName: address.lastName,
      street: address.street,
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country,
      phone: address.phone || "",
      isDefault: address.isDefault,
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditId(null);
    setForm(EMPTY_FORM);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Addresses</h1>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-purple-600 hover:bg-purple-700"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Address
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">
              {editId ? "Edit Address" : "Add New Address"}
            </h2>
            <Button variant="ghost" size="icon" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveAddress(form);
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Label</Label>
                <Input
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  placeholder="Home, Work, etc."
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>First Name</Label>
                <Input
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Last Name</Label>
                <Input
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Street Address</Label>
              <Input
                value={form.street}
                onChange={(e) => setForm({ ...form, street: e.target.value })}
                placeholder="123 Main St, Apt 4B"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>City</Label>
                <Input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>State</Label>
                <Input
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>ZIP / Postal Code</Label>
                <Input
                  value={form.zip}
                  onChange={(e) => setForm({ ...form, zip: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Country</Label>
                <Input
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={form.isDefault}
                onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isDefault" className="cursor-pointer">
                Set as default address
              </Label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700"
                disabled={saving}
              >
                {saving ? "Saving..." : editId ? "Update Address" : "Add Address"}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Addresses list */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : !addresses?.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border">
          <MapPin className="h-16 w-16 text-gray-200 mb-4" />
          <p className="text-lg font-medium text-gray-700">No addresses saved</p>
          <p className="text-sm text-gray-500 mt-1">
            Add an address for faster checkout
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`bg-white rounded-xl border p-5 relative ${
                address.isDefault ? "ring-2 ring-purple-500" : ""
              }`}
            >
              {address.isDefault && (
                <span className="absolute top-4 right-4 text-xs font-medium bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                  Default
                </span>
              )}
              <p className="font-semibold text-gray-900 mb-1">{address.label}</p>
              <div className="text-sm text-gray-600 space-y-0.5">
                <p>
                  {address.firstName} {address.lastName}
                </p>
                <p>{address.street}</p>
                <p>
                  {address.city}, {address.state} {address.zip}
                </p>
                <p>{address.country}</p>
                {address.phone && <p>{address.phone}</p>}
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => handleEdit(address)}
                >
                  <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => deleteAddress(address.id)}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
