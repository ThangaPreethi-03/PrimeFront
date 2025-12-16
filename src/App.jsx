import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Routes, Route } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

import LandingPage from "./pages/LandingPage";
import Home from "./pages/Home";
import ProductPage from "./pages/ProductPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import BillPage from "./pages/BillPage";
import OrderHistory from "./pages/OrderHistory";
import OrderDetails from "./pages/OrderDetails";
import OrderTracking from "./pages/OrderTracking";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import PaymentPage from "./pages/Payment";

import Navbar from "./components/Navbar";
import CartSidebar from "./components/CartSidebar";
import Chatbot from "./components/Chatbot";

import api from "./services/api";
import {
  loadCartFromStorage,
  saveCartToStorage,
  clearCartStorage,
} from "./services/cart";

/* ------------------ CONTEXT SETUP ------------------ */
const CartContext = createContext();
export const useCart = () => useContext(CartContext);

/* ------------------ HELPERS ------------------ */
const getProductId = (p) => String(p?._id || p?.id || "");

/* ------------------ APP ------------------ */
export default function App() {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

// App.jsx (AUTH PART ONLY)

const [token, setToken] = useState(
  () => localStorage.getItem("token") || null
);

const [user, setUser] = useState(null);

useEffect(() => {
  if (!token) {
    setUser(null);
    return;
  }

  try {
    const decoded = JSON.parse(atob(token.split(".")[1]));

    // ✅ SINGLE SOURCE OF TRUTH
    setUser({
      id: decoded.id,          // <-- THIS FIXES EVERYTHING
      name: decoded.name,
      email: decoded.email,
      interests: decoded.interests || [],
    });

    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } catch (err) {
    console.error("Invalid token", err);
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }
}, [token]);


  /* ------------------ CART PERSISTENCE ------------------ */
/* ------------------ CART PERSISTENCE ------------------ */
useEffect(() => {
  if (user?.id) {
    const stored = loadCartFromStorage(user.id);
    setCart(stored || []);
  }
}, [user?.id]);

useEffect(() => {
  if (user?.id) {
    saveCartToStorage(user.id, cart);
  }
}, [cart, user?.id]);


  /* ------------------ CART FUNCTIONS ------------------ */
  const addToCart = (product, qty = 1) => {
    const pid = getProductId(product);

    setCart((prev) => {
      const exists = prev.find(
        (c) => getProductId(c.product) === pid
      );

      if (exists) {
        return prev.map((c) =>
          getProductId(c.product) === pid
            ? { ...c, qty: c.qty + qty }
            : c
        );
      }

      return [...prev, { product, qty }];
    });

    setCartOpen(true);
  };

  const changeQty = (productId, qty) => {
    const pid = String(productId);
    setCart((prev) =>
      prev
        .map((c) =>
          getProductId(c.product) === pid
            ? { ...c, qty: Number(qty) }
            : c
        )
        .filter((c) => c.qty > 0)
    );
  };

  const removeFromCart = (productId) => {
    const pid = String(productId);
    setCart((prev) =>
      prev.filter((c) => getProductId(c.product) !== pid)
    );
  };

  const clearCart = () => setCart([]);

  /* ------------------ CART STATS ------------------ */
  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);
  const cartTotal = cart.reduce(
    (sum, c) => sum + c.qty * c.product.price,
    0
  );

  const cartValue = useMemo(
    () => ({
      cart,
      addToCart,
      changeQty,
      removeFromCart,
      clearCart,
      cartOpen,
      setCartOpen,
      cartCount,
      cartTotal,
    }),
    [cart, cartOpen, cartCount, cartTotal]
  );

  /* ------------------ AUTH ACTIONS ------------------ */
  const login = (tok) => {
    localStorage.setItem("token", tok);
    setToken(tok);
  };

const logout = () => {
  if (user?.id) clearCartStorage(user.id);
  localStorage.removeItem("token");
  setToken(null);
  setUser(null);
  setCart([]);
};

  const authValue = useMemo(
    () => ({ token, user, login, logout }),
    [token, user]
  );

  /* ------------------ APP UI ------------------ */
  return (
    <AuthContext.Provider value={authValue}>
      <CartContext.Provider value={cartValue}>
        <div className="app">
          <Navbar onOpenCart={() => setCartOpen(true)} />

          <main className="page-container">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/shop" element={<Home />} />
              <Route path="/product/:id" element={<ProductPage />} />

              <Route path="/login" element={<Login onLogin={login} />} />
              <Route path="/register" element={<Register onRegister={login} />} />

              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/payment" element={<PaymentPage />} />

              <Route path="/checkout-success" element={<CheckoutSuccess />} />
              <Route path="/bill" element={<BillPage />} />
              <Route path="/orders" element={<OrderHistory />} />
              <Route path="/orders/:invoiceNumber" element={<OrderDetails />} />

              <Route path="/orders/track" element={<OrderTracking />} />
            </Routes>
          </main>

          <CartSidebar
            open={cartOpen}
            onClose={() => setCartOpen(false)}
            cart={cart}
            changeQty={changeQty}
            removeFromCart={removeFromCart}
            clearCart={clearCart}
          />

          <Chatbot />

          <footer className="footer">
            © {new Date().getFullYear()} PrimeShop — Demo store
          </footer>
        </div>
      </CartContext.Provider>
    </AuthContext.Provider>
  );
}
