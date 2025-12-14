// src/services/api.js
import axios from "axios";

const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const BASE_URL = isLocal ? "http://localhost:5000/api" : (import.meta.env.VITE_API_URL || "https://primeback.onrender.com/api");

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
});

export default api;

/* AUTH */
export function checkEmailExists(email) {
  return api.post("/auth/check-email", { email });
}
export function loginUser(payload) {
  return api.post("/auth/login", payload);
}
export function registerUser(payload) {
  return api.post("/auth/register", payload);
}
export function getMe() {
  return api.get("/auth/me");
}

/* PRODUCTS */
export function fetchProducts() {
  return api.get("/products");
}
export function fetchProduct(id) {
  return api.get(`/products/${id}`);
}

/* ORDERS */
export function createOrder(orderData) {
  return api.post("/orders", orderData);
}
export function getUserOrders(userId) {
  return api.get(`/orders/user/${userId}`);
}

/* WISHLIST (user scoped) */
export function addToWishlist(productId) {
  return api.post(`/users/wishlist/${productId}`, { action: "add" });
}
export function removeFromWishlist(productId) {
  return api.post(`/users/wishlist/${productId}`, { action: "remove" });
}
export function getWishlist(userId) {
  return api.get(`/users/${userId}/wishlist`);
}

/* PAYMENT (frontend helper; server will implement) */
export function createPaymentSession(payload) {
  // payload: { items, total, method, meta }
  return api.post("/payments/create-session", payload);
}

export function verifyPayment(payload) {
  return api.post("/payments/verify", payload);
}

/* REVIEWS */
export function getProductReviews(productId) {
  return api.get(`/reviews/product/${productId}`);
}
export function postProductReview(productId, review) {
  return api.post(`/reviews/product/${productId}`, review);
}
