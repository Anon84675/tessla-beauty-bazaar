import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle, MapPin, Calendar, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface CompletedDelivery {
  id: string;
  order_id: string;
  delivered_at: string;
  order: {
    customer_name: string;
    delivery_address: string;
    delivery_city: string;
    total_amount: number;
    currency: string;
  };
}

const CompletedDeliveries = () => {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<CompletedDelivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDeliveries = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("delivery_assignments")
        .select(`
          id,
          order_id,
          delivered_at,
          order:orders(customer_name, delivery_address, delivery_city, total_amount, currency)
        `)
        .eq("driver_id", user.id)
        .eq("status", "delivered")
        .order("delivered_at", { ascending: false });

      if (error) throw error;

      const transformedData = (data || []).map((d: any) => ({
        ...d,
        order: Array.isArray(d.order) ? d.order[0] : d.order
      })).filter((d: any) => d.order);

      setDeliveries(transformedData as CompletedDelivery[]);
    } catch (error) {
      console.error("Error fetching completed deliveries:", error);
      toast.error("Failed to load completed deliveries");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, [user]);

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
          <h1 className="text-2xl font-serif font-bold">Completed Deliveries</h1>
          <p className="text-muted-foreground">Your delivery history</p>
        </div>
        <Button variant="outline" onClick={fetchDeliveries}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {deliveries.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold mb-2">No Completed Deliveries</h3>
            <p className="text-muted-foreground text-sm">
              Your completed deliveries will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {deliveries.map((delivery) => (
            <Card key={delivery.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <h3 className="font-semibold">{delivery.order.customer_name}</h3>
                    </div>
                    <div className="mt-2 space-y-1 text-sm">
                      <div className="flex items-start gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 mt-0.5" />
                        <span>{delivery.order.delivery_address}, {delivery.order.delivery_city}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {delivery.delivered_at
                            ? format(new Date(delivery.delivered_at), "MMM d, yyyy 'at' h:mm a")
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    {delivery.order.currency} {delivery.order.total_amount.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompletedDeliveries;
