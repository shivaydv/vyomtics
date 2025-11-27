"use client";

import React, { useState, useEffect } from "react";
import { Package, Eye, Loader2, Truck, CheckCircle2, Clock, XCircle, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/utils/format";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import Link from "next/link";
import { getUserOrders } from "@/actions/store/order.actions";
import { OrderStatus } from "@/prisma/generated/prisma";
import { toast } from "sonner";

const getStatusConfig = (status: OrderStatus) => {
  switch (status) {
    case "PENDING":
      return {
        color: "bg-yellow-50 text-yellow-700 border-yellow-200",
        icon: Clock,
        label: "Pending",
      };
    case "PROCESSING":
      return {
        color: "bg-blue-50 text-blue-700 border-blue-200",
        icon: Package,
        label: "Processing",
      };
    case "SHIPPED":
      return {
        color: "bg-purple-50 text-purple-700 border-purple-200",
        icon: Truck,
        label: "Shipped",
      };
    case "DELIVERED":
      return {
        color: "bg-green-50 text-green-700 border-green-200",
        icon: CheckCircle2,
        label: "Delivered",
      };
    case "CANCELLED":
      return {
        color: "bg-red-50 text-red-700 border-red-200",
        icon: XCircle,
        label: "Cancelled",
      };
    case "FAILED":
      return {
        color: "bg-red-50 text-red-700 border-red-200",
        icon: XCircle,
        label: "Failed",
      };
    default:
      return {
        color: "bg-gray-50 text-gray-700 border-gray-200",
        icon: Package,
        label: "Unknown",
      };
  }
};

export function ModernOrdersList() {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const result = await getUserOrders();
        if (result.success && result.data) {
          setOrders(result.data);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const copyTrackingId = (trackingId: string) => {
    navigator.clipboard.writeText(trackingId);
    toast.success("Tracking ID copied!");
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
            <Button asChild size="lg" className="rounded-full px-8">
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        </div>
      ) : (
        orders.map((order) => {
          const statusConfig = getStatusConfig(order.status as OrderStatus);
          const StatusIcon = statusConfig.icon;

          return (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">Order #{order.orderNumber}</h3>
                      <Badge
                        className={`${statusConfig.color} border rounded-full px-3 py-1 flex items-center gap-1.5`}
                      >
                        <StatusIcon className="h-3.5 w-3.5" />
                        {statusConfig.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">Placed on {formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-1">Order Total</p>
                    <p className="text-2xl font-bold text-primary">{formatPrice(order.total)}</p>
                  </div>
                </div>

                {/* Tracking Info */}
                {order.trackingId && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Truck className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">Tracking ID</p>
                          <p className="text-sm text-blue-700 font-mono">{order.trackingId}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyTrackingId(order.trackingId)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Items Preview */}
                <div className="space-y-3 mb-6">
                  {order.items.slice(0, 2).map((item: any) => {
                    const itemImage = item.product?.images?.[0] || "/placeholder.svg";
                    const itemName = item.name || item.product?.title || "Product";
                    const variantPrice = item.variantDetails?.price || 0;

                    return (
                      <div key={item.id} className="flex gap-4 items-center">
                        <div className="relative w-16 h-16 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={itemImage}
                            alt={itemName}
                            fill
                            className="object-contain p-2"
                            loading="lazy"
                            sizes="64px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{itemName}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-sm">
                          {formatPrice(variantPrice * item.quantity)}
                        </p>
                      </div>
                    );
                  })}
                  {order.items.length > 2 && (
                    <p className="text-sm text-gray-500 pl-20">
                      +{order.items.length - 2} more item(s)
                    </p>
                  )}
                </div>

                {/* Actions */}
                <Button
                  variant="outline"
                  className="w-full rounded-full"
                  onClick={() => {
                    setSelectedOrder(order);
                    setDialogOpen(true);
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Full Details
                </Button>
              </div>
            </div>
          );
        })
      )}

      {/* Order Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="text-2xl">Order Details</DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(90vh-120px)]">
            {selectedOrder && (
              <div className="p-6 space-y-6">
                {/* Order Info */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">
                      Order #{selectedOrder.orderNumber}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Placed on {formatDate(selectedOrder.createdAt)}
                    </p>
                  </div>
                  <Badge
                    className={`${
                      getStatusConfig(selectedOrder.status as OrderStatus).color
                    } border rounded-full px-3 py-1 flex items-center gap-1.5`}
                  >
                    {React.createElement(
                      getStatusConfig(selectedOrder.status as OrderStatus).icon,
                      { className: "h-3.5 w-3.5" }
                    )}
                    {getStatusConfig(selectedOrder.status as OrderStatus).label}
                  </Badge>
                </div>

                {/* Tracking Info */}
                {selectedOrder.trackingId && (
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Truck className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">Tracking ID</p>
                          <p className="text-sm text-blue-700 font-mono">
                            {selectedOrder.trackingId}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyTrackingId(selectedOrder.trackingId)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Items */}
                <div>
                  <h4 className="font-semibold mb-4">Order Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item: any) => {
                      const itemImage = item.product?.images?.[0] || "/placeholder.svg";
                      const itemName = item.name || item.product?.title || "Product";
                      const variantPrice = item.variantDetails?.price || 0;

                      return (
                        <div
                          key={item.id}
                          className="flex gap-4 p-4 bg-gray-50 rounded-lg items-center"
                        >
                          <div className="relative w-20 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={itemImage}
                              alt={itemName}
                              fill
                              className="object-contain p-2"
                              loading="lazy"
                              sizes="80px"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium mb-1">{itemName}</p>
                            <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                            <p className="text-sm text-gray-600 font-medium mt-1">
                              {formatPrice(variantPrice)} × {item.quantity}
                            </p>
                          </div>
                          <p className="font-bold text-lg">
                            {formatPrice(variantPrice * item.quantity)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h4 className="font-semibold mb-4">Shipping Address</h4>
                  <div className="p-4 bg-gray-50 rounded-lg space-y-1 text-sm">
                    <p className="font-medium text-base">
                      {selectedOrder.shippingAddress?.firstName}{" "}
                      {selectedOrder.shippingAddress?.lastName}
                    </p>
                    <p className="text-gray-600">
                      {selectedOrder.shippingAddress?.address}
                      {selectedOrder.shippingAddress?.apartment && (
                        <>, {selectedOrder.shippingAddress.apartment}</>
                      )}
                    </p>
                    <p className="text-gray-600">
                      {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}{" "}
                      {selectedOrder.shippingAddress?.pinCode}
                    </p>
                    <p className="text-gray-600">{selectedOrder.shippingAddress?.country}</p>
                    <p className="text-gray-600 font-medium pt-2">
                      Phone: {selectedOrder.shippingAddress?.phone}
                    </p>
                  </div>
                </div>

                {/* Order Summary */}
                <div>
                  <h4 className="font-semibold mb-4">Order Summary</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">{formatPrice(selectedOrder.subtotal)}</span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span className="font-medium">-{formatPrice(selectedOrder.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">
                        {selectedOrder.shippingFee === 0
                          ? "FREE"
                          : formatPrice(selectedOrder.shippingFee)}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-gray-200 flex justify-between">
                      <span className="font-semibold text-lg">Total</span>
                      <span className="font-bold text-xl text-primary">
                        {formatPrice(selectedOrder.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
