import { getUsers } from "@/actions/admin/user.actions";
import { UsersTable } from "./users-table";
import { UsersTableFilters } from "./users-table-filters";

interface UsersTableWrapperProps {
  filters: {
    role?: string;
    search?: string;
    page?: string;
  };
}

export async function UsersTableWrapper({ filters }: UsersTableWrapperProps) {
  const result = await getUsers();
  const allUsers = result.success ? result.data : [];

  // Apply filters
  let filteredUsers = allUsers || [];

  // Role filter
  if (filters.role && filters.role !== "all") {
    filteredUsers = filteredUsers.filter((user) => user.role === filters.role);
  }

  // Search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filteredUsers = filteredUsers.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower)
    );
  }

  // Pagination
  const page = parseInt(filters.page || "1");
  const pageSize = 10;
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-4">
      <UsersTableFilters totalUsers={filteredUsers.length} />
      <UsersTable users={paginatedUsers} currentPage={page} totalPages={totalPages} />
    </div>
  );
}
