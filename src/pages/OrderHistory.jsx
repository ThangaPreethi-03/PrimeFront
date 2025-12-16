import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function OrderHistory() {
  const { user } = useAuth();
  const userId = user?.id;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await api.get(`/orders/user/${userId}`);
        setOrders(res.data || []);
      } catch (err) {
        console.error("Order fetch failed", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  if (!userId) {
    return <p>Please login to see your orders.</p>;
  }

  if (loading) {
    return <p>Loading your orders...</p>;
  }

  if (orders.length === 0) {
    return <p>You haven't placed any orders yet.</p>;
  }

  return (
    <div className="container">
      <h2>My Orders</h2>

      {orders.map((o) => (
        <div key={o._id} className="order-card-premium">
          <h4>Invoice: {o.invoiceNumber}</h4>
          <p>Status: {o.status}</p>
          <p>Total: ₹{o.total}</p>
          <p>{new Date(o.createdAt).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
