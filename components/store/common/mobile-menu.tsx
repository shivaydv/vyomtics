"use client";

import Link from "next/link";
import { Menu, User, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AdminPanelLink } from "@/components/shared/admin-panel-link";
import { HeaderWishlistButton } from "./header-wishlist-button";

interface MobileMenuProps {
  navigationLinks: ReadonlyArray<{
    readonly label: string;
    readonly href: string;
  }>;
}

export function MobileMenu({ navigationLinks }: MobileMenuProps) {
  return (
    <Sheet>
      <SheetTrigger asChild className="lg:hidden">
        <Button variant="ghost" size="icon" className="">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] p-0 bg-background">
        <div className="flex flex-col h-full py-6">
          {/* User Actions */}
          <div className="flex flex-col px-4 pb-4 border-b">
            <h3 className="font-semibold text-xs text-muted-foreground uppercase mb-3 tracking-wider">
              Account
            </h3>
            <Button variant="ghost" className="justify-start gap-3 h-10 px-2" asChild>
              <Link href="/account">
                <User className="h-5 w-5" />
                <span>My Account</span>
              </Link>
            </Button>
            <HeaderWishlistButton isMobile />
            <div className="">
              <AdminPanelLink variant="full" />
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col px-4 pt-4">
            <h3 className="font-semibold text-xs text-muted-foreground uppercase mb-3 tracking-wider">
              Shop
            </h3>
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium hover:text-primary transition-colors py-2.5 px-2 rounded-md hover:bg-white/50"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
