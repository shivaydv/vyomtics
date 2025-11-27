export const siteConfig = {
  // Basic Site Information
  title: "Vyomtics",
  name: "Vyomtics",
  description:
    "Vyomtics is your trusted Electronic drone solutions provider, offering cutting-edge technology and unparalleled service for all your aerial needs.",
  domain: "https://vyomtics.com",
  // Logo
  logo: {
    path: "/logo.jpeg",
    alt: "Vyomtics Logo",
  },

  // Contact Information
  contact: {
    email: "vyomtics@gmail.com",
    phone: "+91 1234567890",
    whatsapp: "911234567890", // Format: country code + number (no spaces or special characters)
    address: "agra, uttar pradesh, india",
  },

  // Social Media Links
  social: {
    facebook: "https://facebook.com",
    instagram: "https://www.instagram.com",
    twitter: "https://twitter.com",
    youtube: "https://youtube.com",
    linkedin: "https://linkedin.com",
  },

  // Admin Panel
  admin: {
    title: "Vyomtics",
    subtitle: "Admin Panel",
  },
} as const;

export type SiteConfig = typeof siteConfig;
