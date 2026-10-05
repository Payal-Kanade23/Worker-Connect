// src/hooks/useRazorpay.ts
import { useState } from "react";
import axios from "axios";
import API from "../api";
import { useAuth } from "../context/authContext";
interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface OrderResponse {
  id: string;
  amount: number;
  currency: string;
}




function loadScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

function getErrorMessage(e: unknown): string {
  if (axios.isAxiosError(e)) return e.response?.data?.error ?? e.message;
  if (e instanceof Error) return e.message;
  return "Something went wrong";
}

export function useRazorpay() {
    const {user} = useAuth();
  const [loading, setLoading] = useState(false);

  const pay = async (onSuccess: () => void, onError: (msg: string) => void,bookingId:number) => {
        if (!user) return onError("Please log in first");

    setLoading(true);
    try {
      if (!(await loadScript())) throw new Error("Could not load Razorpay");

      // 1) Create order (cookie is sent automatically via withCredentials)
      const { data: order } = await API.post<OrderResponse>("/api/payment/create-order",{
          bookingId
      });

      // 2) Open Razorpay checkout
      const rzp = new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: "WeeConnect",
        description: "WeeConnect payment",
        prefill: { name: user.name, email: user.email, contact: user.phone },
        theme: { color: "#4f46e5" },
        handler: async (response: RazorpayResponse) => {
         // Razorpay's Checkout response
          try {
            // 3) Verify on server
            const res  = await API.post<{ success: boolean , message:string,data:RazorpayResponse}>(
              "/api/payment/verify",
              {...response  }
            );
            res.data.success ? onSuccess() : onError("Verification failed");
          } catch (e) {
            onError(getErrorMessage(e));
          } finally {
            setLoading(false);
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      });

      rzp.on("payment.failed", (r: any) => {
        onError(r.error.description);
        setLoading(false);
      });

      rzp.open();
    } catch (e) {
      onError(getErrorMessage(e));
      setLoading(false);
    }
  };

  return { pay, loading };
}