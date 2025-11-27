"use client";

import { Package, MapPin, Heart, Loader2, ShoppingBag, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/lib/auth-client";
import { useWishlist } from "@/hooks/use-wishlist";
import { useEffect, useState } from "react";
import { getUserOrderStats } from "@/actions/store/order.actions";
import { formatPrice, formatDate } from "@/utils/format";
import { OrderStatus } from "@/prisma/generated/prisma";

const getStatusConfig = (status: OrderStatus) => {
  const configs = {
    PENDING: { color: "bg-yellow-50 text-yellow-700 border-yellow-200", label: "Pending" },
    PROCESSING: { color: "bg-blue-50 text-blue-700 border-blue-200", label: "Processing" },
    SHIPPED: { color: "bg-purple-50 text-purple-700 border-purple-200", label: "Shipped" },
    DELIVERED: { color: "bg-green-50 text-green-700 border-green-200", label: "Delivered" },
    CANCELLED: { color: "bg-red-50 text-red-700 border-red-200", label: "Cancelled" },
    FAILED: { color: "bg-red-50 text-red-700 border-red-200", label: "Failed" },
  };
  return configs[status] || configs.PENDING;
};

export function ModernAccountOverview() {
  const { data: session, isPending } = useSession();
  const { items: wishlistItems } = useWishlist();
  const [orderCount, setOrderCount] = useState(0);
  const [addressCount, setAddressCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const orderStatsRes = await getUserOrderStats();
        if (orderStatsRes.success && orderStatsRes.data) {
          setOrderCount(orderStatsRes.data.totalOrders);
          setRecentOrders(orderStatsRes.data.recentOrders);
        }

        const addressRes = await fetch("/api/account/addresses-count");
        if (addressRes.ok) {
          const data = await addressRes.json();
          setAddressCount(data.count || 0);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchStats();
    }
  }, [session]);

  if (isPending || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const userName = session?.user?.name || session?.user?.email?.split("@")[0] || "User";

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="relative overflow-hidden bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-purple-100/20 rounded-full blur-3xl -z-10" />
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900">
              Welcome back, <span className="text-primary">{userName}</span>!
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Manage your orders, addresses, and wishlist all in one place
            </p>
          </div>
          <Button asChild size="lg" className="rounded-lg px-6">
            <Link href="/products">
              <ShoppingBag className="h-5 w-5 mr-2" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/account/orders"
          className="group bg-white rounded-xl p-5 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-3xl font-bold text-gray-900">{orderCount}</p>
              <p className="text-sm text-gray-600 mt-0.5">Total Orders</p>
            </div>
          </div>
        </Link>

        <Link
          href="/account/addresses"
          className="group bg-white rounded-xl p-5 border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors">
              <MapPin className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-3xl font-bold text-gray-900">{addressCount}</p>
              <p className="text-sm text-gray-600 mt-0.5">Saved Addresses</p>
            </div>
          </div>
        </Link>

        <Link
          href="/account/wishlist"
          className="group bg-white rounded-xl p-5 border border-gray-200 hover:border-pink-300 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-pink-50 rounded-xl group-hover:bg-pink-100 transition-colors">
              <Heart className="h-6 w-6 text-pink-600" />
            </div>
            <div className="flex-1">
              <p className="text-3xl font-bold text-gray-900">{wishlistItems.length}</p>
              <p className="text-sm text-gray-600 mt-0.5">Wishlist Items</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-primary hover:text-primary hover:bg-primary/5"
          >
            <Link href="/account/orders">View All →</Link>
          </Button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-4">No orders yet</p>
            <Button asChild size="sm" className="rounded-lg">
              <Link href="/products">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status as OrderStatus);
              return (
                <Link
                  key={order.id}
                  href="/account/orders"
                  className="flex items-center justify-between p-4 border border-gray-100 hover:border-gray-200 hover:bg-gray-50 rounded-lg transition-all group"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="p-2.5 bg-gray-50 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                      <Package className="h-5 w-5 text-gray-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900">
                        Order #{order.orderNumber}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-base text-gray-900">
                        {formatPrice(order.total)}
                      </p>
                      <Badge className={`${statusConfig.color} border text-xs mt-1 font-medium`}>
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
          <h4 className="font-semibold mb-1.5 text-blue-900">Need Help?</h4>
          <p className="text-sm text-blue-700 mb-4">Contact our support team for assistance</p>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="border-blue-300 text-blue-700 hover:bg-blue-100 rounded-lg"
          >
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>

        <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
          <h4 className="font-semibold mb-1.5 text-purple-900">Explore More</h4>
          <p className="text-sm text-purple-700 mb-4">Discover new products and deals</p>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="border-purple-300 text-purple-700 hover:bg-purple-100 rounded-lg"
          >
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
