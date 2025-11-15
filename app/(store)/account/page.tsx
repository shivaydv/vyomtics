import { AccountOverview } from "@/components/store/account/account-overview";

// Account pages need fresh data on every request
export const dynamic = "force-dynamic";

export default function AccountPage() {
  return <AccountOverview />;
}
