import { Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    content:
      "Vyomtics provides excellent-quality robotics, IoT, and drone components. Their products are reliable, affordable, and perfect for our projects. The team’s technical support is outstanding.",
    author: "Prashant Kishor Sharma",
    role: "Research Associate, Taiwan",
    highlight: false,
  },
  {
    id: 2,
    content:
      "Vyomtics set up a high-quality robotics and IoT lab in our institute, and the results are amazing. The equipment quality, installation speed, and professionalism are truly impressive. Our students are learning better than ever.",
    author: "Principal",
    role: "The Shriram Millennium School - Best International School in Noida",
    highlight: true,
  },
  {
    id: 3,
    content:
      "The support from Vyomtics is unmatched. They understand requirements clearly and provide the best technical guidance. Quick response, fast delivery, and very trustworthy service.",
    author: "Harsh Bhardwaj",
    role: "Startup Founder",
    highlight: false,
  },
  {
    id: 4,
    content:
      "We ordered drone and IoT products in bulk from Vyomtics. The pricing was competitive, quality was top-notch, and every item was tested. Highly satisfied and looking forward to long-term collaboration.",
    author: "Skillship Edutech Pvt. Ltd.",
    role: "",
    highlight: false,
  },
  {
    id: 5,
    content:
      "Vyomtics, led by Nishant Kishor Sharma, is doing exceptional work in robotics, IoT, and drone technology. Their innovative approach and commitment to quality make them a trusted technology partner.",
    author: "Praphull Gautam",
    role: "Founder Drobonation",
    highlight: false,
  },
  {
    id: 6,
    content:
      "The training provided by Vyomtics was extremely effective. Trainers were highly skilled, and the sessions were completely practical and industry-focused. Excellent experience for our students.",
    author: "Sharda University",
    role: "Agra",
    highlight: false,
  },
];

export function Testimonials() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Our Clients Say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Trusted by institutions, startups, and researchers worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${testimonial.highlight
                  ? "bg-primary/5 border-primary/20"
                  : "bg-card border-border"
                }`}
            >
              <div className="flex gap-1 mb-4 text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-foreground/90 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>
              <div className="mt-auto">
                <p className="font-semibold text-primary">{testimonial.author}</p>
                {testimonial.role && (
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
