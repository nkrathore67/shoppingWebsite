import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <div className="max-w-md mx-auto">
        <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Order Placed!</h1>
        <p className="text-gray-600 mb-2">
          Thank you for your purchase. Your order has been confirmed.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          You&apos;ll receive an email confirmation shortly.
        </p>

        <div className="flex flex-col gap-3">
          <Button asChild className="bg-purple-600 hover:bg-purple-700">
            <Link href="/account/orders">Track My Order</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
