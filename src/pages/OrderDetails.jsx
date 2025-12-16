import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

export default function OrderDetails() {
  const { invoiceNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const res = await api.get(`/orders/track/${invoiceNumber}`);
        setOrder(res.data);
      } catch (err) {
        console.error("Failed to load order details", err);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [invoiceNumber]);

  if (loading) return <h3>Loading order details...</h3>;
  if (!order) return <h3>Order not found</h3>;

  return (
    <div className="container">
      <h2>Order Details</h2>

      <div className="card">
        <p><strong>Invoice:</strong> {order.invoiceNumber}</p>
        <p><strong>Status:</strong> {order.status}</p>
        <p>
          <strong>Date:</strong>{" "}
          {new Date(order.createdAt).toLocaleString()}
        </p>
      </div>

      <h3 style={{ marginTop: 20 }}>Products</h3>

      <div className="order-items-list">
        {order.items.map((item, i) => (
          <div key={i} className="order-item">
            <img
              src={item.img || "/images/default.jpg"}
              alt={item.name}
              style={{
                width: 70,
                height: 70,
                objectFit: "cover",
                borderRadius: 8,
                marginRight: 12,
              }}
            />

            <div style={{ flex: 1 }}>
              <div><strong>{item.name}</strong></div>
              <div>
                ₹{item.price} × {item.qty}
              </div>
            </div>

            <div>
              ₹{item.price * item.qty}
            </div>
          </div>
        ))}
      </div>

      <h3 style={{ marginTop: 20 }}>
        Total: ₹{order.total}
      </h3>
    </div>
  );
}
