import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Search, Truck, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type OrderStatus = "pending" | "paid" | "dispatched" | "delivered" | "cancelled" | "returned";

interface TrackedOrder {
  id: string;
  status: OrderStatus;
  customer_name: string;
  total_amount: number;
  created_at: string;
  delivery_city: string;
}

const statusSteps: { key: OrderStatus; label: string; icon: React.ReactNode }[] = [
  { key: "pending", label: "Order Placed", icon: <Clock className="h-4 w-4" /> },
  { key: "paid", label: "Payment Confirmed", icon: <CheckCircle2 className="h-4 w-4" /> },
  { key: "dispatched", label: "On The Way", icon: <Truck className="h-4 w-4" /> },
  { key: "delivered", label: "Delivered", icon: <Package className="h-4 w-4" /> },
];

const getStepIndex = (status: OrderStatus) => {
  if (status === "cancelled" || status === "returned") return -1;
  return statusSteps.findIndex((s) => s.key === status);
};

const OrderTracker = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [trackedOrder, setTrackedOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState("");
  const [showTracker, setShowTracker] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setError("");
    setTrackedOrder(null);

    try {
      // Search by order ID or phone number
      const { data, error: fetchError } = await supabase
        .from("orders")
        .select("id, status, customer_name, total_amount, created_at, delivery_city, customer_phone")
        .or(`id.eq.${searchQuery.trim()},customer_phone.ilike.%${searchQuery.trim()}%`)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (fetchError || !data) {
        setError("Order not found. Check your order ID or phone number.");
      } else {
        setTrackedOrder(data as TrackedOrder);
      }
    } catch {
      setError("Unable to find order. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const currentStep = trackedOrder ? getStepIndex(trackedOrder.status) : -1;
  const isCancelled = trackedOrder?.status === "cancelled" || trackedOrder?.status === "returned";

  return (
    <div className="border-t border-border">
      <button
        onClick={() => setShowTracker(!showTracker)}
        className="w-full p-4 flex items-center justify-between text-sm font-medium hover:bg-secondary/50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Search className="h-4 w-4 text-primary" />
          Track Your Order
        </span>
        <motion.span
          animate={{ rotate: showTracker ? 180 : 0 }}
          className="text-muted-foreground"
        >
          ▼
        </motion.span>
      </button>

      <AnimatePresence>
        {showTracker && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {/* Search input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Order ID or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1 h-9 text-sm"
                />
                <Button
                  size="sm"
                  onClick={handleSearch}
                  disabled={isSearching || !searchQuery.trim()}
                  className="px-3"
                >
                  {isSearching ? (
                    <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Error */}
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-destructive text-center"
                >
                  {error}
                </motion.p>
              )}

              {/* Order result */}
              {trackedOrder && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-secondary/50 rounded-xl p-4 space-y-4"
                >
                  {/* Order info */}
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-muted-foreground">Order for</p>
                      <p className="font-medium text-sm">{trackedOrder.customer_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="font-semibold text-sm text-primary">
                        KSh {trackedOrder.total_amount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Status timeline */}
                  {isCancelled ? (
                    <div className="flex items-center justify-center gap-2 py-4 text-destructive">
                      <XCircle className="h-5 w-5" />
                      <span className="font-medium capitalize">{trackedOrder.status}</span>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Progress bar */}
                      <div className="absolute top-4 left-4 right-4 h-0.5 bg-border">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(0, (currentStep / (statusSteps.length - 1)) * 100)}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          className="h-full bg-primary"
                        />
                      </div>

                      {/* Steps */}
                      <div className="flex justify-between relative">
                        {statusSteps.map((step, idx) => {
                          const isComplete = idx <= currentStep;
                          const isCurrent = idx === currentStep;

                          return (
                            <div key={step.key} className="flex flex-col items-center">
                              <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ 
                                  scale: isCurrent ? 1.1 : 1,
                                  backgroundColor: isComplete ? "hsl(var(--primary))" : "hsl(var(--muted))"
                                }}
                                className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                                  isComplete ? "text-primary-foreground" : "text-muted-foreground"
                                }`}
                              >
                                {step.icon}
                              </motion.div>
                              <span className={`text-[10px] mt-1 text-center max-w-[60px] ${
                                isComplete ? "text-foreground font-medium" : "text-muted-foreground"
                              }`}>
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Delivery info */}
                  <p className="text-xs text-muted-foreground text-center">
                    📍 Delivering to {trackedOrder.delivery_city}
                  </p>
                </motion.div>
              )}

              {/* Hint for logged in users */}
              {user && !trackedOrder && !error && (
                <p className="text-xs text-muted-foreground text-center">
                  Enter your phone number to find your orders
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderTracker;
