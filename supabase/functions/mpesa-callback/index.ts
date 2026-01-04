import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("M-Pesa callback received:", JSON.stringify(body, null, 2));

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Extract callback data
    const stkCallback = body.Body?.stkCallback;
    
    if (!stkCallback) {
      console.error("Invalid callback structure");
      return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    } = stkCallback;

    console.log(`Callback for CheckoutRequestID: ${CheckoutRequestID}`);
    console.log(`ResultCode: ${ResultCode}, ResultDesc: ${ResultDesc}`);

    // Find the order by checkout request ID
    const { data: order, error: findError } = await supabase
      .from("orders")
      .select("id, customer_name, total_amount")
      .eq("payment_reference", CheckoutRequestID)
      .single();

    if (findError || !order) {
      console.error("Order not found for CheckoutRequestID:", CheckoutRequestID);
      return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (ResultCode === 0) {
      // Payment successful
      let mpesaReceiptNumber = "";
      let transactionDate = "";
      let phoneNumber = "";
      let amount = 0;

      // Extract metadata if available
      if (CallbackMetadata?.Item) {
        for (const item of CallbackMetadata.Item) {
          switch (item.Name) {
            case "MpesaReceiptNumber":
              mpesaReceiptNumber = item.Value;
              break;
            case "TransactionDate":
              transactionDate = item.Value?.toString() || "";
              break;
            case "PhoneNumber":
              phoneNumber = item.Value?.toString() || "";
              break;
            case "Amount":
              amount = item.Value || 0;
              break;
          }
        }
      }

      console.log(`Payment successful! Receipt: ${mpesaReceiptNumber}, Amount: ${amount}`);

      // Update order status to paid
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "paid",
          payment_reference: mpesaReceiptNumber || CheckoutRequestID,
          notes: `M-Pesa payment confirmed. Receipt: ${mpesaReceiptNumber}. Phone: ${phoneNumber}. Date: ${transactionDate}`,
        })
        .eq("id", order.id);

      if (updateError) {
        console.error("Failed to update order:", updateError);
      }

      // Create admin notification for new paid order
      await supabase.from("admin_notifications").insert({
        type: "new_order",
        title: "New Order Paid",
        message: `Order from ${order.customer_name} for KSh ${order.total_amount.toLocaleString()} has been paid via M-Pesa. Receipt: ${mpesaReceiptNumber}`,
        order_id: order.id,
      });

      console.log("Order updated successfully");
    } else {
      // Payment failed or cancelled
      console.log(`Payment failed/cancelled: ${ResultDesc}`);
      
      await supabase
        .from("orders")
        .update({
          notes: `M-Pesa payment failed: ${ResultDesc}`,
        })
        .eq("id", order.id);
    }

    // Always return success to M-Pesa
    return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing callback:", error);
    // Return success anyway to prevent M-Pesa retries
    return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
