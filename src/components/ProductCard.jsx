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

  // ⭐ NEW: rating state
  const [rating, setRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  /* ---------------- LOAD RATINGS ---------------- */
  useEffect(() => {
    if (!productId) return;

    api
      .get(`/reviews/product/${productId}`)
      .then((res) => {
        const reviews = res.data || [];
        setReviewCount(reviews.length);

        if (reviews.length > 0) {
          const avg =
            reviews.reduce((s, r) => s + r.rating, 0) /
            reviews.length;
          setRating(avg.toFixed(1));
        }
      })
      .catch(() => {});
  }, [productId]);

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

  /* ---------------- TOGGLE WISHLIST ---------------- */
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
    } catch {
      alert("Could not update wishlist");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-card">
      {/* ❤️ Wishlist */}
      <button
        className={`wishlist-heart ${wish ? "active" : ""}`}
        onClick={toggleWishlist}
      >
        ♥
      </button>

      {/* IMAGE */}
      <Link to={`/product/${productId}`} className="product-image-wrap">
        <img
          src={product.img}
          alt={product.name}
          className="product-image"
        />
      </Link>

      {/* ⭐ RATING PREVIEW */}
      <div className="product-rating-preview">
        {reviewCount > 0 ? (
          <>
            <span className="stars">
              {"★".repeat(Math.round(rating))}
              {"☆".repeat(5 - Math.round(rating))}
            </span>
            <span className="rating-text">
              {rating} ({reviewCount})
            </span>
          </>
        ) : (
          <span className="no-reviews">☆ No reviews yet</span>
        )}
      </div>

      {/* INFO */}
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
