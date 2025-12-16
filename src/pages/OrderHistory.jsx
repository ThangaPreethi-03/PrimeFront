import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function OrderHistory() {
  const { user } = useAuth();
  const userId = user?.id;
  const navigate = useNavigate();

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

  if (!userId) return <p>Please login to see your orders.</p>;
  if (loading) return <p>Loading your orders...</p>;

  return (
    <div className="container">
      <h2>My Orders</h2>

      {orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        <div className="orders-grid">
          {orders.map((o) => (
            <div
              key={o._id}
              className="order-card-premium clickable"
              onClick={() =>
                navigate(`/orders/${o.invoiceNumber}`)
              }
            >
              <div className="order-header">
                <h3>#{o.invoiceNumber}</h3>
                <span>{o.status}</span>
              </div>

              <p>{new Date(o.createdAt).toLocaleString()}</p>
              <p><strong>Total:</strong> ₹{o.total}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
