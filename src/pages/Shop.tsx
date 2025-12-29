import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Filter, SlidersHorizontal, Grid, List, Search, X } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartSidebar from "@/components/layout/CartSidebar";
import ProductCard from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { products, categories, brands, searchProducts } from "@/data/products";

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  const categoryFilter = searchParams.get("category") || "";
  const brandFilter = searchParams.get("brand") || "";
  const searchQuery = searchParams.get("search") || "";
  const priceSort = searchParams.get("sort") || "";
  const filterType = searchParams.get("filter") || "";

  const [localSearch, setLocalSearch] = useState(searchQuery);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchQuery) {
      result = searchProducts(searchQuery);
    }

    // Category filter
    if (categoryFilter) {
      result = result.filter(p => p.category === categoryFilter);
    }

    // Brand filter
    if (brandFilter) {
      result = result.filter(p => p.brand === brandFilter);
    }

    // Special filters
    if (filterType === "bestseller") {
      result = result.filter(p => p.isBestSeller);
    } else if (filterType === "new") {
      result = result.filter(p => p.isNew);
    } else if (filterType === "sale") {
      result = result.filter(p => p.originalPrice);
    }

    // Sort
    if (priceSort === "low-high") {
      result.sort((a, b) => a.price - b.price);
    } else if (priceSort === "high-low") {
      result.sort((a, b) => b.price - a.price);
    } else if (priceSort === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [categoryFilter, brandFilter, searchQuery, priceSort, filterType]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch) {
      searchParams.set("search", localSearch);
    } else {
      searchParams.delete("search");
    }
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setSearchParams({});
    setLocalSearch("");
  };

  const updateFilter = (key: string, value: string) => {
    if (value) {
      searchParams.set(key, value);
    } else {
      searchParams.delete(key);
    }
    setSearchParams(searchParams);
  };

  const activeFiltersCount = [categoryFilter, brandFilter, filterType, searchQuery].filter(Boolean).length;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CartSidebar />

      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-gradient-hero py-12 border-b border-border">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
                Our Products
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Discover our complete range of professional salon, barbershop, and spa equipment.
              </p>
            </motion.div>
          </div>
        </section>

        <div className="container py-8">
          {/* Toolbar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full h-12 pl-12 pr-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Button type="submit" variant="default">Search</Button>
            </form>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <Button
                variant={isFilterOpen ? "default" : "outline"}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="relative"
              >
                <Filter className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>

              <select
                value={priceSort}
                onChange={(e) => updateFilter("sort", e.target.value)}
                className="h-10 px-4 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Sort by</option>
                <option value="low-high">Price: Low to High</option>
                <option value="high-low">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>

              <div className="hidden md:flex items-center gap-1 p-1 bg-secondary rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon-sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon-sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {isFilterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-8 p-6 bg-card rounded-2xl border border-border"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Filter Products</span>
                </div>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Categories */}
                <div>
                  <h3 className="font-medium text-sm mb-3">Category</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => updateFilter("category", "")}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        !categoryFilter ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => updateFilter("category", cat.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                          categoryFilter === cat.id ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                        }`}
                      >
                        <span>{cat.icon}</span>
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brands */}
                <div>
                  <h3 className="font-medium text-sm mb-3">Brand</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => updateFilter("brand", "")}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        !brandFilter ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                      }`}
                    >
                      All Brands
                    </button>
                    {brands.map((brand) => (
                      <button
                        key={brand}
                        onClick={() => updateFilter("brand", brand)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          brandFilter === brand ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                        }`}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Filters */}
                <div>
                  <h3 className="font-medium text-sm mb-3">Quick Filters</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => updateFilter("filter", "")}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        !filterType ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                      }`}
                    >
                      All Products
                    </button>
                    <button
                      onClick={() => updateFilter("filter", "bestseller")}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        filterType === "bestseller" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                      }`}
                    >
                      🔥 Best Sellers
                    </button>
                    <button
                      onClick={() => updateFilter("filter", "new")}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        filterType === "new" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                      }`}
                    >
                      ✨ New Arrivals
                    </button>
                    <button
                      onClick={() => updateFilter("filter", "sale")}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        filterType === "sale" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                      }`}
                    >
                      🏷️ On Sale
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Active Filters Tags */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {categoryFilter && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm">
                  {categories.find(c => c.id === categoryFilter)?.name}
                  <button onClick={() => updateFilter("category", "")}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {brandFilter && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm">
                  {brandFilter}
                  <button onClick={() => updateFilter("brand", "")}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm">
                  "{searchQuery}"
                  <button onClick={() => { updateFilter("search", ""); setLocalSearch(""); }}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Results Count */}
          <p className="text-muted-foreground text-sm mb-6">
            Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
          </p>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1"
            }`}>
              {filteredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
                <Search className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="font-serif text-2xl font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              <Button variant="hero" onClick={clearFilters}>
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;
