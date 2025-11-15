import { Suspense } from "react";
import { UsersTableWrapper } from "@/components/admin/customer/users-table-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { requireAdmin } from "@/lib/admin-auth";

interface AdminUsersPageProps {
  searchParams: Promise<{
    role?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  // Protect page - only admins can access
  // await requireAdmin();

  const params = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground mt-1">Manage customer accounts and roles</p>
      </div>

      <Suspense
        fallback={
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </CardContent>
          </Card>
        }
      >
        <UsersTableWrapper filters={params} />
      </Suspense>
    </div>
  );
}
