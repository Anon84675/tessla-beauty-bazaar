import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type MpesaStatus = 
  | "idle" 
  | "initiating" 
  | "waiting_for_pin" 
  | "processing" 
  | "success" 
  | "failed" 
  | "cancelled" 
  | "timeout"
  | "error";

interface UseMpesaPaymentOptions {
  onSuccess?: (receiptNumber: string) => void;
  onError?: (message: string) => void;
  pollInterval?: number;
  maxPollAttempts?: number;
}

interface UseMpesaPaymentReturn {
  status: MpesaStatus;
  message: string;
  isProcessing: boolean;
  initiateStkPush: (phone: string, amount: number, orderId: string) => Promise<boolean>;
  reset: () => void;
  checkoutRequestId: string | null;
}

export const useMpesaPayment = (options: UseMpesaPaymentOptions = {}): UseMpesaPaymentReturn => {
  const {
    onSuccess,
    onError,
    pollInterval = 5000, // 5 seconds between polls
    maxPollAttempts = 24, // 2 minutes total (24 * 5s)
  } = options;

  const [status, setStatus] = useState<MpesaStatus>("idle");
  const [message, setMessage] = useState("");
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  
  const pollCountRef = useRef(0);
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef(false);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
      isPollingRef.current = false;
    };
  }, []);

  const reset = useCallback(() => {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
    }
    isPollingRef.current = false;
    pollCountRef.current = 0;
    setStatus("idle");
    setMessage("");
    setCheckoutRequestId(null);
  }, []);

  const pollStatus = useCallback(async (requestId: string) => {
    if (!isPollingRef.current) return;

    pollCountRef.current += 1;
    console.log(`[M-Pesa] Polling attempt ${pollCountRef.current}/${maxPollAttempts}`);

    try {
      const { data, error } = await supabase.functions.invoke("mpesa-query", {
        body: { checkoutRequestId: requestId },
      });

      if (error) {
        console.error("[M-Pesa] Query error:", error);
        // Continue polling on query errors
        if (pollCountRef.current < maxPollAttempts && isPollingRef.current) {
          pollTimeoutRef.current = setTimeout(() => pollStatus(requestId), pollInterval);
        } else {
          setStatus("timeout");
          setMessage("Payment verification timed out. Please check your M-Pesa messages.");
          onError?.("Payment verification timed out");
        }
        return;
      }

      const { status: paymentStatus, message: paymentMessage } = data;
      console.log(`[M-Pesa] Poll result: ${paymentStatus} - ${paymentMessage}`);

      switch (paymentStatus) {
        case "success":
          isPollingRef.current = false;
          setStatus("success");
          setMessage(paymentMessage || "Payment successful!");
          onSuccess?.(requestId);
          break;

        case "cancelled":
          isPollingRef.current = false;
          setStatus("cancelled");
          setMessage(paymentMessage || "Payment was cancelled");
          onError?.("Payment cancelled by user");
          break;

        case "failed":
          isPollingRef.current = false;
          setStatus("failed");
          setMessage(paymentMessage || "Payment failed");
          onError?.(paymentMessage || "Payment failed");
          break;

        case "timeout":
          isPollingRef.current = false;
          setStatus("timeout");
          setMessage(paymentMessage || "Payment request timed out");
          onError?.("Payment request timed out");
          break;

        case "pending":
        default:
          // Continue polling
          setStatus("processing");
          setMessage(paymentMessage || "Processing payment...");
          
          if (pollCountRef.current < maxPollAttempts && isPollingRef.current) {
            pollTimeoutRef.current = setTimeout(() => pollStatus(requestId), pollInterval);
          } else {
            isPollingRef.current = false;
            setStatus("timeout");
            setMessage("Payment verification timed out. Please check your M-Pesa messages.");
            onError?.("Payment verification timed out");
          }
          break;
      }
    } catch (err) {
      console.error("[M-Pesa] Poll error:", err);
      // Continue polling on network errors
      if (pollCountRef.current < maxPollAttempts && isPollingRef.current) {
        pollTimeoutRef.current = setTimeout(() => pollStatus(requestId), pollInterval);
      }
    }
  }, [maxPollAttempts, pollInterval, onSuccess, onError]);

  const initiateStkPush = useCallback(async (
    phone: string,
    amount: number,
    orderId: string
  ): Promise<boolean> => {
    reset();
    setStatus("initiating");
    setMessage("Initiating M-Pesa payment...");

    try {
      console.log(`[M-Pesa] Initiating STK push for order ${orderId}`);
      
      const { data, error } = await supabase.functions.invoke("mpesa-stk-push", {
        body: {
          phone,
          amount,
          orderId,
          accountReference: `ORDER-${orderId.slice(0, 8).toUpperCase()}`,
        },
      });

      if (error) {
        console.error("[M-Pesa] STK push error:", error);
        setStatus("error");
        setMessage(error.message || "Failed to initiate payment");
        onError?.(error.message || "Failed to initiate payment");
        return false;
      }

      if (!data.success) {
        console.error("[M-Pesa] STK push failed:", data.error);
        setStatus("error");
        setMessage(data.error || "Failed to initiate payment");
        onError?.(data.error || "Failed to initiate payment");
        return false;
      }

      // STK push sent successfully
      console.log("[M-Pesa] STK push successful, starting polling");
      setCheckoutRequestId(data.checkoutRequestId);
      setStatus("waiting_for_pin");
      setMessage("Please check your phone and enter your M-Pesa PIN");

      // Start polling for payment status
      pollCountRef.current = 0;
      isPollingRef.current = true;
      
      // Wait a bit before first poll to give user time to enter PIN
      pollTimeoutRef.current = setTimeout(() => {
        pollStatus(data.checkoutRequestId);
      }, 8000); // First poll after 8 seconds

      return true;
    } catch (err) {
      console.error("[M-Pesa] Error:", err);
      const message = err instanceof Error ? err.message : "An error occurred";
      setStatus("error");
      setMessage(message);
      onError?.(message);
      return false;
    }
  }, [reset, pollStatus, onError]);

  const isProcessing = status === "initiating" || status === "waiting_for_pin" || status === "processing";

  return {
    status,
    message,
    isProcessing,
    initiateStkPush,
    reset,
    checkoutRequestId,
  };
};
