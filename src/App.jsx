import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Home from "./pages/Home";
import ProductPage from "./pages/ProductPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import BillPage from "./pages/BillPage";
import OrderHistory from "./pages/OrderHistory";
import OrderTracking from "./pages/OrderTracking";
import Chatbot from "./components/Chatbot";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import PaymentPage from "./pages/Payment";

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

/* ------------------ APP ------------------ */
export default function App() {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const [token, setToken] = useState(localStorage.getItem("token"));
const [user, setUser] = useState(null);

useEffect(() => {
  if (!token) {
    setUser(null);
    return;
  }

  try {
    const decoded = JSON.parse(
      atob(token.split(".")[1])
    );

    // ✅ IMPORTANT FIX HERE
    setUser({
      id: decoded.id,          // ← THIS WAS THE BUG
      name: decoded.name,
      email: decoded.email,
      interests: decoded.interests || []
    });

    api.defaults.headers.common.Authorization =
      `Bearer ${token}`;
  } catch (err) {
    console.error("Invalid token", err);
    localStorage.removeItem("token");
    setUser(null);
  }
}, [token]);


  /* ------------------ CART PERSISTENCE ------------------ */
  useEffect(() => {
    if (user?.userId) {
      const stored = loadCartFromStorage(user.userId);
      setCart(stored || []);
    }
  }, [user?.userId]);

  useEffect(() => {
    if (user?.userId) {
      saveCartToStorage(user.userId, cart);
    }
  }, [cart, user?.userId]);

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
    setCart((prev) =>
      prev
        .map((c) =>
          c.product._id === productId
            ? { ...c, qty }
            : c
        )
        .filter((c) => c.qty > 0)
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) =>
      prev.filter((c) => c.product._id !== productId)
    );
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((s, c) => s + c.qty, 0);
  const cartTotal = cart.reduce(
    (s, c) => s + c.qty * c.product.price,
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
    if (user?.userId) clearCartStorage(user.userId);
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
