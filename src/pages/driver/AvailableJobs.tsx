import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Package, MapPin, Phone, User, Calendar, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  delivery_city: string;
  total_amount: number;
  delivery_fee: number | null;
  currency: string;
  status: string;
  created_at: string;
}

const AvailableJobs = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const fetchAvailableOrders = async () => {
    setIsLoading(true);
    try {
      // Fetch orders that are "paid" but not yet assigned to a driver
      const { data: assignedOrderIds } = await supabase
        .from("delivery_assignments")
        .select("order_id");

      const assignedIds = (assignedOrderIds || []).map((a) => a.order_id);

      let query = supabase
        .from("orders")
        .select("*")
        .eq("status", "paid")
        .order("created_at", { ascending: false });

      if (assignedIds.length > 0) {
        query = query.not("id", "in", `(${assignedIds.join(",")})`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load available jobs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableOrders();
  }, []);

  const acceptJob = async (orderId: string) => {
    if (!user) return;
    setAcceptingId(orderId);

    try {
      const { error } = await supabase.from("delivery_assignments").insert({
        order_id: orderId,
        driver_id: user.id,
        status: "assigned",
      });

      if (error) throw error;

      // Update order status to dispatched
      await supabase
        .from("orders")
        .update({ status: "dispatched" })
        .eq("id", orderId);

      toast.success("Job accepted! Check your active deliveries.");
      fetchAvailableOrders();
    } catch (error: any) {
      console.error("Error accepting job:", error);
      toast.error(error.message || "Failed to accept job");
    } finally {
      setAcceptingId(null);
    }
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
          <h1 className="text-2xl font-serif font-bold">Available Jobs</h1>
          <p className="text-muted-foreground">Orders ready for pickup</p>
        </div>
        <Button variant="outline" onClick={fetchAvailableOrders}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold mb-2">No Available Jobs</h3>
            <p className="text-muted-foreground text-sm">
              Check back later for new delivery orders.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      {order.customer_name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(order.created_at), "MMM d, yyyy h:mm a")}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    Commision: {order.currency} {(order.delivery_fee || 0).toLocaleString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p>{order.delivery_address}</p>
                    <p className="text-muted-foreground">{order.delivery_city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${order.customer_phone}`} className="text-primary hover:underline">
                    {order.customer_phone}
                  </a>
                </div>
                <Button
                  className="w-full mt-4"
                  onClick={() => acceptJob(order.id)}
                  disabled={acceptingId === order.id}
                >
                  {acceptingId === order.id ? "Accepting..." : "Accept Job"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableJobs;
