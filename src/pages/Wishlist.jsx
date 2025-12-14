import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../App";

export default function Wishlist() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const userId = user?.id;
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- LOAD WISHLIST ---------------- */
  const loadWishlist = async () => {
    if (!userId) {
      setWishlist([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get(`/users/${userId}/wishlist`);
      setWishlist(res.data || []);
    } catch (err) {
      console.error("Wishlist load error:", err);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
    window.addEventListener("wishlist-updated", loadWishlist);
    return () =>
      window.removeEventListener("wishlist-updated", loadWishlist);
  }, [userId]);

  /* ---------------- REMOVE ---------------- */
  const removeFromWishlist = async (productId) => {
    try {
      await api.post(`/users/${userId}/wishlist`, { productId });
      window.dispatchEvent(new Event("wishlist-updated"));
    } catch (err) {
      alert("Could not remove from wishlist");
    }
  };

  /* ---------------- UI ---------------- */
  if (!user) {
    return (
      <div className="container">
        <h2>Please login to view wishlist</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container">
        <h2>Loading wishlist...</h2>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 className="page-title">❤️ My Wishlist</h2>

      {wishlist.length === 0 ? (
        <p className="muted">Your wishlist is empty.</p>
      ) : (
        <div className="wishlist-horizontal">
          {wishlist.map((p) => (
            <div key={p.productId} className="wishlist-item">
              <img
                src={p.img}
                alt={p.name}
                className="wishlist-thumb"
                onClick={() => navigate(`/product/${p.productId}`)}
              />

              <div className="wishlist-info">
                <h4 onClick={() => navigate(`/product/${p.productId}`)}>
                  {p.name}
                </h4>
                <p>₹{p.price?.toLocaleString()}</p>

                <button
                  className="btn alt"
                  onClick={() => removeFromWishlist(p.productId)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
