const KEY = "prime_cart_v1";

export function loadCartFromStorage(userId) {
  if (!userId) return [];
  const data = localStorage.getItem(`cart_${userId}`);
  return data ? JSON.parse(data) : [];
}

export function saveCartToStorage(userId, cart) {
  if (!userId) return;
  localStorage.setItem(`cart_${userId}`, JSON.stringify(cart));
}

export function clearCartStorage(userId) {
  if (!userId) return;
  localStorage.removeItem(`cart_${userId}`);
}
