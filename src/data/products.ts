import { Product } from "@/types/product";

export const categories = [
  { id: "barber-chairs", name: "Barber Chairs", icon: "💈" },
  { id: "salon-chairs", name: "Salon Chairs", icon: "💇" },
  { id: "styling-stations", name: "Styling Stations", icon: "🪞" },
  { id: "shampoo-units", name: "Shampoo Units", icon: "🚿" },
  { id: "hair-dryers", name: "Hair Dryers & Steamers", icon: "💨" },
  { id: "spa-equipment", name: "Spa & Massage", icon: "🧖" },
  { id: "tools-accessories", name: "Tools & Accessories", icon: "✂️" },
  { id: "reception-furniture", name: "Reception & Waiting", icon: "🛋️" },
];

export const brands = [
  "Takara Belmont",
  "Collins Manufacturing",
  "Pibbs Industries",
  "Belvedere",
  "Kaemark",
  "Minerva Beauty",
  "Keller International",
  "AGS Beauty",
];

export const products: Product[] = [
  {
    id: "1",
    name: "Emperor Hydraulic Barber Chair",
    description: "Premium vintage-style hydraulic barber chair with heavy-duty chrome base, recline function, and luxurious leather upholstery. Perfect for professional barbershops.",
    price: 85000,
    originalPrice: 95000,
    currency: "KSh",
    images: [
      "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=600&fit=crop"
    ],
    category: "barber-chairs",
    brand: "Takara Belmont",
    inStock: true,
    stockQuantity: 12,
    rating: 4.9,
    reviewCount: 47,
    features: ["360° Rotation", "Hydraulic Lift", "Reclining Backrest", "Adjustable Headrest", "Chrome Footrest"],
    specifications: {
      "Seat Height": "46-58cm",
      "Weight Capacity": "180kg",
      "Material": "Premium PU Leather",
      "Base": "Heavy-duty Chrome"
    },
    isFeatured: true,
    isNew: false,
    isBestSeller: true
  },
  {
    id: "2",
    name: "Royal Styling Station Mirror",
    description: "Contemporary double-sided styling station with LED lighting, multiple outlets, and ample storage space for tools and products.",
    price: 65000,
    currency: "KSh",
    images: [
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=600&fit=crop"
    ],
    category: "styling-stations",
    brand: "Collins Manufacturing",
    inStock: true,
    stockQuantity: 8,
    rating: 4.7,
    reviewCount: 32,
    features: ["LED Mirror Lighting", "Built-in Outlets", "Tool Drawers", "Product Shelves", "Cable Management"],
    specifications: {
      "Width": "120cm",
      "Height": "200cm",
      "Mirror Size": "80x60cm"
    },
    isFeatured: true,
    isNew: true,
    isBestSeller: false
  },
  {
    id: "3",
    name: "Luxury Shampoo Backwash Unit",
    description: "Ergonomic shampoo unit with adjustable tilting bowl, comfortable reclining chair, and ceramic basin. Includes premium spray head.",
    price: 48000,
    originalPrice: 55000,
    currency: "KSh",
    images: [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=600&fit=crop"
    ],
    category: "shampoo-units",
    brand: "Pibbs Industries",
    inStock: true,
    stockQuantity: 15,
    rating: 4.8,
    reviewCount: 58,
    features: ["Tilting Ceramic Bowl", "Reclining Chair", "Gel Neck Rest", "Premium Spray Head", "Easy Plumbing"],
    specifications: {
      "Chair Width": "60cm",
      "Bowl Material": "Ceramic",
      "Weight Capacity": "150kg"
    },
    isFeatured: true,
    isNew: false,
    isBestSeller: true
  },
  {
    id: "4",
    name: "Professional Ionic Hair Dryer",
    description: "Salon-grade ionic hair dryer with multiple heat and speed settings, concentrator nozzle, and lightweight ergonomic design.",
    price: 12500,
    currency: "KSh",
    images: [
      "https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=600&h=600&fit=crop"
    ],
    category: "hair-dryers",
    brand: "AGS Beauty",
    inStock: true,
    stockQuantity: 45,
    rating: 4.6,
    reviewCount: 89,
    features: ["Ionic Technology", "2200W Power", "3 Heat Settings", "2 Speed Settings", "Cool Shot Button"],
    specifications: {
      "Wattage": "2200W",
      "Weight": "480g",
      "Cord Length": "3m"
    },
    isFeatured: false,
    isNew: true,
    isBestSeller: false
  },
  {
    id: "5",
    name: "Deluxe Massage Table",
    description: "Portable professional massage table with adjustable height, face cradle, and premium foam padding. Includes carrying bag.",
    price: 35000,
    currency: "KSh",
    images: [
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=600&fit=crop"
    ],
    category: "spa-equipment",
    brand: "Minerva Beauty",
    inStock: true,
    stockQuantity: 20,
    rating: 4.7,
    reviewCount: 42,
    features: ["Adjustable Height", "Memory Foam Padding", "Aluminum Frame", "Face Cradle", "Carrying Bag"],
    specifications: {
      "Length": "185cm",
      "Width": "70cm",
      "Weight Capacity": "250kg",
      "Weight": "14kg"
    },
    isFeatured: true,
    isNew: false,
    isBestSeller: false
  },
  {
    id: "6",
    name: "Premium Clippers Set",
    description: "Professional barber clipper set with multiple guard sizes, cordless operation, and precision blades for clean cuts.",
    price: 18500,
    originalPrice: 22000,
    currency: "KSh",
    images: [
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&h=600&fit=crop"
    ],
    category: "tools-accessories",
    brand: "Keller International",
    inStock: true,
    stockQuantity: 30,
    rating: 4.9,
    reviewCount: 156,
    features: ["Cordless Operation", "Lithium Battery", "8 Guard Sizes", "Precision Blades", "LED Indicator"],
    specifications: {
      "Battery Life": "4 hours",
      "Blade Material": "Stainless Steel",
      "Motor": "Rotary"
    },
    isFeatured: false,
    isNew: false,
    isBestSeller: true
  },
  {
    id: "7",
    name: "Elegant Salon Chair",
    description: "Modern hydraulic salon chair with 360° rotation, chrome star base, and comfortable high-density foam cushioning.",
    price: 42000,
    currency: "KSh",
    images: [
      "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=600&h=600&fit=crop"
    ],
    category: "salon-chairs",
    brand: "Belvedere",
    inStock: true,
    stockQuantity: 18,
    rating: 4.8,
    reviewCount: 67,
    features: ["360° Rotation", "Hydraulic Pump", "Chrome Base", "Armrests", "Footrest"],
    specifications: {
      "Seat Height": "45-55cm",
      "Weight Capacity": "150kg",
      "Material": "PU Leather"
    },
    isFeatured: true,
    isNew: true,
    isBestSeller: false
  },
  {
    id: "8",
    name: "Reception Sofa Set",
    description: "Stylish 3-seater reception sofa with matching side tables, perfect for salon waiting areas. Premium faux leather.",
    price: 78000,
    currency: "KSh",
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop"
    ],
    category: "reception-furniture",
    brand: "Kaemark",
    inStock: true,
    stockQuantity: 5,
    rating: 4.5,
    reviewCount: 23,
    features: ["3-Seater Design", "Side Tables Included", "Easy Clean Material", "Modern Design", "Chrome Legs"],
    specifications: {
      "Width": "180cm",
      "Depth": "80cm",
      "Height": "85cm",
      "Material": "Faux Leather"
    },
    isFeatured: false,
    isNew: false,
    isBestSeller: false
  },
  {
    id: "9",
    name: "Hooded Hair Dryer Stand",
    description: "Professional standing hooded dryer with adjustable height and timer. Even heat distribution for perfect styling results.",
    price: 28000,
    originalPrice: 32000,
    currency: "KSh",
    images: [
      "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&h=600&fit=crop"
    ],
    category: "hair-dryers",
    brand: "Pibbs Industries",
    inStock: true,
    stockQuantity: 10,
    rating: 4.6,
    reviewCount: 38,
    features: ["Adjustable Height", "60-Min Timer", "Rolling Base", "Even Heat", "Cool Setting"],
    specifications: {
      "Wattage": "1000W",
      "Timer": "0-60 minutes",
      "Height Range": "100-130cm"
    },
    isFeatured: false,
    isNew: false,
    isBestSeller: false
  },
  {
    id: "10",
    name: "Facial Steamer Pro",
    description: "Professional facial steamer with ozone function, adjustable arm, and large water tank for extended spa treatments.",
    price: 22000,
    currency: "KSh",
    images: [
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=600&fit=crop"
    ],
    category: "spa-equipment",
    brand: "AGS Beauty",
    inStock: true,
    stockQuantity: 25,
    rating: 4.7,
    reviewCount: 51,
    features: ["Ozone Function", "Adjustable Arm", "Large Tank", "Rolling Base", "Auto Shut-off"],
    specifications: {
      "Tank Capacity": "750ml",
      "Steam Time": "45 minutes",
      "Arm Reach": "50cm"
    },
    isFeatured: true,
    isNew: true,
    isBestSeller: false
  },
  {
    id: "11",
    name: "Barber Tool Organizer",
    description: "Wall-mounted tool organizer with slots for clippers, scissors, combs, and other barber essentials. Stainless steel construction.",
    price: 8500,
    currency: "KSh",
    images: [
      "https://images.unsplash.com/photo-1493256338651-d82f7acb2b38?w=600&h=600&fit=crop"
    ],
    category: "tools-accessories",
    brand: "Keller International",
    inStock: true,
    stockQuantity: 50,
    rating: 4.4,
    reviewCount: 29,
    features: ["Wall Mounted", "Stainless Steel", "Multiple Slots", "Easy Install", "Compact Design"],
    specifications: {
      "Width": "40cm",
      "Height": "30cm",
      "Material": "Stainless Steel"
    },
    isFeatured: false,
    isNew: false,
    isBestSeller: false
  },
  {
    id: "12",
    name: "Pedicure Spa Chair",
    description: "Luxurious pedicure spa chair with massage function, whirlpool footbath, and comfortable reclining seat. Perfect for nail salons.",
    price: 125000,
    originalPrice: 145000,
    currency: "KSh",
    images: [
      "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=600&h=600&fit=crop"
    ],
    category: "spa-equipment",
    brand: "Minerva Beauty",
    inStock: true,
    stockQuantity: 6,
    rating: 4.9,
    reviewCount: 34,
    features: ["Massage Function", "Whirlpool Footbath", "Reclining Seat", "Armrests", "LED Lighting"],
    specifications: {
      "Dimensions": "130x80x120cm",
      "Weight Capacity": "150kg",
      "Voltage": "220V"
    },
    isFeatured: true,
    isNew: false,
    isBestSeller: true
  }
];

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};

export const getProductsByCategory = (categoryId: string): Product[] => {
  return products.filter(product => product.category === categoryId);
};

export const getFeaturedProducts = (): Product[] => {
  return products.filter(product => product.isFeatured);
};

export const getBestSellers = (): Product[] => {
  return products.filter(product => product.isBestSeller);
};

export const getNewArrivals = (): Product[] => {
  return products.filter(product => product.isNew);
};

export const searchProducts = (query: string): Product[] => {
  const lowerQuery = query.toLowerCase();
  return products.filter(product => 
    product.name.toLowerCase().includes(lowerQuery) ||
    product.description.toLowerCase().includes(lowerQuery) ||
    product.brand.toLowerCase().includes(lowerQuery) ||
    product.category.toLowerCase().includes(lowerQuery)
  );
};
