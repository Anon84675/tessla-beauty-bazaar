import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// M-Pesa configuration from secrets
const MPESA_CONSUMER_KEY = Deno.env.get("MPESA_CONSUMER_KEY") || "";
const MPESA_CONSUMER_SECRET = Deno.env.get("MPESA_CONSUMER_SECRET") || "";
const MPESA_PASSKEY = Deno.env.get("MPESA_PASSKEY") || "";
const MPESA_SHORTCODE = Deno.env.get("MPESA_SHORTCODE") || "174379";
const MPESA_ENV = Deno.env.get("MPESA_ENV") || "sandbox";

const getBaseUrl = (): string => {
  return MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";
};

const getAccessToken = async (): Promise<string> => {
  console.log(`[STK-PUSH] Getting access token from ${MPESA_ENV} environment`);
  
  if (!MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET) {
    throw new Error("M-Pesa credentials not configured");
  }
  
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
    const errorText = await response.text();
    console.error("[STK-PUSH] Failed to get access token:", response.status, errorText);
    throw new Error(`Failed to get M-Pesa access token: ${response.status}`);
  }

  const data = await response.json();
  console.log("[STK-PUSH] Access token obtained successfully");
  return data.access_token;
};

const formatPhoneNumber = (phone: string): string => {
  // Remove any spaces, dashes, or plus signs
  let cleaned = phone.replace(/[\s\-\+\(\)]/g, "");
  
  // If starts with 0, replace with 254
  if (cleaned.startsWith("0")) {
    cleaned = "254" + cleaned.substring(1);
  }
  
  // If doesn't start with 254, add it
  if (!cleaned.startsWith("254")) {
    cleaned = "254" + cleaned;
  }
  
  console.log(`[STK-PUSH] Formatted phone: ${phone} -> ${cleaned}`);
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

  const requestId = crypto.randomUUID().slice(0, 8);
  console.log(`[STK-PUSH][${requestId}] New request received`);

  try {
    const body = await req.json();
    const { phone, amount, orderId, accountReference } = body;

    console.log(`[STK-PUSH][${requestId}] Request body:`, JSON.stringify({
      phone: phone ? `***${phone.slice(-4)}` : null,
      amount,
      orderId,
      accountReference,
    }));

    // Validate required fields
    if (!phone || !amount || !orderId) {
      console.error(`[STK-PUSH][${requestId}] Missing required fields`);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Missing required fields: phone, amount, orderId" 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate amount
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 1) {
      console.error(`[STK-PUSH][${requestId}] Invalid amount: ${amount}`);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Invalid amount. Must be at least 1 KES" 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get access token
    const accessToken = await getAccessToken();
    const timestamp = getTimestamp();
    const password = btoa(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`);
    const formattedPhone = formatPhoneNumber(phone);

    // Validate phone format
    if (formattedPhone.length !== 12 || !formattedPhone.startsWith("254")) {
      console.error(`[STK-PUSH][${requestId}] Invalid phone format: ${formattedPhone}`);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Invalid phone number format. Use format: 07XXXXXXXX or 254XXXXXXXXX" 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Callback URL
    const callbackUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/mpesa-callback`;
    console.log(`[STK-PUSH][${requestId}] Callback URL: ${callbackUrl}`);

    // Build STK push payload
    const stkPayload = {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(numAmount),
      PartyA: formattedPhone,
      PartyB: MPESA_SHORTCODE,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: accountReference || `ORDER-${orderId.slice(0, 8).toUpperCase()}`,
      TransactionDesc: `Payment for order ${orderId.slice(0, 8)}`,
    };

    console.log(`[STK-PUSH][${requestId}] Sending STK push request...`);
    console.log(`[STK-PUSH][${requestId}] Payload (sanitized):`, JSON.stringify({
      ...stkPayload,
      Password: "***",
      PhoneNumber: `***${formattedPhone.slice(-4)}`,
      PartyA: `***${formattedPhone.slice(-4)}`,
    }));

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
    console.log(`[STK-PUSH][${requestId}] M-Pesa response:`, JSON.stringify(stkResult));

    if (stkResult.ResponseCode === "0") {
      // STK push initiated successfully
      console.log(`[STK-PUSH][${requestId}] STK push initiated successfully`);
      
      // Update order with checkout request ID
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      const { error: updateError } = await supabase
        .from("orders")
        .update({
          payment_reference: stkResult.CheckoutRequestID,
          payment_method: "mpesa",
          notes: `M-Pesa STK push initiated. Waiting for payment confirmation.`,
        })
        .eq("id", orderId);

      if (updateError) {
        console.error(`[STK-PUSH][${requestId}] Failed to update order:`, updateError);
      } else {
        console.log(`[STK-PUSH][${requestId}] Order updated with CheckoutRequestID`);
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "STK push sent successfully. Please check your phone and enter your M-Pesa PIN.",
          checkoutRequestId: stkResult.CheckoutRequestID,
          merchantRequestId: stkResult.MerchantRequestID,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // STK push failed
      console.error(`[STK-PUSH][${requestId}] STK push failed:`, stkResult);
      
      let errorMessage = "Failed to initiate M-Pesa payment";
      
      // Handle common error codes
      if (stkResult.errorCode === "500.001.1001") {
        errorMessage = "Invalid credentials. Please contact support.";
      } else if (stkResult.errorCode === "404.001.04") {
        errorMessage = "Invalid phone number format";
      } else if (stkResult.errorMessage) {
        errorMessage = stkResult.errorMessage;
      } else if (stkResult.ResponseDescription) {
        errorMessage = stkResult.ResponseDescription;
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
          details: MPESA_ENV === "sandbox" ? stkResult : undefined,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error: unknown) {
    console.error(`[STK-PUSH][${requestId}] Error:`, error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ 
        success: false,
        error: message 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
