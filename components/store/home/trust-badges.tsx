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
    <section className="py-10 md:py-12 bg-white border-t">
      <div className="container mx-auto px-4 ">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center mb-3">
                <feature.icon className="h-8 w-8 text-white" strokeWidth={1.5} />
              </div>
              <h3 className="text-sm md:text-base font-bold text-gray-900 mb-1">{feature.title}</h3>
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
