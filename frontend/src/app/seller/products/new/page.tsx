"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import type { Category } from "@/types";

interface VariantInput {
  size: string;
  color: string;
  stock: number;
  sku: string;
}

export default function SellerNewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    comparePrice: "",
    sku: "",
    gender: "MEN",
    categoryId: "",
    brand: "",
    material: "",
    images: [""],
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false,
  });
  const [variants, setVariants] = useState<VariantInput[]>([
    { size: "M", color: "Black", stock: 10, sku: "" },
  ]);
  const [uploading, setUploading] = useState<number | null>(null);

  const handleFileUpload = async (index: number, file: File) => {
    setUploading(index);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const imgs = [...form.images];
      imgs[index] = data.url;
      setForm({ ...form, images: imgs });
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploading(null);
    }
  };

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories", form.gender],
    queryFn: async () => {
      const { data } = await api.get(`/categories/${form.gender.toLowerCase()}`);
      return data.subCategories || [];
    },
    enabled: !!form.gender,
  });

  const { mutate: createProduct, isPending } = useMutation({
    mutationFn: (payload: typeof form & { variants: VariantInput[] }) =>
      api.post("/seller/products", {
        ...payload,
        price: parseFloat(payload.price),
        comparePrice: payload.comparePrice ? parseFloat(payload.comparePrice) : undefined,
        images: payload.images.filter((i) => i.trim()),
      }),
    onSuccess: () => {
      toast.success("Product added!");
      router.push("/seller/products");
    },
    onError: () => toast.error("Failed to add product"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProduct({ ...form, variants });
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/seller/products"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Basic Information</h2>

          <div className="space-y-1.5">
            <Label>Product Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <textarea
              className="w-full border rounded-md p-2 text-sm min-h-24 resize-y"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Price (₹)</Label>
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required min="0" step="1" />
            </div>
            <div className="space-y-1.5">
              <Label>Compare Price (₹)</Label>
              <Input type="number" value={form.comparePrice} onChange={(e) => setForm({ ...form, comparePrice: e.target.value })} min="0" step="1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>SKU</Label>
              <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label>Brand</Label>
              <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Gender</Label>
              <Select value={form.gender} onValueChange={(v) => v && setForm({ ...form, gender: v, categoryId: "" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEN">Men</SelectItem>
                  <SelectItem value="WOMEN">Women</SelectItem>
                  <SelectItem value="KIDS">Kids</SelectItem>
                  <SelectItem value="UNISEX">Unisex</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={form.categoryId} onValueChange={(v) => v && setForm({ ...form, categoryId: v })}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Material</Label>
            <Input value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} placeholder="e.g. Cotton, Polyester" />
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl border p-6 space-y-3">
          <h2 className="font-semibold text-gray-900">Images</h2>
          {form.images.map((img, i) => (
            <div key={i} className="space-y-2 pb-3 border-b last:border-b-0 last:pb-0">
              <div className="flex gap-2 items-center">
                {/* URL input */}
                <Input
                  value={img}
                  onChange={(e) => {
                    const imgs = [...form.images];
                    imgs[i] = e.target.value;
                    setForm({ ...form, images: imgs });
                  }}
                  placeholder="Paste image URL here"
                  className="flex-1"
                />
                {form.images.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
              {/* File upload */}
              <label className={`flex items-center gap-2 w-fit cursor-pointer px-3 py-1.5 rounded-md border border-dashed text-sm font-medium transition-colors ${uploading === i ? "text-gray-400 border-gray-200 cursor-not-allowed" : "text-emerald-700 border-emerald-300 hover:bg-emerald-50"}`}>
                {uploading === i ? (
                  <span className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin inline-block" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {uploading === i ? "Uploading..." : "Upload from device"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading !== null}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(i, file);
                    e.target.value = "";
                  }}
                />
              </label>
              {/* Preview */}
              {img && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img} alt="preview" className="h-20 w-16 object-cover rounded border" />
              )}
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => setForm({ ...form, images: [...form.images, ""] })}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Image
          </Button>
        </div>

        {/* Variants */}
        <div className="bg-white rounded-xl border p-6 space-y-3">
          <h2 className="font-semibold text-gray-900">Variants (Size & Stock)</h2>
          {variants.map((v, i) => (
            <div key={i} className="grid grid-cols-4 gap-2">
              <Input placeholder="Size" value={v.size} onChange={(e) => { const vs = [...variants]; vs[i].size = e.target.value; setVariants(vs); }} />
              <Input placeholder="Color" value={v.color} onChange={(e) => { const vs = [...variants]; vs[i].color = e.target.value; setVariants(vs); }} />
              <Input type="number" placeholder="Stock" value={v.stock} onChange={(e) => { const vs = [...variants]; vs[i].stock = parseInt(e.target.value); setVariants(vs); }} />
              <Input placeholder="SKU" value={v.sku} onChange={(e) => { const vs = [...variants]; vs[i].sku = e.target.value; setVariants(vs); }} />
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => setVariants([...variants, { size: "", color: "", stock: 0, sku: "" }])}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Variant
          </Button>
        </div>

        {/* Flags */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-gray-900 mb-3">Product Tags</h2>
          <div className="flex gap-6">
            {(["isFeatured", "isNewArrival", "isBestSeller"] as const).map((flag) => (
              <div key={flag} className="flex items-center gap-2">
                <Checkbox
                  id={flag}
                  checked={form[flag]}
                  onCheckedChange={(checked) => setForm({ ...form, [flag]: !!checked })}
                />
                <Label htmlFor={flag} className="capitalize">{flag.replace(/([A-Z])/g, " $1").trim()}</Label>
              </div>
            ))}
          </div>
        </div>

        <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 h-12" disabled={isPending}>
          {isPending ? "Adding..." : "Add Product"}
        </Button>
      </form>
    </div>
  );
}
