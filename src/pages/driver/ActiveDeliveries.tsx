import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Package, MapPin, Phone, Truck, CheckCircle, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface DeliveryWithOrder {
  id: string;
  order_id: string;
  status: string;
  assigned_at: string;
  picked_up_at: string | null;
  order: {
    id: string;
    customer_name: string;
    customer_phone: string;
    delivery_address: string;
    delivery_city: string;
    total_amount: number;
    delivery_fee: number;
    currency: string;
    status: string;
  };
}

const statusSteps = [
  { key: "assigned", label: "Assigned", icon: Package },
  { key: "picked_up", label: "Picked Up", icon: Truck },
  { key: "in_transit", label: "In Transit", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

const ActiveDeliveries = () => {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<DeliveryWithOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchDeliveries = async () => {
    if (!user) return;
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("delivery_assignments")
        .select(`
          id,
          order_id,
          status,
          assigned_at,
          picked_up_at,
          order:orders(id, customer_name, customer_phone, delivery_address, delivery_city, total_amount, delivery_fee, currency, status)
        `)
        .eq("driver_id", user.id)
        .neq("status", "delivered")
        .order("assigned_at", { ascending: false });

      if (error) throw error;
      
      // Transform the data to handle the nested order object
      const transformedData = (data || []).map((d: any) => ({
        ...d,
        order: Array.isArray(d.order) ? d.order[0] : d.order
      })).filter((d: any) => d.order);
      
      setDeliveries(transformedData as DeliveryWithOrder[]);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
      toast.error("Failed to load deliveries");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, [user]);

  const updateStatus = async (deliveryId: string, orderId: string, newStatus: string, customerName: string, totalAmount: number) => {
    setUpdatingId(deliveryId);

    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === "picked_up") {
        updateData.picked_up_at = new Date().toISOString();
      } else if (newStatus === "delivered") {
        updateData.delivered_at = new Date().toISOString();
      }

      const { error: assignmentError } = await supabase
        .from("delivery_assignments")
        .update(updateData)
        .eq("id", deliveryId);

      if (assignmentError) throw assignmentError;

      // Update order status based on delivery status
      const orderStatus = newStatus === "delivered" ? "delivered" : "dispatched";

      await supabase
        .from("orders")
        .update({ status: orderStatus as "dispatched" | "delivered" })
        .eq("id", orderId);

      // Create admin notification when delivered
      if (newStatus === "delivered") {
        await supabase.from("admin_notifications").insert({
          type: "order_delivered",
          title: "Order Delivered",
          message: `Order for ${customerName} (KSh ${totalAmount.toLocaleString()}) has been successfully delivered.`,
          order_id: orderId,
        });
      }

      toast.success(`Status updated to "${newStatus.replace("_", " ")}"`);
      fetchDeliveries();
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const getNextStatus = (currentStatus: string): string | null => {
    const currentIndex = statusSteps.findIndex((s) => s.key === currentStatus);
    if (currentIndex < statusSteps.length - 1) {
      return statusSteps[currentIndex + 1].key;
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 pb-24 lg:pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold">Active Deliveries</h1>
          <p className="text-muted-foreground">Your current delivery jobs</p>
        </div>
        <Button variant="outline" onClick={fetchDeliveries}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {deliveries.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Truck className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold mb-2">No Active Deliveries</h3>
            <p className="text-muted-foreground text-sm">
              Accept a job from the Available Jobs page to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {deliveries.map((delivery) => {
            const nextStatus = getNextStatus(delivery.status);
            const currentStepIndex = statusSteps.findIndex((s) => s.key === delivery.status);

            return (
              <Card key={delivery.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold">
                        {delivery.order.customer_name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Assigned: {format(new Date(delivery.assigned_at), "MMM d, h:mm a")}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        Delivery Fee: {delivery.order.currency} {(delivery.order.delivery_fee || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Status Progress */}
                  <div className="flex items-center justify-between">
                    {statusSteps.map((step, index) => {
                      const StepIcon = step.icon;
                      const isCompleted = index <= currentStepIndex;
                      const isCurrent = index === currentStepIndex;

                      return (
                        <div key={step.key} className="flex flex-col items-center flex-1">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                              isCompleted
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-muted-foreground"
                            } ${isCurrent ? "ring-2 ring-primary ring-offset-2" : ""}`}
                          >
                            <StepIcon className="h-5 w-5" />
                          </div>
                          <span className={`text-xs mt-1 ${isCompleted ? "text-primary font-medium" : "text-muted-foreground"}`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Delivery Info */}
                  <div className="space-y-2 pt-2 border-t border-border">
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p>{delivery.order.delivery_address}</p>
                        <p className="text-muted-foreground">{delivery.order.delivery_city}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${delivery.order.customer_phone}`} className="text-primary hover:underline">
                        {delivery.order.customer_phone}
                      </a>
                    </div>
                  </div>

                  {/* Action Button */}
                  {nextStatus && (
                    <Button
                      className="w-full"
                      onClick={() => updateStatus(delivery.id, delivery.order.id, nextStatus, delivery.order.customer_name, delivery.order.total_amount)}
                      disabled={updatingId === delivery.id}
                    >
                      {updatingId === delivery.id
                        ? "Updating..."
                        : `Mark as ${statusSteps.find((s) => s.key === nextStatus)?.label}`}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActiveDeliveries;
