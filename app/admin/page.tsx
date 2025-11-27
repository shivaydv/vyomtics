import { Suspense } from "react";
import {
  getDashboardStats,
  getRevenueData,
  getCategoryDistribution,
  getTopProducts,
} from "@/actions/admin/dashboard.actions";
import { DashboardClient } from "@/components/admin/dashboard/dashboard-client";
import { AdminDashboardSkeleton } from "@/components/ui/loading-skeleton";

// Revalidate dashboard data every 5 minutes
export const revalidate = 300;

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const timeFilter = (filter as any) || "lifetime";

  return (
    <Suspense fallback={<AdminDashboardSkeleton />}>
      <DashboardDataWrapper filter={timeFilter} />
    </Suspense>
  );
}

async function DashboardDataWrapper({ filter }: { filter: string }) {
  // Fetch all data server-side
  const [statsResult, revenueResult, categoryResult, topProductsResult] = await Promise.all([
    getDashboardStats(filter as any),
    getRevenueData(),
    getCategoryDistribution(),
    getTopProducts(5),
  ]);

  const stats = statsResult.success && statsResult.data ? statsResult.data : null;
  const revenueData = revenueResult.success && revenueResult.data ? revenueResult.data : [];
  const categoryData = categoryResult.success && categoryResult.data ? categoryResult.data : [];
  const topProducts =
    topProductsResult.success && topProductsResult.data ? topProductsResult.data : [];

  return (
    <DashboardClient
      initialStats={stats}
      initialRevenue={revenueData}
      initialCategories={categoryData}
      initialTopProducts={topProducts}
      initialFilter={filter}
    />
  );
}
