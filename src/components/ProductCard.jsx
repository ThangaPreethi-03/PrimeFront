import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function ProductCard({ product, onAdd }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const userId = user?.id;
  const productId = product?._id || product?.id;

  const [wish, setWish] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ---------------- SYNC WISHLIST ---------------- */
  const syncWishlist = async () => {
    if (!userId || !productId) {
      setWish(false);
      return;
    }

    try {
      const res = await api.get(`/users/${userId}/wishlist`);
      const ids = res.data.map((w) => w.productId);
      setWish(ids.includes(productId));
    } catch {
      setWish(false);
    }
  };

  useEffect(() => {
    syncWishlist();
    window.addEventListener("wishlist-updated", syncWishlist);
    return () =>
      window.removeEventListener("wishlist-updated", syncWishlist);
  }, [userId, productId]);

  /* ---------------- TOGGLE ---------------- */
  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      navigate("/login");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      await api.post(`/users/${userId}/wishlist`, { productId });
      window.dispatchEvent(new Event("wishlist-updated"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-card">

      {/* IMAGE + HEART OVERLAY */}
      <div className="product-image-wrap">

        <button
          className={`wishlist-heart ${wish ? "active" : ""}`}
          onClick={toggleWishlist}
          title={wish ? "Remove from wishlist" : "Add to wishlist"}
        >
          ♥
        </button>

        <Link to={`/product/${productId}`}>
          <img
            src={product.img}
            alt={product.name}
            className="product-image"
          />
        </Link>
      </div>

      {/* INFO */}
      <div className="product-info">
        <Link to={`/product/${productId}`} className="product-name">
          {product.name}
        </Link>

        <div className="product-category">{product.category}</div>

        <div className="product-bottom">
          <div className="product-price">
            ₹{product.price?.toLocaleString()}
          </div>

          <button
            className="add-btn premium-add"
            onClick={() => onAdd(product)}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
