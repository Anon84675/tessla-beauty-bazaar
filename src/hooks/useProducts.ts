import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { Json } from "@/integrations/supabase/types";

const parseSpecifications = (specs: Json | null): Record<string, string> => {
  if (!specs || typeof specs !== "object" || Array.isArray(specs)) {
    return {};
  }
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(specs)) {
    if (typeof value === "string") {
      result[key] = value;
    }
  }
  return result;
};

const mapDbToProduct = (db: any): Product => ({
  id: db.id,
  name: db.name,
  description: db.description || "",
  price: db.price,
  originalPrice: db.original_price || undefined,
  currency: db.currency,
  images: db.images || [],
  category: db.category,
  brand: db.brand || "",
  inStock: db.in_stock ?? true,
  stockQuantity: db.stock_quantity ?? 0,
  rating: db.rating ?? 0,
  reviewCount: db.review_count ?? 0,
  features: db.features || [],
  specifications: parseSpecifications(db.specifications),
  isFeatured: db.is_featured ?? false,
  isNew: db.is_new ?? false,
  isBestSeller: db.is_best_seller ?? false,
});

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts((data || []).map(mapDbToProduct));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { products, isLoading, error, refetch: fetchProducts };
};

export const useFeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("is_featured", true)
        .limit(8);
      setProducts((data || []).map(mapDbToProduct));
      setIsLoading(false);
    };
    fetchFeatured();
  }, []);

  return { products, isLoading };
};

export const useBestSellers = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBestSellers = async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("is_best_seller", true)
        .limit(8);
      setProducts((data || []).map(mapDbToProduct));
      setIsLoading(false);
    };
    fetchBestSellers();
  }, []);

  return { products, isLoading };
};

export const useNewArrivals = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("is_new", true)
        .limit(8);
      setProducts((data || []).map(mapDbToProduct));
      setIsLoading(false);
    };
    fetchNewArrivals();
  }, []);

  return { products, isLoading };
};

export const useProductById = (id: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
      if (data) {
        setProduct(mapDbToProduct(data));
      }
      setIsLoading(false);
    };
    if (id) fetchProduct();
  }, [id]);

  return { product, isLoading };
};
