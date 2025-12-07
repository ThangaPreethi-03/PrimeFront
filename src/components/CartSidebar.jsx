import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useCart } from "../App";

export default function CartSidebar({
  open,
  onClose,
  cart,
  changeQty,
  removeFromCart,
  clearCart,
}) {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { token } = useAuth();

  // 👉 UNIVERSAL PRODUCT ID FIX
  const getPid = (p) => p._id || p.id;

  // ---------------- TOTAL ----------------
  const cartTotal = cart.reduce(
    (sum, c) => sum + c.qty * c.product.price,
    0
  );

  // ---------------- CHECKOUT ----------------
  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    navigate("/bill", { state: { cart } });
  };

  return (
    <div className={`cart-sidebar ${open ? "open" : ""}`}>
      
      {/* HEADER */}
      <div className="cart-header">
        <h3>Cart ({cartCount})</h3>
        <button className="btn small" onClick={onClose}>
          Close
        </button>
      </div>

      {/* BODY */}
      <div className="cart-body">
        {cart.length === 0 ? (
          <div className="muted">Your cart is empty.</div>
        ) : (
          cart.map((item) => {
            const pid = getPid(item.product);

            return (
              <div className="cart-row" key={pid}>
                {/* Image */}
                <img
                  src={item.product.img}
                  alt={item.product.name}
                  className="cart-thumb"
                />

                <div style={{ flex: 1 }}>
                  <div className="cart-item-name">{item.product.name}</div>
                  <div className="muted">
                    ₹{item.product.price.toLocaleString()}
                  </div>

                  {/* ⭐ QUANTITY BUTTONS FIXED */}
                  <div
                    style={{
                      marginTop: 8,
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                    }}
                  >
                    {/* decrease */}
                    <button
                      className="btn qty"
                      onClick={() => changeQty(pid, item.qty - 1)}
                    >
                      –
                    </button>

                    {/* qty number */}
                    <div className="qty-number">{item.qty}</div>

                    {/* increase */}
                    <button
                      className="btn qty"
                      onClick={() => changeQty(pid, item.qty + 1)}
                    >
                      +
                    </button>

                    {/* remove */}
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

      {/* FOOTER */}
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
          <button className="btn" onClick={handleCheckout}>
            Checkout
          </button>
          <button className="btn alt" onClick={clearCart}>
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
