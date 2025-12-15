import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../App";
import { useAuth } from "../context/AuthContext";

import api from "../services/api";

export default function PaymentPage() {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();
  const { user, token } = useAuth();

  const [loading, setLoading] = useState(false);

  /* ---------------- DELIVERY DETAILS ---------------- */
  const [address, setAddress] = useState({
    name: "",
    phone: "",
    addressLine: "",
    city: "",
    pincode: "",
  });

  /* ---------------- PAYMENT ---------------- */
  const [paymentMode, setPaymentMode] = useState("CARD");
  const [card, setCard] = useState({
    number: "",
    expiry: "",
    cvv: "",
  });

  /* ---------------- HELPERS ---------------- */
  const totalItems = cart.reduce((s, c) => s + c.qty, 0);

  const getProductId = (p) =>
    p?._id || p?.id || p?.productId || null;

  /* ---------------- INPUT HANDLERS ---------------- */
  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleCardChange = (e) => {
    setCard({ ...card, [e.target.name]: e.target.value });
  };

  /* ---------------- VALIDATION ---------------- */
  const validate = () => {
    if (
      !address.name ||
      !address.phone ||
      !address.addressLine ||
      !address.city ||
      !address.pincode
    ) {
      alert("Please fill all delivery details");
      return false;
    }

    if (paymentMode === "CARD") {
      if (!card.number || !card.expiry || !card.cvv) {
        alert("Please fill card details");
        return false;
      }
    }

    return true;
  };

  /* ---------------- CREATE ORDER ---------------- */
  const createOrder = async (paymentStatus) => {
    const orderPayload = {
      invoiceNumber: `INV-${Date.now()}`,
      userId: user?._id || user?.id || null,
      email: user?.email || "guest@example.com",
      items: cart.map((c) => ({
        productId: getProductId(c.product),
        name: c.product.name,
        price: c.product.price,
        qty: c.qty,
        img: c.product.img || null,
      })),
      total: cartTotal,
      totalItems,
      paymentMode,
      paymentStatus,
      deliveryAddress: address,
      status: "Placed",
      placedAt: new Date().toISOString(),
    };

    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    return api.post("/orders", orderPayload, { headers });
  };

  /* ---------------- PLACE ORDER ---------------- */
  const handlePlaceOrder = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      await createOrder(
        paymentMode === "COD" ? "COD" : "PAID"
      );

      clearCart();
      navigate("/checkout-success");
    } catch (err) {
      console.error("Order failed:", err.response?.data || err);
      alert("Order failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (!cart.length) {
    return (
      <div className="container">
        <h2>Your cart is empty</h2>
      </div>
    );
  }

  return (
    <div className="container payment-container">
      <h2 className="checkout-title">Checkout & Payment</h2>

      <div className="checkout-grid">
        {/* DELIVERY DETAILS */}
        <div className="checkout-card">
          <h3>🚚 Delivery Details</h3>

          <input className="auth-input" name="name" value={address.name} placeholder="Full Name" onChange={handleAddressChange} />
          <input className="auth-input" name="phone" value={address.phone} placeholder="Phone Number" onChange={handleAddressChange} />
          <input className="auth-input" name="addressLine" value={address.addressLine} placeholder="Address" onChange={handleAddressChange} />
          <input className="auth-input" name="city" value={address.city} placeholder="City" onChange={handleAddressChange} />
          <input className="auth-input" name="pincode" value={address.pincode} placeholder="Pincode" onChange={handleAddressChange} />
        </div>

        {/* PAYMENT METHOD */}
        <div className="checkout-card">
          <h3>💳 Payment Method</h3>

          <select
            className="auth-input"
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
          >
            <option value="CARD">Debit / Credit Card</option>
            <option value="UPI">UPI</option>
            <option value="COD">Cash on Delivery</option>
          </select>

          {paymentMode === "CARD" && (
            <>
              <input className="auth-input" name="number" value={card.number} placeholder="Card Number (Dummy)" onChange={handleCardChange} />
              <input className="auth-input" name="expiry" value={card.expiry} placeholder="Expiry (MM/YY)" onChange={handleCardChange} />
              <input className="auth-input" name="cvv" value={card.cvv} placeholder="CVV" onChange={handleCardChange} />
            </>
          )}

          {paymentMode === "UPI" && (
            <input className="auth-input" placeholder="UPI ID (example@upi)" />
          )}

          {paymentMode === "COD" && (
            <p className="cod-note">💡 Pay with cash when your order is delivered.</p>
          )}
        </div>

        {/* ORDER SUMMARY */}
        <div className="checkout-card order-summary">
          <h3>🧾 Order Summary</h3>
          <p>Total Items: <strong>{totalItems}</strong></p>
          <p>Total Amount: <strong>₹{cartTotal.toLocaleString()}</strong></p>

          <button
            className="btn premium-add"
            onClick={handlePlaceOrder}
            disabled={loading}
          >
            {loading
              ? paymentMode === "COD"
                ? "Placing Order..."
                : "Processing Payment..."
              : paymentMode === "COD"
              ? "Place Order"
              : "Pay Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
