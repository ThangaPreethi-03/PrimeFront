import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();
  const userId = user?.id;

  const [wishlistCount, setWishlistCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadProfileData = async () => {
      try {
        const wishlistRes = await api.get(`/users/${userId}/wishlist`);
        setWishlistCount(wishlistRes.data.length);

        const ordersRes = await api.get(`/orders/user/${userId}`);
        setOrdersCount(ordersRes.data.length);
      } catch (err) {
        console.error("Profile load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [userId]);

  if (!userId) {
    return <h3>Please login to view profile</h3>;
  }

  if (loading) {
    return <h3>Loading profile...</h3>;
  }

  return (
    <div className="container profile-page">
      <h2>My Profile</h2>

      <div className="card profile-card">
        <h3>👤 Personal Details</h3>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>

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

      <div className="card profile-card">
        <h3>⭐ Interests</h3>
        {user.interests?.length > 0 ? (
          <p>{user.interests.join(", ")}</p>
        ) : (
          <p>No interests selected</p>
        )}
      </div>
    </div>
  );
}
