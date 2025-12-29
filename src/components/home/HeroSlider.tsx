import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFeaturedProducts } from "@/data/products";

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const featuredProducts = getFeaturedProducts().slice(0, 4);

  const heroSlides = [
    {
      title: "Premium Salon Equipment",
      subtitle: "Transform Your Space",
      description: "Discover our exclusive collection of professional-grade equipment for barbershops, salons, and spas.",
      image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=800&fit=crop",
      cta: { text: "Shop Now", link: "/shop" },
      accent: "Trusted by 500+ professionals"
    },
    {
      title: "Barber Chair Collection",
      subtitle: "Built for Excellence",
      description: "Heavy-duty hydraulic chairs with vintage aesthetics and modern functionality for the discerning barber.",
      image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&h=800&fit=crop",
      cta: { text: "View Collection", link: "/shop?category=barber-chairs" },
      accent: "Free delivery over KSh 50,000"
    },
    {
      title: "Spa & Wellness",
      subtitle: "Elevate the Experience",
      description: "Create the ultimate relaxation sanctuary with our premium massage tables, steamers, and spa accessories.",
      image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&h=800&fit=crop",
      cta: { text: "Explore Spa", link: "/shop?category=spa-equipment" },
      accent: "12-month warranty included"
    },
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, [heroSlides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section className="relative h-[85vh] min-h-[600px] max-h-[900px] overflow-hidden bg-secondary">
      {/* Slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={heroSlides[currentSlide].image}
              alt={heroSlides[currentSlide].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative container h-full flex items-center">
            <div className="max-w-2xl">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-block px-4 py-1.5 bg-accent/20 text-accent rounded-full text-sm font-medium mb-6 backdrop-blur-sm"
              >
                {heroSlides[currentSlide].accent}
              </motion.span>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-primary-foreground/80 text-lg mb-2 font-medium"
              >
                {heroSlides[currentSlide].subtitle}
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight"
              >
                {heroSlides[currentSlide].title}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-primary-foreground/70 text-lg md:text-xl mb-8 max-w-xl leading-relaxed"
              >
                {heroSlides[currentSlide].description}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap gap-4"
              >
                <Button variant="hero" size="xl" asChild>
                  <Link to={heroSlides[currentSlide].cta.link}>
                    {heroSlides[currentSlide].cta.text}
                  </Link>
                </Button>
                <Button variant="outline" size="xl" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                  <Link to="/contact">
                    Contact Us
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Slide Navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevSlide}
          className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        
        <div className="flex gap-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "w-8 bg-accent"
                  : "w-2 bg-primary-foreground/30 hover:bg-primary-foreground/50"
              }`}
            />
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={nextSlide}
          className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Vertical Text */}
      <div className="hidden lg:flex absolute left-8 top-1/2 -translate-y-1/2 items-center gap-4">
        <div className="w-px h-24 bg-primary-foreground/20" />
        <span className="text-sm text-primary-foreground/60 font-medium tracking-widest uppercase" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
          Quality Equipment
        </span>
      </div>
    </section>
  );
};

export default HeroSlider;
