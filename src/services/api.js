// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:5000/api",
  withCredentials: true,
});

// --- existing exports (keep your previous ones if any) ---
export default api;

// --- new helpers ---
// Orders
export async function getUserOrders(userId) {
  return api.get(`/orders/user/${userId}`);
}

// Reviews
export async function getProductReviews(productId) {
  return api.get(`/reviews/product/${productId}`);
}
export async function postProductReview(productId, payload) {
  return api.post(`/reviews/product/${productId}`, payload);
}

// Email check (for login/register)
export async function checkEmailExists(email) {
  return api.post("/auth/check-email", { email });
}
