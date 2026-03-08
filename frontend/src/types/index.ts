export interface User {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
  phone?: string;
  avatarUrl?: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface Address {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  gender?: "MEN" | "WOMEN" | "KIDS" | "UNISEX";
  imageUrl?: string;
  description?: string;
  subCategories?: Category[];
}

export interface ProductVariant {
  id: string;
  size: string;
  color?: string;
  colorHex?: string;
  stock: number;
  sku?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  sku: string;
  gender: "MEN" | "WOMEN" | "KIDS" | "UNISEX";
  brand?: string;
  material?: string;
  tags: string[];
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  totalStock: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  category: Category;
  variants: ProductVariant[];
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  isVerified: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  total: number;
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
    brand?: string;
  };
  variant: {
    id: string;
    size: string;
    color?: string;
    colorHex?: string;
  };
}

export interface Order {
  id: string;
  status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";
  paymentStatus: "UNPAID" | "PAID" | "FAILED" | "REFUNDED";
  subtotal: number;
  discount: number;
  shippingCost: number;
  tax: number;
  total: number;
  couponCode?: string;
  trackingNumber?: string;
  createdAt: string;
  address: Address;
  items: OrderItem[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "rating" | "featured";
  gender?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string;
  colors?: string;
  brand?: string;
  rating?: number;
  isNew?: boolean;
  isBest?: boolean;
  isFeatured?: boolean;
  q?: string;
}
