"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { useUpdateCartItem, useRemoveFromCart } from "@/queries/cart";
import type { CartItem as CartItemType } from "@/store/cartStore";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { mutate: updateItem, isPending: isUpdating } = useUpdateCartItem();
  const { mutate: removeItem, isPending: isRemoving } = useRemoveFromCart();

  return (
    <div className="flex gap-3">
      <Link href={`/products/${item.productId}`} className="flex-shrink-0">
        <Image
          src={item.product.images?.[0] || `https://picsum.photos/seed/${item.productId}/80/100`}
          alt={item.product.name}
          width={80}
          height={100}
          className="rounded-lg object-cover w-20 h-24"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-1">
        <Link
          href={`/products/${item.productId}`}
          className="text-sm font-medium text-gray-900 hover:text-purple-600 line-clamp-2"
        >
          {item.product.name}
        </Link>

        <div className="flex gap-1 flex-wrap">
          <Badge variant="secondary" className="text-xs">{item.variant.size}</Badge>
          {item.variant.color && (
            <Badge variant="secondary" className="text-xs">{item.variant.color}</Badge>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center border rounded-lg">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() =>
                item.quantity > 1
                  ? updateItem({ itemId: item.id, quantity: item.quantity - 1 })
                  : removeItem(item.id)
              }
              disabled={isUpdating || isRemoving}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-6 text-center text-sm">{item.quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => updateItem({ itemId: item.id, quantity: item.quantity + 1 })}
              disabled={isUpdating || isRemoving || item.quantity >= item.variant.stock}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">
              {formatPrice(item.product.price * item.quantity)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
              onClick={() => removeItem(item.id)}
              disabled={isRemoving}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
