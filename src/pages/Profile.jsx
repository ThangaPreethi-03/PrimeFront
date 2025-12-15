import React, { useEffect, useState } from "react";
import api from "../services/api";
//import { useAuth } from "../App";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();
if (!user?.id) {
  return <h3>Please login to view profile</h3>;
}

  const userId = user?._id || user?.id;

  const [wishlistCount, setWishlistCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  /* ---------------- LOAD PROFILE DATA ---------------- */
  useEffect(() => {
    if (!userId) return;

    const loadProfileData = async () => {
      try {
        // Wishlist
        const wishlistRes = await api.get(`/users/${user.id}/wishlist`);
        setWishlistCount(wishlistRes.data.length);

        // Orders
        const ordersRes = await api.get(`/users/${user.id}`)

        setOrdersCount(ordersRes.data.length);
      } catch (err) {
        console.error("Profile load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [userId]);

  if (!user) {
    return (
      <div className="container">
        <h2>Please login to view your profile</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container">
        <h2>Loading profile...</h2>
      </div>
    );
  }

  return (
    <div className="container profile-page">
      <h2>My Profile</h2>

      {/* USER INFO */}
      <div className="card profile-card">
        <h3>👤 Personal Details</h3>
        <p><strong>Name:</strong> {user.name || "User"}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>

      {/* STATS */}
      <div className="profile-stats">
        <div className="card stat-box">
          <h3>❤️ Wishlist</h3>
          <p className="stat-number">{wishlistCount}</p>
        </div>

        <div className="card stat-box">
          <h3>📦 Orders</h3>
          <p className="stat-number">{ordersCount}</p>
        </div>
      </div>

      {/* INTERESTS */}
      <div className="card profile-card">
        <h3>⭐ Interests</h3>

        {user.interests && user.interests.length > 0 ? (
          <div className="interest-tags">
            <div className="interest-text">
  {user.interests.join(", ")}
</div>


          </div>
        ) : (
          <p className="muted">No interests selected</p>
        )}
      </div>
    </div>
  );
}
