import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../App";
import api from "../services/api";

export default function OrderTracking() {
  const { user } = useAuth();
  const userId = user?.id || user?._id;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [activeOrder, setActiveOrder] = useState(null);

  const fetchOrders = async () => {
    if (!userId) return;

    try {
      const res = await api.get(`/orders/user/${userId}`);
      setOrders(res.data || []);
    } catch {
      setOrders([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    const t = setInterval(fetchOrders, 5000);
    return () => clearInterval(t);
  }, []);

  const filtered = useMemo(() => {
    let list = orders;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (o) =>
          o.invoiceNumber.toLowerCase().includes(q) ||
          o.items.some((it) => it.name.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== "All") {
      list = list.filter((o) => o.status === statusFilter);
    }

    return list;
  }, [orders, search, statusFilter]);

  const statusColor = {
    Placed: "#888",
    Processing: "#ff9800",
    Shipped: "#007bff",
    Delivered: "#2ea44f",
    Cancelled: "#e55353",
  };

  return (
    <div className="container" style={{ paddingTop: 20 }}>
      <h2 className="page-title gradient-text">Track My Orders</h2>

      {/* Filters */}
      <div className="tracking-filters card-premium" style={{ marginBottom: "30px" }}>

        <input
          className="auth-input"
          placeholder="Search invoice or product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="auth-input"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>All</option>
          <option>Placed</option>
          <option>Processing</option>
          <option>Shipped</option>
          <option>Delivered</option>
          <option>Cancelled</option>
        </select>
      </div>

      {loading ? (
        <p className="muted">Loading orders...</p>
      ) : filtered.length === 0 ? (
        <p className="muted">No matching orders found.</p>
      ) : (
        <div className="tracking-list">
          {filtered.map((o) => (
            <div
              key={o._id}
              className="tracking-card"
              onClick={() => setActiveOrder(o)}
            >
              <div className="tracking-header">
                <strong className="invoice">#{o.invoiceNumber}</strong>

                <span
                  className="status-pill"
                  style={{ background: statusColor[o.status] }}
                >
                  {o.status}
                </span>
              </div>

              <span className="muted small">
                {new Date(o.createdAt).toLocaleString()}
              </span>

              <div className="tracking-item-truncate">
                {o.items.map((it) => it.name).join(", ")}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order popup */}
{activeOrder && (
  <div
    className="modal-overlay"
    onClick={() => setActiveOrder(null)}
  >
    <div
      className="order-popup"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="popup-title">Order Details</h2>
      <p className="popup-invoice">#{activeOrder.invoiceNumber}</p>

      <div className="popup-section">
        {activeOrder.items.map((it, i) => (
          <div key={i} className="popup-item">
            <div className="popup-item-left">
              <span className="popup-item-name">{it.name}</span>
              <span className="popup-item-qty">Qty: {it.qty}</span>
            </div>
            <span className="popup-item-price">
              ₹{(it.price * it.qty).toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      <div className="popup-total">
        <span>Total</span>
        <strong>₹{activeOrder.total.toLocaleString()}</strong>
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <button
          className="btn popup-close"
          onClick={() => setActiveOrder(null)}
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
