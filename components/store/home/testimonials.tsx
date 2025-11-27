const testimonials = [
  {
    id: 1,
    content:
      "Vyomtics provides excellent-quality robotics, IoT, and drone components. Their products are reliable, affordable, and perfect for our projects. The team's technical support is outstanding.",
    author: "Prashant Kishor Sharma",
    role: "Research Associate, Taiwan",
  },
  {
    id: 2,
    content:
      "Vyomtics set up a high-quality robotics and IoT lab in our institute, and the results are amazing. The equipment quality, installation speed, and professionalism are truly impressive. Our students are learning better than ever.",
    author: "Principal",
    role: "The Shriram Millennium School - Best International School in Noida",
  },
  {
    id: 3,
    content:
      "The support from Vyomtics is unmatched. They understand requirements clearly and provide the best technical guidance. Quick response, fast delivery, and very trustworthy service.",
    author: "Harsh Bhardwaj",
    role: "Startup Founder",
  },
  {
    id: 4,
    content:
      "We ordered drone and IoT products in bulk from Vyomtics. The pricing was competitive, quality was top-notch, and every item was tested. Highly satisfied and looking forward to long-term collaboration.",
    author: "Skillship Edutech Pvt. Ltd.",
    role: "",
  },
  {
    id: 5,
    content:
      "Vyomtics, led by Nishant Kishor Sharma, is doing exceptional work in robotics, IoT, and drone technology. Their innovative approach and commitment to quality make them a trusted technology partner.",
    author: "Praphull Gautam",
    role: "Founder Drobonation",
  },
  {
    id: 6,
    content:
      "The training provided by Vyomtics was extremely effective. Trainers were highly skilled, and the sessions were completely practical and industry-focused. Excellent experience for our students.",
    author: "Sharda University",
    role: "Agra",
  },
];

export function Testimonials() {
  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="mb-12">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
            Testimonials
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
            What Our Clients Say
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl">
            Trusted by institutions, startups, and researchers worldwide.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="relative bg-white p-8 rounded-2xl border border-gray-200 hover:border-gray-300 transition-all duration-300 group"
            >
              {/* Quote Mark */}
              <div className="absolute -top-3 left-6 w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-serif">"</span>
              </div>

              <div className="pt-6">
                <p className="text-gray-700 mb-8 leading-relaxed text-base">
                  {testimonial.content}
                </p>

                <div className="pt-6 border-t border-gray-100">
                  <p className="font-semibold text-gray-900">{testimonial.author}</p>
                  {testimonial.role && (
                    <p className="text-sm text-gray-600 mt-1">{testimonial.role}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
