import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { toast } from "sonner";
import { z } from "zod";
import { ArrowLeft, Truck, Smartphone, Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useMpesaPayment, MpesaStatus } from "@/hooks/useMpesaPayment";

const checkoutSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().min(10, "Phone number must be at least 10 digits").max(15),
  address: z.string().trim().min(5, "Address is required").max(500),
  city: z.string().trim().min(2, "City is required").max(100),
  notes: z.string().max(500).optional(),
});

const Checkout = () => {
  const navigate = useNavigate();
  const { state, totalPrice, clearCart } = useCart();
  const { user, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"pay_on_delivery" | "mpesa">("mpesa");
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });

  // M-Pesa payment hook
  const mpesa = useMpesaPayment({
    onSuccess: () => {
      toast.success("Payment successful! Your order has been confirmed.");
      clearCart();
      navigate("/");
    },
    onError: (message) => {
      toast.error(message);
    },
  });

  // Calculate delivery cost - simple flat rate tiers
  const calculateDeliveryCost = () => {
    if (totalPrice >= 20000) {
      return 0;
    } else if (totalPrice >= 10000) {
      return 500;
    } else if (totalPrice >= 5000) {
      return 350;
    } else {
      return 250;
    }
  };

  const deliveryCost = calculateDeliveryCost();
  const orderTotal = totalPrice + deliveryCost;
  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (!isLoading && !user) {
      toast.error("Please sign in to checkout");
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (state.items.length === 0 && !isLoading && !mpesa.isProcessing && mpesa.status !== "success") {
      navigate("/shop");
    }
  }, [state.items, isLoading, navigate, mpesa.isProcessing, mpesa.status]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const createOrder = async () => {
    if (!user) return null;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        total_amount: orderTotal,
        delivery_fee: deliveryCost,
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        delivery_address: formData.address,
        delivery_city: formData.city,
        payment_method: paymentMethod,
        notes: formData.notes || null,
        status: "pending",
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = state.items.map(item => ({
      order_id: order.id,
      product_id: item.product.id,
      product_name: item.product.name,
      quantity: item.quantity,
      unit_price: item.product.price,
      total_price: item.product.price * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return order;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please sign in to complete your order");
      navigate("/auth");
      return;
    }

    try {
      checkoutSchema.parse(formData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Create order first
      const order = await createOrder();
      if (!order) {
        throw new Error("Failed to create order");
      }

      setCreatedOrderId(order.id);

      if (paymentMethod === "mpesa") {
        // Initiate M-Pesa STK push
        const success = await mpesa.initiateStkPush(formData.phone, orderTotal, order.id);
        if (!success) {
          // STK push failed, but order is created
          toast.error("Failed to initiate M-Pesa payment. Please try again or choose Pay on Delivery.");
        }
      } else {
        // Pay on delivery
        clearCart();
        toast.success("Order placed successfully! We'll contact you to confirm delivery.");
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetryPayment = async () => {
    if (!createdOrderId) return;
    
    mpesa.reset();
    const success = await mpesa.initiateStkPush(formData.phone, orderTotal, createdOrderId);
    if (!success) {
      toast.error("Failed to initiate M-Pesa payment");
    }
  };

  const handleCancelAndPayOnDelivery = async () => {
    if (!createdOrderId) return;

    try {
      await supabase
        .from("orders")
        .update({ payment_method: "pay_on_delivery", notes: "Customer switched to pay on delivery after M-Pesa attempt" })
        .eq("id", createdOrderId);
      
      clearCart();
      toast.success("Order confirmed with Pay on Delivery!");
      navigate("/");
    } catch (error) {
      toast.error("Failed to update order");
    }
  };

  // Get status icon and color
  const getStatusDisplay = (status: MpesaStatus) => {
    switch (status) {
      case "initiating":
        return { icon: <Loader2 className="w-6 h-6 animate-spin" />, color: "text-primary", bg: "bg-primary/10" };
      case "waiting_for_pin":
        return { icon: <Smartphone className="w-6 h-6 animate-pulse" />, color: "text-amber-600", bg: "bg-amber-50" };
      case "processing":
        return { icon: <Loader2 className="w-6 h-6 animate-spin" />, color: "text-primary", bg: "bg-primary/10" };
      case "success":
        return { icon: <CheckCircle2 className="w-6 h-6" />, color: "text-green-600", bg: "bg-green-50" };
      case "failed":
      case "cancelled":
      case "timeout":
      case "error":
        return { icon: <XCircle className="w-6 h-6" />, color: "text-red-600", bg: "bg-red-50" };
      default:
        return { icon: <AlertCircle className="w-6 h-6" />, color: "text-muted-foreground", bg: "bg-muted" };
    }
  };

  if (isLoading || (state.items.length === 0 && !mpesa.isProcessing && mpesa.status !== "success")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show M-Pesa payment status screen when processing
  if (mpesa.isProcessing || ["success", "failed", "cancelled", "timeout", "error"].includes(mpesa.status)) {
    const statusDisplay = getStatusDisplay(mpesa.status);
    const isTerminal = ["success", "failed", "cancelled", "timeout", "error"].includes(mpesa.status);
    const canRetry = ["failed", "cancelled", "timeout", "error"].includes(mpesa.status);

    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-8 pb-6">
              <div className="text-center space-y-6">
                {/* Status Icon */}
                <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center ${statusDisplay.bg}`}>
                  <div className={statusDisplay.color}>
                    {statusDisplay.icon}
                  </div>
                </div>

                {/* Status Title */}
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    {mpesa.status === "waiting_for_pin" && "Check Your Phone"}
                    {mpesa.status === "processing" && "Processing Payment"}
                    {mpesa.status === "initiating" && "Connecting to M-Pesa"}
                    {mpesa.status === "success" && "Payment Successful!"}
                    {mpesa.status === "failed" && "Payment Failed"}
                    {mpesa.status === "cancelled" && "Payment Cancelled"}
                    {mpesa.status === "timeout" && "Payment Timed Out"}
                    {mpesa.status === "error" && "Payment Error"}
                  </h2>
                  <p className="text-muted-foreground">{mpesa.message}</p>
                </div>

                {/* Amount */}
                <div className="py-4 border-y">
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-2xl font-bold">{formatPrice(orderTotal)}</p>
                </div>

                {/* Actions */}
                {canRetry && (
                  <div className="space-y-3">
                    <Button onClick={handleRetryPayment} className="w-full" size="lg">
                      <Smartphone className="w-4 h-4 mr-2" />
                      Try M-Pesa Again
                    </Button>
                    <Button 
                      onClick={handleCancelAndPayOnDelivery} 
                      variant="outline" 
                      className="w-full"
                    >
                      <Truck className="w-4 h-4 mr-2" />
                      Pay on Delivery Instead
                    </Button>
                  </div>
                )}

                {mpesa.status === "success" && (
                  <Button onClick={() => navigate("/")} className="w-full" size="lg">
                    Continue Shopping
                  </Button>
                )}

                {!isTerminal && (
                  <p className="text-xs text-muted-foreground">
                    Do not close this page. We're verifying your payment...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <h1 className="text-3xl font-serif font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (M-Pesa)</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="0712345678"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter your M-Pesa registered number for payment
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Delivery Address</Label>
                    <Textarea
                      id="address"
                      name="address"
                      placeholder="Street, Building, Floor/Apt"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      placeholder="Nairobi"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Order Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      placeholder="Special instructions for delivery"
                      value={formData.notes}
                      onChange={handleChange}
                    />
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-4">
                    <Label>Payment Method</Label>
                    <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
                      <div className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'mpesa' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                        <RadioGroupItem value="mpesa" id="mpesa" />
                        <Label htmlFor="mpesa" className="flex items-center gap-3 cursor-pointer flex-1">
                          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                            <Smartphone className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">M-Pesa</p>
                            <p className="text-xs text-muted-foreground">Pay instantly via STK push</p>
                          </div>
                        </Label>
                      </div>
                      <div className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'pay_on_delivery' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                        <RadioGroupItem value="pay_on_delivery" id="pay_on_delivery" />
                        <Label htmlFor="pay_on_delivery" className="flex items-center gap-3 cursor-pointer flex-1">
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                            <Truck className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">Pay on Delivery</p>
                            <p className="text-xs text-muted-foreground">Cash or M-Pesa on arrival</p>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button type="submit" className="w-full mt-6" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : paymentMethod === "mpesa" ? (
                      <>
                        <Smartphone className="w-4 h-4 mr-2" />
                        Pay with M-Pesa - {formatPrice(orderTotal)}
                      </>
                    ) : (
                      `Place Order - ${formatPrice(orderTotal)}`
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {state.items.map((item) => (
                  <div key={item.product.id} className="flex gap-4">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className={deliveryCost === 0 ? "text-green-600 font-medium" : ""}>
                      {deliveryCost === 0 ? "FREE" : formatPrice(deliveryCost)}
                    </span>
                  </div>
                  {deliveryCost > 0 && totalPrice < 20000 && (
                    <p className="text-xs text-muted-foreground">
                      Add {formatPrice(20000 - totalPrice)} more for free delivery!
                    </p>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(orderTotal)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
