import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, ShoppingBag, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { useCart } from "@/contexts/CartContext";

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const { addItem } = useCart();

  const formatPrice = (price: number) => {
    return `KSh ${price.toLocaleString()}`;
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group relative bg-card rounded-2xl border border-border overflow-hidden shadow-soft hover:shadow-elegant transition-all duration-300"
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {product.isNew && (
          <span className="px-3 py-1 bg-accent text-accent-foreground text-xs font-bold rounded-full shadow-gold">
            NEW
          </span>
        )}
        {product.isBestSeller && (
          <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
            BESTSELLER
          </span>
        )}
        {discount > 0 && (
          <span className="px-3 py-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full">
            -{discount}%
          </span>
        )}
      </div>

      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full shadow-elegant"
            onClick={() => addItem(product)}
          >
            <ShoppingBag className="h-5 w-5" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full shadow-elegant"
            asChild
          >
            <Link to={`/product/${product.id}`}>
              <Eye className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Brand & Category */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-muted-foreground">{product.brand}</span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-primary capitalize">{product.category.replace("-", " ")}</span>
        </div>

        {/* Product Name */}
        <Link to={`/product/${product.id}`}>
          <h3 className="font-serif font-semibold text-lg mb-2 line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.round(product.rating)
                    ? "text-accent fill-accent"
                    : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            ({product.reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="font-serif text-xl font-bold text-primary">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="mt-3">
          {product.inStock ? (
            <span className="text-xs text-success font-medium">In Stock</span>
          ) : (
            <span className="text-xs text-destructive font-medium">Out of Stock</span>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button
          variant="cart"
          className="w-full mt-4"
          onClick={() => addItem(product)}
          disabled={!product.inStock}
        >
          <ShoppingBag className="h-4 w-4" />
          Add to Cart
        </Button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
