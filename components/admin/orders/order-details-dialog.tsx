"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/utils/format";
import { Package, MapPin, CreditCard, User } from "lucide-react";
import { getOrder } from "@/actions/admin/order.actions";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { OrderStatus } from "@/prisma/generated/prisma";
import Image from "next/image";

interface OrderDetailsDialogProps {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface OrderDetails {
  id: string;
  orderNumber: string;
  createdAt: Date;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  taxAmount: number;
  shippingFee: number;
  total: number;
  couponCode: string | null;
  shippingAddress: any;
  billingAddress: any;
  paymentMethod: string | null;
  paymentStatus: string;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  paymentCapturedAt: Date | null;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    image: string | null;
    variantDetails: any;
    product: {
      id: string;
      name: string;
      images: string[];
      slug: string;
    };
  }>;
}

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
    case "PROCESSING":
      return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
    case "SHIPPED":
      return "bg-purple-500/10 text-purple-700 dark:text-purple-400";
    case "DELIVERED":
      return "bg-green-500/10 text-green-700 dark:text-green-400";
    case "CANCELLED":
      return "bg-red-500/10 text-red-700 dark:text-red-400";
    default:
      return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
  }
};

export function OrderDetailsDialog({ orderId, open, onOpenChange }: OrderDetailsDialogProps) {
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (orderId && open) {
      setLoading(true);
      getOrder(orderId).then((result) => {
        if (result.success && result.data) {
          setOrder(result.data as OrderDetails);
        }
        setLoading(false);
      });
    }
  }, [orderId, open]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details - {order?.orderNumber || ""}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : order ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Order Date</p>
                <p className="font-medium">{formatDate(order.createdAt)}</p>
              </div>
              <Badge variant="secondary" className={getStatusColor(order.status)}>
                {order.status.toLowerCase()}
              </Badge>
            </div>

            <Separator />

            <div>
              <div className="flex items-center gap-2 mb-3">
                <User className="h-4 w-4" />
                <h3 className="font-semibold">Customer</h3>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="font-medium">{order.user.name}</p>
                <p className="text-sm text-muted-foreground">{order.user.email}</p>
              </div>
            </div>

            <Separator />

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Package className="h-4 w-4" />
                <h3 className="font-semibold">Order Items</h3>
              </div>
              <div className="space-y-3">
                {order.items.map((item) => {
                  const variantDetails = item.variantDetails as { price?: number };
                  const itemTotal = (variantDetails?.price || 0) * item.quantity;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      {item.image && (
                        <div className="relative w-12 h-12 rounded overflow-hidden shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">{formatCurrency(itemTotal)}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator />

            <div>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4" />
                <h3 className="font-semibold">Shipping Address</h3>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="font-medium">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {order.shippingAddress.address}
                  {order.shippingAddress.apartment && `, ${order.shippingAddress.apartment}`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.pinCode}
                </p>
                <p className="text-sm text-muted-foreground">{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Phone: {order.shippingAddress.phone}
                  </p>
                )}
                {order.shippingAddress.email && (
                  <p className="text-sm text-muted-foreground">
                    Email: {order.shippingAddress.email}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="h-4 w-4" />
                <h3 className="font-semibold">Payment Information</h3>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="font-medium capitalize">{order.paymentMethod || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Status</p>
                  <p className="capitalize font-medium">{order.paymentStatus.toLowerCase()}</p>
                </div>
                {order.razorpayOrderId && (
                  <div>
                    <p className="text-sm text-muted-foreground">Razorpay Order ID</p>
                    <p className="font-mono text-xs">{order.razorpayOrderId}</p>
                  </div>
                )}
                {order.razorpayPaymentId && (
                  <div>
                    <p className="text-sm text-muted-foreground">Razorpay Payment ID</p>
                    <p className="font-mono text-xs">{order.razorpayPaymentId}</p>
                  </div>
                )}
                {order.paymentCapturedAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Captured At</p>
                    <p className="text-sm">{formatDate(order.paymentCapturedAt)}</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex items-center justify-between text-sm text-green-600">
                  <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              {order.taxAmount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatCurrency(order.taxAmount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>{order.shippingFee === 0 ? "FREE" : formatCurrency(order.shippingFee)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">Order not found</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
