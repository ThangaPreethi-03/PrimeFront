// src/pages/ProductPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api, { getProductReviews, postProductReview } from "../services/api";
import FALLBACK_PRODUCTS from "../data/AllProducts";
import { useCart } from "../App";
import { useAuth } from "../context/AuthContext";

export default function ProductPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const userId = user?.id || user?._id || user?.userId;

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newText, setNewText] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [loading, setLoading] = useState(true);

  /* ===============================
     FETCH PRODUCT
  ================================ */
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    api.get(`/products/${id}`)
      .then((res) => {
        if (mounted && res.data) setProduct(res.data);
      })
      .catch(() => {
        const p = FALLBACK_PRODUCTS.find((x) => String(x.id) === String(id));
        if (mounted) setProduct(p || null);
      })
      .finally(() => mounted && setLoading(false));

    return () => (mounted = false);
  }, [id]);

  /* ===============================
     FETCH REVIEWS
  ================================ */
  useEffect(() => {
    let mounted = true;

    getProductReviews(id)
      .then((res) => {
        if (!mounted) return;
        setReviews(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Fetch reviews error:", err);
      });

    return () => (mounted = false);
  }, [id]);

  /* ===============================
     SUBMIT REVIEW
  ================================ */
  const submitReview = async () => {
    if (!newText.trim()) {
      alert("Please write a review.");
      return;
    }

    const payload = {
      productId: id,
      userId: userId || null,
      userName: user?.name || "Guest",
      rating: newRating,
      comment: newText,
    };

    try {
      await postProductReview(id, payload);

      // Always sync UI with DB
      const updated = await getProductReviews(id);
      setReviews(Array.isArray(updated.data) ? updated.data : []);

      setNewText("");
      setNewRating(5);
    } catch (err) {
      console.error("Review save failed:", err);
      alert("Failed to save review. Please try again.");
    }
  };

  if (loading || !product) {
    return <div style={{ padding: 24 }}>Loading product...</div>;
  }

  /* ===============================
     UTILS
  ================================ */
  const avg =
    reviews.length > 0
      ? Math.round(
          reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
        )
      : 0;

  const renderStars = (rating) =>
    [...Array(5)].map((_, i) => (
      <span key={i} className="stars">
        {i < rating ? "★" : "☆"}
      </span>
    ));

  /* ===============================
     UI
  ================================ */
  return (
    <div className="product-page container">
      <div className="product-page-inner">
        <div className="product-gallery">
          <img src={product.img} alt={product.name} />
        </div>

        <div className="product-details">
          <h1>{product.name}</h1>
          <p className="muted">Category: {product.category}</p>

          <div style={{ margin: "8px 0" }}>
            {renderStars(avg)}
            <span style={{ marginLeft: 8 }}>
              ({reviews.length} reviews)
            </span>
          </div>

          <h2>₹{product.price.toLocaleString()}</h2>
          <p>{product.description || "High quality product."}</p>

          <div style={{ marginTop: 12 }}>
            <button className="btn" onClick={() => addToCart(product)}>
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* ===============================
         REVIEWS SECTION
      ================================ */}
      <div className="review-section">
        <h2>Customer Reviews</h2>

        {reviews.length === 0 && (
          <p className="muted">No reviews yet.</p>
        )}

        {reviews.map((rev) => (
          <div key={rev._id} className="review-item">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontWeight: 700 }}>
                {rev.userName || "Guest"}
              </div>
              <div className="muted">
                {new Date(rev.createdAt).toLocaleString()}
              </div>
            </div>

            <div style={{ marginTop: 6 }}>
              {renderStars(rev.rating || 0)}
            </div>

            <div style={{ marginTop: 6 }}>
              {rev.comment}
            </div>
          </div>
        ))}

        {/* ===============================
           ADD REVIEW
        ================================ */}
        <div className="add-review-box">
          <h3>Add Your Review</h3>

          <label>Rating</label>
          <select
            value={newRating}
            onChange={(e) => setNewRating(Number(e.target.value))}
          >
            <option value={5}>★★★★★</option>
            <option value={4}>★★★★☆</option>
            <option value={3}>★★★☆☆</option>
            <option value={2}>★★☆☆☆</option>
            <option value={1}>★☆☆☆☆</option>
          </select>

          <textarea
            placeholder="Write your review..."
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
          />

          <button className="btn" onClick={submitReview}>
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
}
