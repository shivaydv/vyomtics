"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, Package, MapPin, Heart, LogOut, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navigation = [
  { name: "Overview", href: "/account", icon: User },
  { name: "Orders", href: "/account/orders", icon: Package },
  { name: "Addresses", href: "/account/addresses", icon: MapPin },
  { name: "Wishlist", href: "/account/wishlist", icon: Heart },
];

export function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      toast.error("Failed to logout");
      console.error("Logout error:", error);
    }
  };

  const NavContent = () => (
    <>
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setSheetOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm",
              isActive ? "bg-primary text-white" : "text-foreground hover:bg-muted"
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="font-medium">{item.name}</span>
          </Link>
        );
      })}

      <button
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-destructive hover:bg-destructive/10 w-full mt-2 text-sm"
        onClick={() => {
          handleLogout();
          setSheetOpen(false);
        }}
      >
        <LogOut className="h-5 w-5" />
        <span className="font-medium">Logout</span>
      </button>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-4 bg-background">
          <div className="flex flex-col pt-6">
            <h2 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-3">
              Navigation
            </h2>
            <nav className="space-y-1">
              <NavContent />
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden lg:block">
        <nav className="bg-white rounded-lg border border-border p-3 sticky top-24">
          <NavContent />
        </nav>
      </aside>
    </>
  );
}
