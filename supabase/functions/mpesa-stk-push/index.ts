import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Test credentials - replace with actual Daraja API credentials
const MPESA_CONSUMER_KEY = Deno.env.get("MPESA_CONSUMER_KEY") || "YOUR_CONSUMER_KEY";
const MPESA_CONSUMER_SECRET = Deno.env.get("MPESA_CONSUMER_SECRET") || "YOUR_CONSUMER_SECRET";
const MPESA_PASSKEY = Deno.env.get("MPESA_PASSKEY") || "YOUR_PASSKEY";
const MPESA_SHORTCODE = Deno.env.get("MPESA_SHORTCODE") || "174379"; // Test shortcode
const MPESA_ENV = Deno.env.get("MPESA_ENV") || "sandbox"; // sandbox or production

const getBaseUrl = () => {
  return MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";
};

const getAccessToken = async (): Promise<string> => {
  const auth = btoa(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`);
  
  const response = await fetch(
    `${getBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`,
    {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    }
  );

  if (!response.ok) {
    console.error("Failed to get access token:", await response.text());
    throw new Error("Failed to get M-Pesa access token");
  }

  const data = await response.json();
  return data.access_token;
};

const formatPhoneNumber = (phone: string): string => {
  // Remove any spaces, dashes, or plus signs
  let cleaned = phone.replace(/[\s\-\+]/g, "");
  
  // If starts with 0, replace with 254
  if (cleaned.startsWith("0")) {
    cleaned = "254" + cleaned.substring(1);
  }
  
  // If starts with +254, remove the +
  if (cleaned.startsWith("+254")) {
    cleaned = cleaned.substring(1);
  }
  
  return cleaned;
};

const getTimestamp = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, amount, orderId, accountReference } = await req.json();

    if (!phone || !amount || !orderId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: phone, amount, orderId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Initiating STK push for order ${orderId}, amount ${amount}, phone ${phone}`);

    const accessToken = await getAccessToken();
    const timestamp = getTimestamp();
    const password = btoa(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`);
    const formattedPhone = formatPhoneNumber(phone);

    // Callback URL - replace with your actual callback endpoint
    const callbackUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/mpesa-callback`;

    const stkPayload = {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: MPESA_SHORTCODE,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: accountReference || orderId.slice(0, 12),
      TransactionDesc: `Payment for order ${orderId.slice(0, 8)}`,
    };

    console.log("STK Push payload:", JSON.stringify(stkPayload));

    const stkResponse = await fetch(
      `${getBaseUrl()}/mpesa/stkpush/v1/processrequest`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(stkPayload),
      }
    );

    const stkResult = await stkResponse.json();
    console.log("STK Push response:", JSON.stringify(stkResult));

    if (stkResult.ResponseCode === "0") {
      // Store the checkout request ID for callback matching
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      // Update order with checkout request ID
      await supabase
        .from("orders")
        .update({
          payment_reference: stkResult.CheckoutRequestID,
          notes: `M-Pesa STK initiated. MerchantRequestID: ${stkResult.MerchantRequestID}`,
        })
        .eq("id", orderId);

      return new Response(
        JSON.stringify({
          success: true,
          message: "STK push sent successfully. Please check your phone.",
          checkoutRequestId: stkResult.CheckoutRequestID,
          merchantRequestId: stkResult.MerchantRequestID,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: stkResult.errorMessage || stkResult.ResponseDescription || "STK push failed",
          details: stkResult,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error: unknown) {
    console.error("Error in STK push:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
