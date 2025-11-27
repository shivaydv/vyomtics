import { getAddresses } from "@/actions/store/address.actions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CheckoutClient } from "./checkout-client";

export default async function CheckoutPage() {
  // Get session on server
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Fetch saved addresses on server
  const savedAddressesResult = await getAddresses();
  const savedAddresses =
    savedAddressesResult.success && savedAddressesResult.data ? savedAddressesResult.data : [];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto">
        <CheckoutClient userEmail={session?.user?.email} savedAddresses={savedAddresses} />
      </div>
    </div>
  );
}
