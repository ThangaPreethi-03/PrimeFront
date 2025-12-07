import React from "react";
import { useLocation } from "react-router-dom";

export default function CheckoutSuccess() {
  const { search } = useLocation();
  return (
    <div style={{ padding: 36 }}>
      <h2>Thank you — your payment succeeded!</h2>
      <p>Stripe session: {new URLSearchParams(search).get("session_id")}</p>
      <p>Note: This is a demo. For secure order verification use server-side Stripe webhooks.</p>
    </div>
  );
}
