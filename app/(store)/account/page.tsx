import { ModernAccountOverview } from "@/components/store/account/modern-account-overview";

// Account pages need fresh data on every request
export const dynamic = "force-dynamic";

export default function AccountPage() {
  return <ModernAccountOverview />;
}
