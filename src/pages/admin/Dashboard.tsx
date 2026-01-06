import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, Users, TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Stats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
}

type StatusSlice = { name: string; value: number };

type DailyMetric = {
  day: string;
  orders: number;
  revenue: number;
};

const STATUS_COLORS: Record<string, string> = {
  pending: "hsl(var(--muted-foreground))",
  paid: "hsl(var(--primary))",
  dispatched: "hsl(var(--accent))",
  delivered: "hsl(var(--success))",
  cancelled: "hsl(var(--destructive))",
};

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetric[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<StatusSlice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        supabase.from("products").select("id", { count: "exact" }),
        supabase
          .from("orders")
          .select("id, status, total_amount, created_at, customer_name")
          .order("created_at", { ascending: false }),
      ]);

      const orders = ordersRes.data || [];
      const pendingOrders = orders.filter((o) => o.status === "pending").length;
      const totalRevenue = orders
        .filter((o) => o.status === "paid" || o.status === "delivered")
        .reduce((sum, o) => sum + Number(o.total_amount), 0);

      setStats({
        totalProducts: productsRes.count || 0,
        totalOrders: orders.length,
        pendingOrders,
        totalRevenue,
      });

      setRecentOrders(orders.slice(0, 5));

      // Simple analytics (last 14 days)
      const now = new Date();
      const start = new Date(now);
      start.setDate(start.getDate() - 13);
      start.setHours(0, 0, 0, 0);

      const buckets = new Map<string, DailyMetric>();
      for (let i = 0; i < 14; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const key = d.toISOString().slice(0, 10);
        buckets.set(key, {
          day: d.toLocaleDateString("en-KE", { month: "short", day: "numeric" }),
          orders: 0,
          revenue: 0,
        });
      }

      for (const o of orders) {
        const key = new Date(o.created_at).toISOString().slice(0, 10);
        const bucket = buckets.get(key);
        if (!bucket) continue;
        bucket.orders += 1;
        if (o.status === "paid" || o.status === "delivered") {
          bucket.revenue += Number(o.total_amount);
        }
      }

      setDailyMetrics(Array.from(buckets.values()));

      const statusMap = new Map<string, number>();
      for (const o of orders) {
        statusMap.set(o.status, (statusMap.get(o.status) || 0) + 1);
      }
      setStatusBreakdown(
        Array.from(statusMap.entries()).map(([name, value]) => ({ name, value }))
      );
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error fetching stats:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-KE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <h1 className="text-2xl font-serif font-bold">Dashboard</h1>

      {/* Compact stat cards in a row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Products</p>
                <p className="text-2xl font-bold">{stats.totalProducts}</p>
              </div>
              <Package className="h-8 w-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Orders</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-500/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pendingOrders}</p>
              </div>
              <Users className="h-8 w-8 text-amber-500/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Revenue</p>
                <p className="text-lg font-bold">{formatPrice(stats.totalRevenue)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts - full width on mobile, side by side on desktop */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Line chart - takes 2/3 on xl screens */}
        <Card className="xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Orders Trend (14 Days)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyMetrics} margin={{ left: 0, right: 16, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} 
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, fill: "hsl(var(--primary))" }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                  name="Revenue (KSh)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie chart - takes 1/3 on xl screens */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex flex-col">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Pie
                    data={statusBreakdown}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="55%"
                    outerRadius="85%"
                    paddingAngle={2}
                  >
                    {statusBreakdown.map((s) => (
                      <Cell
                        key={s.name}
                        fill={STATUS_COLORS[s.name] || "hsl(var(--muted-foreground))"}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {statusBreakdown.map((s) => (
                <div key={s.name} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[s.name] || "hsl(var(--muted-foreground))" }}
                  />
                  <span className="text-xs capitalize text-muted-foreground">{s.name}</span>
                  <span className="text-xs font-medium">({s.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent orders - compact table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-muted-foreground text-center py-6 text-sm">No orders yet</p>
          ) : (
            <div className="divide-y divide-border">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
                      <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{order.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      order.status === "delivered" ? "bg-green-500/10 text-green-600" :
                      order.status === "pending" ? "bg-amber-500/10 text-amber-600" :
                      order.status === "paid" ? "bg-blue-500/10 text-blue-600" :
                      order.status === "dispatched" ? "bg-purple-500/10 text-purple-600" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {order.status}
                    </span>
                    <p className="font-semibold text-sm w-24 text-right">{formatPrice(order.total_amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
