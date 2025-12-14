import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../App";

export default function ProductCard({ product, onAdd }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ✅ FIX 1: normalize IDs
  const userId = user?.id;
  const productId = product?._id || product?.id;

  const [wish, setWish] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ---------------- SYNC HEART ---------------- */
  const syncWishlist = async () => {
    if (!userId || !productId) {
      setWish(false);
      return;
    }

    try {
      const res = await api.get(`/users/${userId}/wishlist`);
      const ids = res.data.map((w) => w.productId);
      setWish(ids.includes(productId));
    } catch (err) {
      console.error("Wishlist sync error:", err);
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

    if (!productId) {
      console.error("Invalid productId", product);
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      await api.post(`/users/${userId}/wishlist`, {
        productId,
      });

      window.dispatchEvent(new Event("wishlist-updated"));
    } catch (err) {
      console.error(
        "Wishlist toggle error:",
        err.response?.data || err
      );
      alert("Could not update wishlist");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-card">
      <Link to={`/product/${productId}`} className="product-image-wrap">
        <img
          src={product.img}
          alt={product.name}
          className="product-image"
          onError={(e) => (e.target.src = "/images/default.jpg")}
        />

        <button
          className={`wishlist-heart ${wish ? "active" : ""}`}
          onClick={toggleWishlist}
          disabled={loading}
          title={wish ? "Remove from wishlist" : "Add to wishlist"}
        >
          ♥
        </button>
      </Link>

      <div className="product-info">
        <Link to={`/product/${productId}`} className="product-name">
          {product.name}
        </Link>

        <div className="product-category">
          {product.category}
        </div>

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
