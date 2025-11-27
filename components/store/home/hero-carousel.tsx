"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  cta: {
    text: string;
    href: string;
  };
}

const slides: Slide[] = [
  {
    id: 1,
    title: "Power Your Projects",
    subtitle: "with Raspberry Pi",
    description:
      "Experience next-level performance. Shop the latest boards, complete kits, and essential accessories.",
    image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=1200",
    cta: {
      text: "Shop Now",
      href: "/categories/development-boards",
    },
  },
  {
    id: 2,
    title: "Build Amazing Robots",
    subtitle: "STEM Kits for All Ages",
    description:
      "Comprehensive robotics kits with everything you need to start learning and building.",
    image: "https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?w=1200",
    cta: {
      text: "Explore Kits",
      href: "/categories/robotics-kits",
    },
  },
  {
    id: 3,
    title: "3D Printing Excellence",
    subtitle: "Professional Grade Printers",
    description:
      "High-speed, high-quality 3D printers and accessories for makers and professionals.",
    image: "https://images.unsplash.com/photo-1562043054-28a2e7d4f5e6?w=1200",
    cta: {
      text: "View Printers",
      href: "/categories/3d-printing",
    },
  },
];

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  return (
    <div className="relative w-full overflow-hidden bg-gray-50 border-b">
      <div className="relative h-[450px] md:h-[550px] lg:h-[650px]">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
          >
            <div className="h-full">
              <div className="container mx-auto px-6 h-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-full py-12">
                  {/* Content */}
                  <div className="space-y-8 text-center lg:text-left">
                    <div className="space-y-3">
                      <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 leading-tight">
                        {slide.title}
                      </h2>
                      <h3 className="text-2xl md:text-3xl lg:text-4xl font-medium text-gray-600">
                        {slide.subtitle}
                      </h3>
                    </div>

                    <p className="text-base md:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                      {slide.description}
                    </p>

                    <div>
                      <Button
                        asChild
                        size="lg"
                        className="bg-gray-900 hover:bg-gray-800 text-white px-8 h-12 text-base font-medium"
                      >
                        <Link href={slide.cta.href}>{slide.cta.text}</Link>
                      </Button>
                    </div>
                  </div>

                  {/* Image */}
                  <div className="relative h-64 lg:h-96">
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority={index === 0}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gray-50 p-2.5 rounded-full border border-gray-200 transition-all"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5 text-gray-900" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gray-50 p-2.5 rounded-full border border-gray-200 transition-all"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5 text-gray-900" />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-1.5 rounded-full transition-all ${index === currentSlide ? "w-8 bg-gray-900" : "w-1.5 bg-gray-400 hover:bg-gray-600"
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
