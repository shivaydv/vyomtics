import { ContactForm } from "@/components/store/contact/contact-form";
import { generatePageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/site.config";

export const metadata = generatePageMetadata({
  title: "Contact Us",
  description: `Get in touch with ${siteConfig.name}. Have questions about our products or need support? Contact us via WhatsApp, email, or phone. We're here to help!`,
  path: "/contact",
  keywords: [
    "contact us",
    "customer support",
    "get in touch",
    "contact form",
    "customer service",
    "help",
    "support",
  ],
});

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Contact Us</h1>
          <p className="text-muted-foreground">
            Have a question or feedback? Fill out the form below and we'll get back to you via
            WhatsApp!
          </p>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
