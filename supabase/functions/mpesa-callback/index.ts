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

  const requestId = crypto.randomUUID().slice(0, 8);
  console.log(`[CALLBACK][${requestId}] M-Pesa callback received`);

  try {
    const body = await req.json();
    console.log(`[CALLBACK][${requestId}] Raw body:`, JSON.stringify(body, null, 2));

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Extract callback data
    const stkCallback = body.Body?.stkCallback;
    
    if (!stkCallback) {
      console.error(`[CALLBACK][${requestId}] Invalid callback structure - no stkCallback`);
      // Always return success to M-Pesa to prevent retries
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

    console.log(`[CALLBACK][${requestId}] CheckoutRequestID: ${CheckoutRequestID}`);
    console.log(`[CALLBACK][${requestId}] ResultCode: ${ResultCode}`);
    console.log(`[CALLBACK][${requestId}] ResultDesc: ${ResultDesc}`);

    // Find the order by checkout request ID
    const { data: order, error: findError } = await supabase
      .from("orders")
      .select("id, customer_name, total_amount, customer_phone")
      .eq("payment_reference", CheckoutRequestID)
      .single();

    if (findError || !order) {
      console.error(`[CALLBACK][${requestId}] Order not found for CheckoutRequestID: ${CheckoutRequestID}`);
      console.error(`[CALLBACK][${requestId}] Find error:`, findError);
      
      // Log for debugging but still return success to M-Pesa
      return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[CALLBACK][${requestId}] Found order: ${order.id}`);

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
              mpesaReceiptNumber = item.Value || "";
              break;
            case "TransactionDate":
              transactionDate = String(item.Value || "");
              break;
            case "PhoneNumber":
              phoneNumber = String(item.Value || "");
              break;
            case "Amount":
              amount = Number(item.Value) || 0;
              break;
          }
        }
      }

      console.log(`[CALLBACK][${requestId}] Payment SUCCESS!`);
      console.log(`[CALLBACK][${requestId}] Receipt: ${mpesaReceiptNumber}`);
      console.log(`[CALLBACK][${requestId}] Amount: ${amount}`);
      console.log(`[CALLBACK][${requestId}] Phone: ***${phoneNumber.slice(-4)}`);

      // Update order status to paid
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "paid",
          payment_reference: mpesaReceiptNumber || CheckoutRequestID,
          notes: `M-Pesa payment confirmed. Receipt: ${mpesaReceiptNumber}. Amount: KSh ${amount}. Date: ${transactionDate}`,
        })
        .eq("id", order.id);

      if (updateError) {
        console.error(`[CALLBACK][${requestId}] Failed to update order:`, updateError);
      } else {
        console.log(`[CALLBACK][${requestId}] Order ${order.id} marked as PAID`);
      }

      // Create admin notification for new paid order
      const { error: notifError } = await supabase.from("admin_notifications").insert({
        type: "new_order",
        title: "New Order Paid via M-Pesa",
        message: `Order from ${order.customer_name} for KSh ${order.total_amount.toLocaleString()} paid via M-Pesa. Receipt: ${mpesaReceiptNumber}`,
        order_id: order.id,
      });

      if (notifError) {
        console.error(`[CALLBACK][${requestId}] Failed to create notification:`, notifError);
      }

    } else {
      // Payment failed or cancelled
      console.log(`[CALLBACK][${requestId}] Payment FAILED/CANCELLED`);
      console.log(`[CALLBACK][${requestId}] ResultCode: ${ResultCode}, Desc: ${ResultDesc}`);
      
      // Update order notes with failure reason
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          notes: `M-Pesa payment failed: ${ResultDesc} (Code: ${ResultCode})`,
        })
        .eq("id", order.id);

      if (updateError) {
        console.error(`[CALLBACK][${requestId}] Failed to update order with failure:`, updateError);
      }
    }

    // Always return success to M-Pesa to prevent retries
    console.log(`[CALLBACK][${requestId}] Returning success to M-Pesa`);
    return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error(`[CALLBACK][${requestId}] Error processing callback:`, error);
    // Return success anyway to prevent M-Pesa retries
    return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
