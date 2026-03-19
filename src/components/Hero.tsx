"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

const heroImages = [
  "/images/hero/farmer1.png",
  "/images/hero/farmer2.png",
  "/images/hero/farmer3.png",
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 800);
  }, [isTransitioning]);

  useEffect(() => {
    const interval = setInterval(() => {
      goToSlide((currentSlide + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [currentSlide, goToSlide]);

  return (
    <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image Slider */}
      {heroImages.map((img, index) => (
        <div
          key={index}
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-opacity duration-[800ms] ease-in-out"
          style={{
            backgroundImage: `url('${img}')`,
            opacity: currentSlide === index ? 1 : 0,
          }}
        />
      ))}

      {/* Dark Overlay with gradient */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-500 ${
              currentSlide === index
                ? "w-8 bg-white"
                : "w-2 bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 py-2 rounded-full text-sm font-medium">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          AI-Powered Farming Assistant
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight drop-shadow-lg">
          Empowering the Hands that <br className="hidden md:block" /> Feed the Nation.
        </h1>
        <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl drop-shadow leading-relaxed">
          An AI-powered live farming assistant providing real-time pest detection,
          weather forecasts, mandi rates, and government schemes.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/schemes"
            className="group flex items-center justify-center gap-2 bg-[#2D5A27] hover:bg-[#1e3c1a] text-white px-8 py-4 rounded-full font-semibold text-lg transition-all transform hover:scale-105 shadow-lg shadow-green-900/30"
          >
            Get Started
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/news"
            className="group flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-white/30 hover:bg-white/20 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all"
          >
            Latest News
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
