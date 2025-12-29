import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/products/ProductCard";
import { Product } from "@/types/product";

interface FeaturedProductsProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllLink?: string;
  viewAllText?: string;
}

const FeaturedProducts = ({
  title,
  subtitle,
  products,
  viewAllLink = "/shop",
  viewAllText = "View All Products",
}: FeaturedProductsProps) => {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12"
        >
          <div>
            {subtitle && (
              <span className="inline-block px-4 py-1.5 bg-accent/20 text-accent-dark rounded-full text-sm font-medium mb-4">
                {subtitle}
              </span>
            )}
            <h2 className="font-serif text-4xl md:text-5xl font-bold">{title}</h2>
          </div>
          <Button variant="ghost" className="mt-4 md:mt-0" asChild>
            <Link to={viewAllLink} className="flex items-center gap-2">
              {viewAllText}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
