"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { Address } from "@/prisma/generated/prisma";

// Lazy load CheckoutForm (heavy component with Razorpay)
const CheckoutForm = dynamic(
  () =>
    import("@/components/store/checkout/checkout-form").then((mod) => ({
      default: mod.CheckoutForm,
    })),
  {
    loading: () => (
      <div className="space-y-6">
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    ),
    ssr: false,
  }
);

interface CheckoutClientProps {
  userEmail?: string;
  savedAddresses: Address[];
}

export function CheckoutClient({ userEmail, savedAddresses }: CheckoutClientProps) {
  return <CheckoutForm userEmail={userEmail} savedAddresses={savedAddresses} />;
}
