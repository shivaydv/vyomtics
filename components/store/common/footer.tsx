import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Youtube, Linkedin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/site.config";

export function Footer() {
  return (
    <footer className="bg-surface border-t border-border">
      <div className=" container py-10 mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-15 h-15 relative overflow-hidden rounded-lg">
                <Image
                  src={siteConfig.logo.path}
                  alt={siteConfig.logo.alt}
                  fill
                  sizes="60px"
                  className="object-contain"
                />
              </div>
              {/* <h3 className="text-lg font-semibold text-primary">{siteConfig.name}</h3> */}
            </div>
            <p className="text-sm text-foreground-muted mb-4">{siteConfig.description}</p>
            <div className="flex gap-3 flex-wrap">
              {siteConfig.social.facebook && (
                <Link
                  href={siteConfig.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                >
                  <Facebook className="h-4 w-4" />
                </Link>
              )}
              {siteConfig.social.instagram && (
                <Link
                  href={siteConfig.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                >
                  <Instagram className="h-4 w-4" />
                </Link>
              )}
              {siteConfig.social.twitter && (
                <Link
                  href={siteConfig.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                >
                  <Twitter className="h-4 w-4" />
                </Link>
              )}
              {siteConfig.social.youtube && (
                <Link
                  href={siteConfig.social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                >
                  <Youtube className="h-4 w-4" />
                </Link>
              )}
              {siteConfig.social.linkedin && (
                <Link
                  href={siteConfig.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                >
                  <Linkedin className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-foreground-muted hover:text-primary transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-foreground-muted hover:text-primary transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="text-sm text-foreground-muted hover:text-primary transition-colors"
                >
                  All Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/shipping"
                  className="text-sm text-foreground-muted hover:text-primary transition-colors"
                >
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/returns"
                  className="text-sm text-foreground-muted hover:text-primary transition-colors"
                >
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-and-conditions"
                  className="text-sm text-foreground-muted hover:text-primary transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-sm text-foreground-muted hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-foreground-muted">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{siteConfig.contact.address}</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-foreground-muted">
                <Phone className="h-4 w-4 shrink-0" />
                <a
                  href={`tel:${siteConfig.contact.phone}`}
                  className="hover:text-primary transition-colors"
                >
                  {siteConfig.contact.phone}
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-foreground-muted">
                <Mail className="h-4 w-4 shrink-0" />
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="hover:text-primary transition-colors"
                >
                  {siteConfig.contact.email}
                </a>
              </li>
            </ul>
          </div>
        </div>
        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-foreground-muted">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
