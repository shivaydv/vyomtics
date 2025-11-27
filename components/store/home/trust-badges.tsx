import { Shield, Truck, DollarSign, Package } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Trust & Reliability",
    description: "100% Genuine Products. Pan-India Delivery",
  },
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On all orders above Rs 499/-",
  },
  {
    icon: DollarSign,
    title: "Best Price Guarantee",
    description: "Got better prices? We try to match!",
  },
  {
    icon: Package,
    title: "Easy Returns",
    description: "7 Day Easy Returns & Replacement",
  },
];

export function TrustBadges() {
  return (
    <section className="py-12 md:py-16 bg-white border-y">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {features.map((feature) => (
            <div key={feature.title} className="flex flex-col items-center text-center">
              <feature.icon className="h-8 w-8 text-gray-900 mb-4" strokeWidth={1.5} />
              <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
