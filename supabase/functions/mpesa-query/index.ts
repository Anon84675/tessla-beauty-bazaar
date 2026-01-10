import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// M-Pesa configuration
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
    console.error("[QUERY] Failed to get access token:", response.status, errorText);
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

  const requestId = crypto.randomUUID().slice(0, 8);
  console.log(`[QUERY][${requestId}] New query request`);

  try {
    const { checkoutRequestId } = await req.json();

    if (!checkoutRequestId) {
      console.error(`[QUERY][${requestId}] Missing checkoutRequestId`);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Missing checkoutRequestId" 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[QUERY][${requestId}] Querying status for: ${checkoutRequestId}`);

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
    console.log(`[QUERY][${requestId}] M-Pesa response:`, JSON.stringify(result));

    // Interpret result codes
    let status = "pending";
    let message = "Transaction is being processed. Please wait...";

    // Check for successful response structure first
    if (result.ResponseCode === "0" && result.ResultCode !== undefined) {
      // We have a valid query response
      const resultCode = String(result.ResultCode);
      
      if (resultCode === "0") {
        status = "success";
        message = "Payment successful! Your order has been confirmed.";
      } else if (resultCode === "1032") {
        status = "cancelled";
        message = "Transaction cancelled by user";
      } else if (resultCode === "1037") {
        status = "timeout";
        message = "Transaction timed out. Please try again.";
      } else if (resultCode === "2001") {
        status = "failed";
        message = "Wrong PIN entered. Please try again.";
      } else if (resultCode === "1") {
        status = "failed";
        message = "Insufficient balance";
      } else {
        status = "failed";
        message = result.ResultDesc || "Payment failed. Please try again.";
      }
    } else if (result.ResponseCode === "0" && !result.ResultCode) {
      // Query successful but no result yet (still processing)
      status = "pending";
      message = "Waiting for your M-Pesa PIN...";
    } else if (result.errorCode === "500.001.1001") {
      // Invalid request - likely still processing
      status = "pending";
      message = "Processing your payment...";
    } else if (result.ResponseCode) {
      status = "error";
      message = result.ResponseDescription || "Error checking payment status";
    }

    console.log(`[QUERY][${requestId}] Final status: ${status}, message: ${message}`);

    return new Response(
      JSON.stringify({
        success: true,
        status,
        message,
        resultCode: result.ResultCode,
        resultDesc: result.ResultDesc,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error(`[QUERY][${requestId}] Error:`, error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ 
        success: false,
        error: message,
        status: "error"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
