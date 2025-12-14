import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart, useAuth } from "../App";
import api from "../services/api";

// PREMIUM RESPONSIVE NAVBAR (DESKTOP UNCHANGED, MOBILE POLISHED)

export default function Navbar({ onOpenCart }) {
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [wishCount, setWishCount] = useState(0);
  const [mobileMenu, setMobileMenu] = useState(false);

  const userId = user?._id || user?.id;

  const displayName =
    user?.name ||
    user?.user?.name ||
    user?.email?.split("@")[0] ||
    "User";

  /* ---------------- LOAD WISHLIST COUNT (DEDUP FIX) ---------------- */
  useEffect(() => {
    if (!userId) {
      setWishCount(0);
      return;
    }

    const loadWishlist = async () => {
      try {
        const res = await api.get(`/users/${userId}/wishlist`);

        // 🔥 normalize + remove duplicates
        const ids = res.data
          .map((w) => w.productId || w._id || w.id)
          .filter(Boolean);

        const uniqueIds = [...new Set(ids)];

        setWishCount(uniqueIds.length);
      } catch {
        setWishCount(0);
      }
    };

    loadWishlist();
    window.addEventListener("wishlist-updated", loadWishlist);

    return () =>
      window.removeEventListener("wishlist-updated", loadWishlist);
  }, [userId]);

  return (
    <>
      <header className="nav premium-nav">
        {/* LEFT */}
        <div className="nav-left">
          <Link to="/shop" className="brand no-underline hover-grow">
            PrimeShop
          </Link>
        </div>

        {/* DESKTOP NAVBAR */}
        <div className="nav-actions desktop-only">
          <Link to="/wishlist" className="nav-link no-underline hover-grow">
            ❤️ Wishlist <span className="badge">{wishCount}</span>
          </Link>

          <button className="btn-cart hover-grow" onClick={onOpenCart}>
            🛒 <span className="badge">{cartCount}</span>
          </button>

          {user ? (
            <div className="userMenu">
              <span className="userName">Hi, {displayName}</span>

              <Link className="nav-link hover-grow" to="/profile">
                Profile
              </Link>

              <Link className="nav-link hover-grow" to="/orders">
                My Orders
              </Link>

              <Link className="nav-link hover-grow" to="/orders/track">
                Track Orders
              </Link>

              <button
                className="btn small hover-grow"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="authLinks">
              <Link className="nav-link hover-grow" to="/login">
                Login
              </Link>
              <Link className="nav-link hover-grow" to="/register">
                Register
              </Link>
            </div>
          )}
        </div>

        {/* MOBILE TOP BAR */}
        <div className="mobile-only mobile-actions">
          <div className="mobile-pill">
            <Link to="/wishlist" className="icon-btn">
              ❤️ <span className="badge">{wishCount}</span>
            </Link>

            <button className="icon-btn" onClick={onOpenCart}>
              🛒 <span className="badge">{cartCount}</span>
            </button>

            <button
              className="hamburger"
              onClick={() => setMobileMenu(!mobileMenu)}
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU PANEL */}
      {mobileMenu && (
        <div className="mobile-menu-panel mobile-only">
          {user ? (
            <>
              <div className="mobile-user">
                Hi, {displayName}
              </div>

              <Link to="/profile" onClick={() => setMobileMenu(false)}>
                Profile
              </Link>

              <Link to="/orders" onClick={() => setMobileMenu(false)}>
                My Orders
              </Link>

              <Link to="/orders/track" onClick={() => setMobileMenu(false)}>
                Track Orders
              </Link>

              <button
                className="btn mobile-logout"
                onClick={() => {
                  logout();
                  setMobileMenu(false);
                  navigate("/");
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileMenu(false)}>
                Login
              </Link>
              <Link to="/register" onClick={() => setMobileMenu(false)}>
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </>
  );
}
