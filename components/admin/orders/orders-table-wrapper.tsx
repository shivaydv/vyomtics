import { getOrders } from "@/actions/admin/order.actions";
import { OrdersTable } from "./orders-table";
import { OrdersTableFilters } from "./orders-table-filters";

interface OrdersTableWrapperProps {
  filters: {
    search?: string;
    status?: string;
    payment?: string;
    page?: string;
  };
}

export async function OrdersTableWrapper({ filters }: OrdersTableWrapperProps) {
  const result = await getOrders();
  const allOrders = result.success ? result.data : [];

  // Apply filters
  let filteredOrders = allOrders || [];

  // Search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filteredOrders = filteredOrders.filter(
      (order) =>
        order.orderNumber?.toLowerCase().includes(searchLower) ||
        order.user?.name?.toLowerCase().includes(searchLower) ||
        order.user?.email?.toLowerCase().includes(searchLower)
    );
  }

  // Status filter
  if (filters.status && filters.status !== "all") {
    filteredOrders = filteredOrders.filter((order) => order.status === filters.status);
  }

  // Payment status filter
  if (filters.payment && filters.payment !== "all") {
    filteredOrders = filteredOrders.filter((order) => order.paymentStatus === filters.payment);
  }

  // Pagination
  const page = parseInt(filters.page || "1");
  const pageSize = 10;
  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const paginatedOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-4">
      <OrdersTableFilters totalOrders={filteredOrders.length} />
      <OrdersTable orders={paginatedOrders} currentPage={page} totalPages={totalPages} />
    </div>
  );
}
