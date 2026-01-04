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
const MPESA_SHORTCODE = Deno.env.get("MPESA_SHORTCODE") || "174379";
const MPESA_ENV = Deno.env.get("MPESA_ENV") || "sandbox";

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
    throw new Error("Failed to get M-Pesa access token");
  }

  const data = await response.json();
  return data.access_token;
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { checkoutRequestId } = await req.json();

    if (!checkoutRequestId) {
      return new Response(
        JSON.stringify({ error: "Missing checkoutRequestId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Querying status for checkoutRequestId: ${checkoutRequestId}`);

    const accessToken = await getAccessToken();
    const timestamp = getTimestamp();
    const password = btoa(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`);

    const queryPayload = {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    };

    const queryResponse = await fetch(
      `${getBaseUrl()}/mpesa/stkpushquery/v1/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(queryPayload),
      }
    );

    const result = await queryResponse.json();
    console.log("Query result:", JSON.stringify(result));

    // Interpret result codes
    let status = "pending";
    let message = "Transaction is being processed";

    if (result.ResultCode === "0") {
      status = "success";
      message = "Payment successful";
    } else if (result.ResultCode === "1032") {
      status = "cancelled";
      message = "Request cancelled by user";
    } else if (result.ResultCode === "1037") {
      status = "timeout";
      message = "Request timed out";
    } else if (result.ResultCode === "2001") {
      status = "failed";
      message = "Wrong PIN entered";
    } else if (result.ResultCode) {
      status = "failed";
      message = result.ResultDesc || "Payment failed";
    }

    return new Response(
      JSON.stringify({
        status,
        message,
        resultCode: result.ResultCode,
        resultDesc: result.ResultDesc,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error querying status:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
