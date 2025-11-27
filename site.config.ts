export const siteConfig = {
  // Basic Site Information
  title: "Vyomtics",
  name: "Vyomtics",
  description:
    "Vyomtics is a technology-driven organization dedicated to advancing Robotics, IoT, AI, and Drone education across India. We provide high-quality components, innovative solutions, and complete lab setup services for schools, colleges, universities, industries, and startups.",
  domain: "https://vyomtics.com",
  // Logo
  logo: {
    path: "/logo.jpeg",
    alt: "Vyomtics Logo",
  },

  // Contact Information
  contact: {
    email: "sales@vyomtics.com",
    phone: "+91 9758367474",
    whatsapp: "919758367474", // Format: country code + number (no spaces or special characters)
    address: "Vyomtics\nDayalbagh, Agra\nUttar Pradesh, India",
  },

  // Social Media Links
  social: {
    facebook: "",
    instagram: "https://www.instagram.com/vyomtics",
    twitter: "",
    youtube: "",
    linkedin: "",
  },

  // Admin Panel
  admin: {
    title: "Vyomtics",
    subtitle: "Admin Panel",
  },
} as const;

export type SiteConfig = typeof siteConfig;
