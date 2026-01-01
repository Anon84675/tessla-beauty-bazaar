import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartSidebar from "@/components/layout/CartSidebar";
import HeroSlider from "@/components/home/HeroSlider";
import TrustBadges from "@/components/home/TrustBadges";
import CategoryGrid from "@/components/home/CategoryGrid";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import Newsletter from "@/components/home/Newsletter";
import { useFeaturedProducts, useBestSellers, useNewArrivals } from "@/hooks/useProducts";

const Index = () => {
  const { products: featuredProducts, isLoading: featuredLoading } = useFeaturedProducts();
  const { products: bestSellers, isLoading: bestSellersLoading } = useBestSellers();
  const { products: newArrivals, isLoading: newArrivalsLoading } = useNewArrivals();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CartSidebar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSlider />

        {/* Trust Badges */}
        <TrustBadges />

        {/* Categories */}
        <CategoryGrid />

        {/* Featured Products */}
        {!featuredLoading && featuredProducts.length > 0 && (
          <FeaturedProducts
            title="Featured Products"
            subtitle="Editor's Choice"
            products={featuredProducts.slice(0, 4)}
            viewAllLink="/shop"
          />
        )}

        {/* Best Sellers */}
        {!bestSellersLoading && bestSellers.length > 0 && (
          <FeaturedProducts
            title="Best Sellers"
            subtitle="Most Popular"
            products={bestSellers.slice(0, 4)}
            viewAllLink="/shop?filter=bestseller"
          />
        )}

        {/* New Arrivals */}
        {!newArrivalsLoading && newArrivals.length > 0 && (
          <FeaturedProducts
            title="New Arrivals"
            subtitle="Just In"
            products={newArrivals.slice(0, 4)}
            viewAllLink="/shop?filter=new"
          />
        )}

        {/* Newsletter */}
        <Newsletter />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
