import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, ShoppingBag, Phone, Mail, ChevronDown, User, LogOut, Settings, Sparkles, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { categories } from "@/data/products";
import Logo from "@/components/brand/Logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { openCart, totalItems } = useCart();
  const { user, isAdmin, isDriver, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop", hasDropdown: true },
    { name: "About Us", path: "/about" },
    { name: "Contact", path: "/contact" },
    { name: "FAQ", path: "/faq" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Top Bar - Hidden on mobile for cleaner look */}
      <div className="bg-gradient-dark text-primary-foreground hidden sm:block">
        <div className="container flex items-center justify-between py-2 text-sm">
          <div className="flex items-center gap-4 md:gap-6">
            <a href="mailto:esther.muthoni4@icloud.com" className="flex items-center gap-2 hover:text-accent transition-colors group">
              <Mail className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline">esther.muthoni4@icloud.com</span>
            </a>
            <a href="tel:+254742324193" className="flex items-center gap-2 hover:text-accent transition-colors group">
              <Phone className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline">+254 740 478 353</span>
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span className="text-xs font-medium hidden lg:inline">Free Delivery on Orders Over KSh 50k</span>
            <span className="text-xs font-medium lg:hidden">Free Delivery 50K+</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-background/95 backdrop-blur-md border-b border-border shadow-soft">
        <div className="container flex items-center justify-between py-3 lg:py-4">
          {/* Logo - Smaller on mobile */}
          <Link to="/" className="flex-shrink-0">
            <Logo size="sm" variant="default" showTagline={false} className="lg:hidden" />
            <Logo size="md" variant="default" showTagline={true} className="hidden lg:flex" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <div key={link.name} className="relative group">
                <Link
                  to={link.path}
                  className={`flex items-center gap-1 font-medium text-sm transition-colors hover:text-primary ${
                    isActive(link.path) ? "text-primary" : "text-foreground"
                  }`}
                >
                  {link.name}
                  {link.hasDropdown && <ChevronDown className="h-4 w-4" />}
                </Link>
                
                {/* Dropdown for Shop */}
                {link.hasDropdown && (
                  <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="bg-card rounded-xl shadow-elegant border border-border p-4 min-w-[240px]">
                      <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Categories</p>
                      <div className="space-y-1">
                        {categories.map((cat) => (
                          <Link
                            key={cat.id}
                            to={`/shop?category=${cat.id}`}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary transition-colors"
                          >
                            <span>{cat.icon}</span>
                            <span className="text-sm">{cat.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
            {/* Search - Hidden on small mobile, icon only on larger screens */}
            <AnimatePresence>
              {isSearchOpen ? (
                <motion.form
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 200, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  onSubmit={handleSearch}
                  className="relative overflow-hidden"
                >
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full h-10 pl-4 pr-10 rounded-full border border-border bg-secondary/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute right-1 top-1"
                    onClick={() => setIsSearchOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.form>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(true)}
                >
                  <Search className="h-5 w-5" />
                </Button>
              )}
            </AnimatePresence>

            {/* Cart Button */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={openCart}
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center shadow-gold"
                >
                  {totalItems}
                </motion.span>
              )}
            </Button>

            {/* User Account */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium truncate">{user.email}</p>
                    {isAdmin && (
                      <p className="text-xs text-muted-foreground">Admin</p>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
                        <Settings className="h-4 w-4" />
                        Admin Portal
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {isDriver && (
                    <DropdownMenuItem asChild>
                      <Link to="/driver" className="flex items-center gap-2 cursor-pointer">
                        <Truck className="h-4 w-4" />
                        Driver Portal
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="icon" className="sm:hidden" asChild>
                  <Link to="/auth"><User className="h-5 w-5" /></Link>
                </Button>
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t border-border overflow-hidden"
            >
              <nav className="container py-4 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                      isActive(link.path)
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-secondary"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="pt-4 border-t border-border">
                  <p className="px-4 text-xs font-medium text-muted-foreground mb-2 uppercase">Categories</p>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/shop?category=${cat.id}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-secondary rounded-lg transition-colors"
                    >
                      <span>{cat.icon}</span>
                      <span className="text-sm">{cat.name}</span>
                    </Link>
                  ))}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;
