import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from "lucide-react";
import { categories } from "@/data/products";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-dark text-primary-foreground">
      {/* Main Footer */}
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
                <span className="text-primary-foreground font-serif font-bold text-2xl">T</span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-2xl">Tessla</span>
                <span className="text-xs text-muted-foreground -mt-1">Equipment Stores</span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your trusted partner for premium barbershop, salon, and spa equipment. 
              Quality products for professionals who demand excellence.
            </p>
            <div className="flex gap-4">
              <a href="#" className="h-10 w-10 rounded-full bg-foreground/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-foreground/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-foreground/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif font-semibold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/shop" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/faq#returns" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Returns Policy
                </Link>
              </li>
              <li>
                <Link to="/faq#delivery" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Delivery Information
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-serif font-semibold text-lg mb-6">Categories</h3>
            <ul className="space-y-3">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link 
                    to={`/shop?category=${cat.id}`} 
                    className="text-sm text-muted-foreground hover:text-accent transition-colors flex items-center gap-2"
                  >
                    <span>{cat.icon}</span>
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-serif font-semibold text-lg mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-accent mt-0.5" />
                <span className="text-sm text-muted-foreground">
                  123 Kenyatta Avenue,<br />
                  Nairobi, Kenya
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-accent" />
                <a href="tel:+254742324193" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  +254 742 324 193
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-accent" />
                <a href="mailto:sales@tesslaequipment.com" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  sales@tesslaequipment.com
                </a>
              </li>
            </ul>
            
            {/* Payment Methods */}
            <div className="mt-8">
              <h4 className="text-sm font-medium mb-3">We Accept</h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-foreground/10 rounded text-xs font-medium">M-Pesa</span>
                <span className="px-3 py-1.5 bg-foreground/10 rounded text-xs font-medium">PayPal</span>
                <span className="px-3 py-1.5 bg-foreground/10 rounded text-xs font-medium">Bank Transfer</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-foreground/10">
        <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Tessla Equipment Stores. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/faq#privacy" className="text-xs text-muted-foreground hover:text-accent transition-colors">
              Privacy Policy
            </Link>
            <Link to="/faq#terms" className="text-xs text-muted-foreground hover:text-accent transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
