import Image from "next/image";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata = generatePageMetadata({
  title: "About Us",
  description: "Vyomtics is a technology-driven organization dedicated to advancing Robotics, IoT, AI, and Drone education across India.",
});

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero Section - Clean and Minimal */}
      <section className="border-b">
        <div className="container mx-auto px-6 py-16 md:py-24 max-w-5xl">
          <div className="text-center space-y-5">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-semibold text-gray-900 tracking-tight">
              About Vyomtics
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              A technology-driven organization dedicated to advancing Robotics, IoT, AI, and Drone education across India. We provide high-quality components, innovative solutions, and complete lab setup services for schools, colleges, universities, industries, and startups.
            </p>
          </div>
        </div>
      </section>

      {/* Founder Section - Elegant Layout */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">
            {/* Image */}
            <div className="lg:col-span-2">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
                <Image
                  src="/images/founder.jpg"
                  alt="Nishant Kishor Sharma - Founder & CEO"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="mt-6 text-center lg:text-left">
                <p className="font-semibold text-xl text-gray-900">Nishant Kishor Sharma</p>
                <p className="text-gray-600 mt-1">Founder & CEO</p>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3 space-y-8">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                  Founder's Vision
                </p>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-900 leading-tight mb-8">
                  Building the future of technology education in India
                </h2>
              </div>

              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed text-base md:text-lg">
                  "At Vyomtics, our vision is to make technology simple, accessible, and transformative for every learner and institution in India. We don't just deliver robotics, IoT, and drone solutions — we build possibilities."
                </p>
                <p className="text-gray-700 leading-relaxed text-base md:text-lg mt-6">
                  "Our mission is to empower the next generation with world-class tools, hands-on learning, and innovative thinking. With passion, precision, and purpose, Vyomtics is committed to shaping a future where every student becomes a creator and every idea becomes reality."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision - Side by Side */}
      <section className="py-20 md:py-32 bg-gray-50">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                Our Mission
              </h3>
              <p className="text-xl md:text-2xl lg:text-3xl font-medium text-gray-900 leading-relaxed">
                To empower India with advanced technology education by providing reliable products, innovative solutions, and world-class lab infrastructure.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                Founded By
              </h3>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                Founded by Nishant Kishor Sharma, Vyomtics aims to make modern technology accessible, practical, and impactful. With a strong focus on quality and hands-on learning, we empower institutions and learners to build real-world skills and embrace future technologies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do - Clean List */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
              What We Do
            </h2>
            <p className="text-lg text-gray-600">
              Comprehensive solutions for the next generation of innovators
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-x-12 gap-y-10">
            {[
              "Robotics, IoT & Drone Components",
              "Customized Drone & Automation Solutions",
              "Setup of Robotics, IoT, AI & Drone Labs",
              "Technical Training, Workshops & Skill Development",
              "End-to-end Educational Technology Support",
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-4 group">
                <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gray-900 mt-3" />
                <p className="text-lg text-gray-900 leading-relaxed group-hover:text-gray-600 transition-colors">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Vyomtics - Minimal Grid */}
      <section className="py-20 md:py-32 bg-gray-50">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
              Why Choose Vyomtics?
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-12">
            {[
              "High-quality and trusted components",
              "Expert technical support & consultation",
              "Fast and professional lab installation",
              "Industry-oriented training programs",
              "Trusted by institutions across India",
            ].map((item, index) => (
              <div key={index} className="group">
                <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center mb-4 text-sm font-medium group-hover:bg-gray-700 transition-colors">
                  {index + 1}
                </div>
                <p className="text-lg text-gray-900 leading-relaxed">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing Statement */}
      <section className="py-20 md:py-32 border-t">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <p className="text-2xl md:text-3xl font-medium text-gray-900 leading-relaxed">
            Vyomtics is committed to shaping the next generation of innovators through technology, creativity, and practical learning.
          </p>
        </div>
      </section>
    </div>
  );
}
