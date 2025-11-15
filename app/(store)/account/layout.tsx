import type React from "react";
import { AccountNav } from "@/components/store/account/account-nav";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen py-4 sm:py-8">
      <div className="custom-container">
        <div className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">My Account</h1>
        </div>

        <div className="grid lg:grid-cols-[240px_1fr] gap-6">
          <AccountNav />
          {/* Main Content */}
          <div>{children}</div>
        </div>
      </div>
    </main>
  );
}
