import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import OrderTracker from "@/components/cart/OrderTracker";

const CartSidebar = () => {
  const { state, closeCart, removeItem, updateQuantity, totalPrice, totalItems } = useCart();

  const formatPrice = (price: number) => {
    return `KSh ${price.toLocaleString()}`;
  };

  return (
    <AnimatePresence>
      {state.isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-background shadow-lifted z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-6 w-6 text-primary" />
                <h2 className="font-serif text-xl font-semibold">Your Cart</h2>
                <span className="px-2 py-0.5 bg-accent text-accent-foreground text-xs font-bold rounded-full">
                  {totalItems}
                </span>
              </div>
              <Button variant="ghost" size="icon" onClick={closeCart}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {state.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center mb-6">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="font-serif text-lg font-medium mb-2">Your cart is empty</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Add some products to get started!
                  </p>
                  <Button variant="hero" onClick={closeCart} asChild>
                    <Link to="/shop">Browse Products</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {state.items.map((item) => (
                    <motion.div
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="flex gap-4 p-4 bg-card rounded-xl border border-border"
                    >
                      <div className="h-20 w-20 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm line-clamp-2 mb-1">
                          {item.product.name}
                        </h3>
                        <p className="text-primary font-semibold text-sm">
                          {formatPrice(item.product.price)}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon-sm"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-medium text-sm">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon-sm"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeItem(item.product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Order Tracker - always visible */}
            <OrderTracker />

            {/* Footer */}
            {state.items.length > 0 && (
              <div className="p-6 border-t border-border bg-secondary/30">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-serif text-xl font-bold">{formatPrice(totalPrice)}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  Shipping and taxes calculated at checkout
                </p>
                <div className="space-y-3">
                  <Button variant="hero" size="lg" className="w-full" asChild>
                    <Link to="/checkout" onClick={closeCart}>
                      Proceed to Checkout
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="w-full" asChild>
                    <Link to="/shop" onClick={closeCart}>
                      Continue Shopping
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;
