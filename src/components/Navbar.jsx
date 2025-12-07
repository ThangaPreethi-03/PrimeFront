import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart, useAuth } from "../App";

export default function Navbar({ onOpenCart }) {
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Ultra-safe username extraction
  const displayName =
    user?.name ||
    user?.user?.name ||
    user?.email?.split("@")[0] ||
    user?.user?.email?.split("@")[0] ||
    "User";

  return (
    <header className="nav">
      {/* LEFT SIDE - BRAND */}
      <div className="nav-left">
        <Link to="/" className="brand">
          PrimeShop
        </Link>
      </div>

      {/* RIGHT SIDE */}
      <div className="nav-actions">

        {/* CART BUTTON */}
        <button className="btn-cart" onClick={onOpenCart}>
          🛒 <span className="badge">{cartCount}</span>
        </button>

        {/* USER LOGGED IN */}
        {user ? (
          <div
            className="userMenu"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span className="userName">Hi, {displayName}</span>

            {/* MY ORDERS */}
            <Link to="/orders" className="btn small alt">
              My Orders
            </Link>

            {/* TRACK ORDER */}
            <Link to="/orders/track" className="btn small alt">
              Track Orders
            </Link>

            {/* LOGOUT */}
            <button
              className="btn small"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          // USER NOT LOGGED IN
          <div className="authLinks">
            <Link to="/login" className="btn small">Login</Link>
            <Link to="/register" className="btn small alt">Register</Link>
          </div>
        )}
      </div>
    </header>
  );
}
