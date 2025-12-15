// src/components/CartSidebar.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function CartSidebar({
  open,
  onClose,
  cart = [],
  changeQty = () => {},
  removeFromCart = () => {},
  clearCart = () => {},
}) {
  const navigate = useNavigate();
  const { user } = useAuth ? useAuth() : { user: null };
  const [loading, setLoading] = useState(false);

  /* ------------------ CALCULATIONS ------------------ */
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);
  const cartTotal = cart.reduce(
    (s, c) => s + c.qty * (c.product.price || 0),
    0
  );

  // Get stable productId
  const getProductId = (p) =>
    p._id || p.id || p.productId || (typeof p === "string" ? p : null);

  /* ------------------ CHECKOUT HANDLER ------------------ */
  const handleCheckout = () => {
    if (!cart.length) {
      alert("Your cart is empty.");
      return;
    }

    // Guest check (same behaviour as before)
    if (!user) {
      const ok = window.confirm(
        "You are not logged in. Continue as guest?"
      );
      if (!ok) {
        navigate("/login");
        return;
      }
    }

    setLoading(true);

    // 🔥 IMPORTANT CHANGE
    // Redirect to PAYMENT page instead of placing order
    setTimeout(() => {
      setLoading(false);
      onClose?.();
      navigate("/payment");
    }, 300);
  };

  /* ------------------ RENDER ------------------ */
  return (
    <div className={`cart-sidebar ${open ? "open" : ""}`} aria-hidden={!open}>
      <div className="cart-header">
        <h3>Cart ({cartCount})</h3>
        <button className="btn small" onClick={onClose}>
          Close
        </button>
      </div>

      <div className="cart-body">
        {cart.length === 0 ? (
          <div className="muted">Your cart is empty.</div>
        ) : (
          cart.map((c) => {
            const pid = getProductId(c.product);
            return (
              <div className="cart-row" key={pid}>
                <img
                  src={c.product.img}
                  alt={c.product.name}
                  className="cart-thumb"
                />

                <div style={{ flex: 1 }}>
                  <div className="cart-item-name">
                    {c.product.name}
                  </div>

                  <div className="muted">
                    ₹{(c.product.price || 0).toLocaleString()}
                  </div>

                  <div
                    style={{
                      marginTop: 8,
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      className="btn qty"
                      onClick={() => changeQty(pid, c.qty - 1)}
                    >
                      -
                    </button>

                    <div>{c.qty}</div>

                    <button
                      className="btn qty"
                      onClick={() => changeQty(pid, c.qty + 1)}
                    >
                      +
                    </button>

                    <button
                      className="btn small alt"
                      onClick={() => removeFromCart(pid)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="cart-footer">
        <div className="cart-summary">
          <div>Items</div>
          <div>{cartCount}</div>
        </div>

        <div className="cart-summary">
          <div>Total</div>
          <div style={{ fontWeight: 800 }}>
            ₹{cartTotal.toLocaleString()}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn premium-add"
            onClick={handleCheckout}
            disabled={loading}
          >
            {loading ? "Processing..." : "Checkout"}
          </button>

          <button
            className="btn alt"
            onClick={() => {
              if (window.confirm("Clear cart?")) clearCart();
            }}
            disabled={loading}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
