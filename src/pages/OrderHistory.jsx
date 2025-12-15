import React, { useEffect, useState } from "react";
import { useAuth } from "../App";
import api from "../services/api";

export default function OrderHistory() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = user?.id || user?._id;

useEffect(() => {
  if (!user?.id) return;

  const fetchOrders = async () => {
    try {
      const res = await api.get(`/orders/user/${user.id}`);
      setOrders(res.data || []);
    } catch (err) {
      console.error("Order fetch failed", err);
    }
  };

  fetchOrders();
}, [user]);


  if (!userId)
    return (
      <div className="container page-center">
        <h2 className="page-title">My Orders</h2>
        <p className="muted">Please login to see your orders.</p>
      </div>
    );

  if (loading)
    return (
      <div className="container page-center">
        <h2 className="page-title">Loading your orders...</h2>
      </div>
    );

  return (
    <div className="container" style={{ paddingTop: 20 }}>
      <h2 className="page-title gradient-text">My Orders</h2>

      {orders.length === 0 ? (
        <p className="muted">You haven't placed any orders yet.</p>
      ) : (
        <div className="orders-grid">
          {orders.map((o) => (
            <div key={o._id} className="order-card-premium">
              <div className="order-header">
                <h3 className="invoice">#{o.invoiceNumber}</h3>
                <span className="status-badge" data-status={o.status}>
                  {o.status}
                </span>
              </div>

              <div className="order-date">
                {new Date(o.createdAt).toLocaleString()}
              </div>

              <hr className="divider" />

              <div className="order-items-list">
                {o.items.map((it, i) => (
                  <div key={i} className="order-item">
                    <div className="item-name">{it.name}</div>
                    <div className="item-qty">x{it.qty}</div>
                    <div className="item-total">
                      ₹{(it.qty * it.price).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <hr className="divider" />

              <div className="order-total-line">
                <span>Total</span>
                <strong>₹{o.total.toLocaleString()}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
