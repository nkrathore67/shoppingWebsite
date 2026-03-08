"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import type { Category, Product } from "@/types";

interface VariantInput {
  id?: string;
  size: string;
  color: string;
  stock: number;
  sku: string;
}

interface Props {
  params: Promise<{ id: string }>;
}

export default function SellerEditProductPage({ params }: Props) {
  const { id } = use(params);
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
  const [variants, setVariants] = useState<VariantInput[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [uploading, setUploading] = useState<number | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
      setForm((prev) => ({ ...prev, images: imgs }));
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploading(null);
    }
  };

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["seller-product", id],
    queryFn: async () => {
      const { data } = await api.get(`/products/${id}`);
      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (product && !loaded) {
      setForm({
        name: product.name,
        description: product.description,
        price: String(product.price),
        comparePrice: product.comparePrice ? String(product.comparePrice) : "",
        sku: product.sku,
        gender: product.gender,
        categoryId: product.category.id,
        brand: product.brand || "",
        material: product.material || "",
        images: product.images.length ? product.images : [""],
        isFeatured: product.isFeatured,
        isNewArrival: product.isNewArrival,
        isBestSeller: product.isBestSeller,
      });
      setVariants(
        product.variants.map((v) => ({
          id: v.id,
          size: v.size,
          color: v.color || "",
          stock: v.stock,
          sku: v.sku || "",
        }))
      );
      setLoaded(true);
    }
  }, [product, loaded]);

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories", form.gender],
    queryFn: async () => {
      const { data } = await api.get(`/categories/${form.gender.toLowerCase()}`);
      return data.subCategories || [];
    },
    enabled: !!form.gender,
  });

  const { mutate: updateProduct, isPending } = useMutation({
    mutationFn: (payload: typeof form & { variants: VariantInput[] }) =>
      api.patch(`/seller/products/${id}`, {
        ...payload,
        price: parseFloat(payload.price),
        comparePrice: payload.comparePrice ? parseFloat(payload.comparePrice) : undefined,
        images: payload.images.filter((i) => i.trim()),
      }),
    onSuccess: () => {
      toast.success("Product updated!");
      router.push("/seller/products");
    },
    onError: () => toast.error("Failed to update product"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProduct({ ...form, variants });
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/seller/products"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
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

          <div className="space-y-1.5">
            <Label>Material</Label>
            <Input value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} />
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
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl border p-6 space-y-3">
          <h2 className="font-semibold text-gray-900">Images</h2>
          {form.images.map((img, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex gap-2">
                <Input
                  value={img}
                  onChange={(e) => {
                    const imgs = [...form.images];
                    imgs[i] = e.target.value;
                    setForm({ ...form, images: imgs });
                  }}
                  placeholder="https://example.com/image.jpg or upload below"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  title="Upload from device"
                  disabled={uploading === i}
                  onClick={() => fileInputRefs.current[i]?.click()}
                >
                  {uploading === i ? (
                    <span className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </Button>
                {form.images.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={(el) => { fileInputRefs.current[i] = el; }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(i, file);
                    e.target.value = "";
                  }}
                />
              </div>
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
          <h2 className="font-semibold text-gray-900">Variants</h2>
          <div className="grid grid-cols-4 gap-2 text-xs font-medium text-gray-500 px-1">
            <span>Size</span><span>Color</span><span>Stock</span><span>SKU</span>
          </div>
          {variants.map((v, i) => (
            <div key={i} className="grid grid-cols-4 gap-2">
              <Input placeholder="Size" value={v.size} onChange={(e) => { const vs = [...variants]; vs[i] = { ...vs[i], size: e.target.value }; setVariants(vs); }} />
              <Input placeholder="Color" value={v.color} onChange={(e) => { const vs = [...variants]; vs[i] = { ...vs[i], color: e.target.value }; setVariants(vs); }} />
              <Input type="number" placeholder="Stock" value={v.stock} onChange={(e) => { const vs = [...variants]; vs[i] = { ...vs[i], stock: parseInt(e.target.value) || 0 }; setVariants(vs); }} />
              <div className="flex gap-1">
                <Input placeholder="SKU" value={v.sku} onChange={(e) => { const vs = [...variants]; vs[i] = { ...vs[i], sku: e.target.value }; setVariants(vs); }} />
                <Button type="button" variant="ghost" size="icon" className="flex-shrink-0" onClick={() => setVariants(variants.filter((_, j) => j !== i))}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
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
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}
