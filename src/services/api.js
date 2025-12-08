// src/services/api.js
import axios from "axios";

/* ---------------------------------------------------------
   🌍 AUTO SELECT BACKEND (LOCAL VS PRODUCTION)
--------------------------------------------------------- */
const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

// If frontend is on localhost → use local backend  
// If frontend is on Vercel → use Render backend  
const BASE_URL = isLocalhost
  ? "http://localhost:5000/api"
  : "https://primeback.onrender.com/api";  // 🔥 your Render backend


/* ---------------------------------------------------------
   🚀 CREATE AXIOS CLIENT
--------------------------------------------------------- */
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,  // needed for auth
});

export default api;


/* ---------------------------------------------------------
   🔥 AUTH HELPERS (used by Register & Login)
--------------------------------------------------------- */
export function checkEmailExists(email) {
  return api.post("/auth/check-email", { email });
}


/* ---------------------------------------------------------
   🔥 ORDERS
--------------------------------------------------------- */
export function getUserOrders(userId) {
  return api.get(`/orders/user/${userId}`);
}


/* ---------------------------------------------------------
   🔥 TRACKING
--------------------------------------------------------- */
export function getOrderTracking(orderId) {
  return api.get(`/orders/track/${orderId}`);
}


/* ---------------------------------------------------------
   🔥 REVIEWS
--------------------------------------------------------- */
export function getProductReviews(productId) {
  return api.get(`/reviews/product/${productId}`);
}

export function postProductReview(productId, payload) {
  return api.post(`/reviews/product/${productId}`, payload);
}
