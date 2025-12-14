import React, { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import api from "../services/api";

/**
 * BillPage:
 * - Expects location.state.order (object returned by server) OR location.state.cart fallback
 * - Does NOT save order again (CartSidebar already saved it)
 * - Allows PDF download of the invoice view
 * - Optionally offers to resend email (if backend endpoint exists)
 */

export default function BillPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const ref = useRef(null);

  // Primary: order returned by server
  const order = state?.order || state?.orderData || null;

  // Fallback: if CartSidebar navigated with cart items only (older code),
  // create a temporary view (not persisted). Prefer migrated saved order.
  const fallbackCart = state?.cart || null;

  if (!order && !fallbackCart) {
    return (
      <div className="container" style={{ padding: 24 }}>
        <h2>No invoice data found</h2>
        <p>Please return to the shop and place an order.</p>
        <button className="btn" onClick={() => navigate("/shop")}>Go to Shop</button>
      </div>
    );
  }

  // If saved order exists, use it; otherwise build display from fallbackCart
  const display = order
    ? {
        invoiceNumber: order.invoiceNumber || order._id || "INV-UNKNOWN",
        date: new Date(order.createdAt || Date.now()).toLocaleString(),
        items: order.items || [],
        total: order.total || order?.grandTotal || 0,
        email: order.email || "guest@example.com",
        id: order._id || order.invoiceNumber || null,
      }
    : {
        invoiceNumber: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toLocaleString(),
        items: fallbackCart.map((c) => ({
          name: c.product.name,
          qty: c.qty,
          price: c.product.price,
          img: c.product.img,
        })),
        total: fallbackCart.reduce((s, it) => s + it.qty * it.product.price, 0),
        email: "guest@example.com",
        id: null,
      };

  const downloadPDF = async () => {
    if (!ref.current) return;
    try {
      const canvas = await html2canvas(ref.current, { scale: 3, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const pageHeight = (imgProps.height * pageWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
      pdf.save(`${display.invoiceNumber}.pdf`);
    } catch (err) {
      console.error("PDF error:", err);
      alert("Failed to generate PDF.");
    }
  };

  const resendEmail = async () => {
    // optional: backend should expose POST /orders/:id/email or /orders/email
    if (!display.id) {
      alert("No saved order to email.");
      return;
    }
    try {
      await api.post(`/orders/${display.id}/send-email`, { email: display.email });
      alert("Email queued (if backend supports it).");
    } catch (err) {
      console.error("Email resend failed:", err);
      alert("Failed to send email. Check server logs.");
    }
  };

  return (
    <div className="container" style={{ padding: 24 }}>
      <div ref={ref} className="card" style={{ padding: 20, borderRadius: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2>PrimeShop</h2>
            <div className="muted">Invoice: <strong>{display.invoiceNumber}</strong></div>
            <div className="muted">Date: {display.date}</div>
            <div className="muted">Email: {display.email}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <h3 style={{ margin: 0 }}>Total</h3>
            <h2 style={{ margin: 0 }}>₹{display.total}</h2>
          </div>
        </div>

        <hr style={{ margin: "16px 0" }} />

        <div>
          {display.items && display.items.length > 0 ? (
            display.items.map((it, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "8px 0" }}>
                {it.img && <img src={it.img} alt={it.name} style={{ width: 70, height: 70, objectFit: "cover", borderRadius: 8 }} />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{it.name}</div>
                  <div className="muted">Qty: {it.qty} × ₹{it.price}</div>
                </div>
                <div style={{ fontWeight: 700 }}>₹{(it.qty * it.price).toLocaleString()}</div>
              </div>
            ))
          ) : (
            <div className="muted">No items listed.</div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <button className="btn" onClick={downloadPDF}>📄 Download PDF</button>
        <button className="btn alt" onClick={() => navigate("/orders")}>View Orders</button>
        <button className="btn" onClick={resendEmail}>✉️ Resend Email</button>
      </div>
    </div>
  );
}
