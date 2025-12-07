import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import ProductPage from "./pages/ProductPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import BillPage from "./pages/BillPage";
import OrderHistory from "./pages/OrderHistory";
import OrderTracking from "./pages/OrderTracking";
import Chatbot from "./components/Chatbot";

import Navbar from "./components/Navbar";
import CartSidebar from "./components/CartSidebar";

import api from "./services/api";
import {
  loadCartFromStorage,
  saveCartToStorage,
  clearCartStorage,
} from "./services/cart";
import { jwtDecode } from "jwt-decode";

/* ------------------ CONTEXT SETUP ------------------ */
const CartContext = createContext();
export const useCart = () => useContext(CartContext);

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

/* ---------- UNIVERSAL HELPERS ---------- */
const getProductId = (p) => String(p?._id || p?.id || "");
const getUserId = (u) =>
  String(u?.id || u?._id || u?.userId || u?.email || "");

/* ------------------ APP ------------------ */
export default function App() {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const [user, setUser] = useState(() => {
    try {
      return token ? jwtDecode(token) : null;
    } catch {
      return null;
    }
  });

  /* ---------- LOAD CART AFTER LOGIN ---------- */
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);

      try {
        const decoded = jwtDecode(token);
        setUser(decoded);

        const uid = getUserId(decoded);
        const storedCart = loadCartFromStorage(uid);
        setCart(storedCart || []);
      } catch {
        setUser(null);
        setCart([]);
      }
    } else {
      localStorage.removeItem("token");
      setUser(null);
      setCart([]);
    }
  }, [token]);

  /* ---------- SAVE CART PER USER ---------- */
  useEffect(() => {
    if (user) {
      const uid = getUserId(user);
      saveCartToStorage(uid, cart);
    }
  }, [cart, user]);

  /* ------------------ CART FUNCTIONS ------------------ */
  const addToCart = (product, qty = 1) => {
    const pid = getProductId(product);

    setCart((prev) => {
      const exists = prev.find((c) => getProductId(c.product) === pid);

      if (exists) {
        return prev.map((c) =>
          getProductId(c.product) === pid ? { ...c, qty: c.qty + qty } : c
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
    setCart((prev) => prev.filter((c) => getProductId(c.product) !== pid));
  };

  const clearCart = () => setCart([]);

  /* ---------- CART STATS ---------- */
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

  /* ------------------ AUTH ------------------ */
  const login = (token) => setToken(token);

  const logout = () => {
    const uid = getUserId(user);
    clearCartStorage(uid);
    setToken(null);
    setCart([]);
  };

  const authValue = useMemo(
    () => ({ token, user, login, logout }),
    [token, user]
  );

  /* ---------- INITIAL BACKEND CHECK ---------- */
  useEffect(() => {
    api.get("/products").catch(() => {});
  }, []);

  return (
    <AuthContext.Provider value={authValue}>
      <CartContext.Provider value={cartValue}>
        <div className="app">
          <Navbar onOpenCart={() => setCartOpen(true)} />

          <main className="page-container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/login" element={<Login onLogin={login} />} />
              <Route path="/register" element={<Register onRegister={login} />} />
              <Route path="/checkout-success" element={<CheckoutSuccess />} />
              <Route path="/bill" element={<BillPage />} />
              <Route path="/orders" element={<OrderHistory />} />
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
