import React, { useRef, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import api from "../services/api";
import { useAuth } from "../App";

export default function BillPage() {
  const { state } = useLocation();
  const cart = state?.cart || [];
  const billRef = useRef();

  const { user } = useAuth();
  const userId = user?.id || user?._id;

  // Generate invoice number & date
  const invoiceNumber = "INV-" + Math.floor(Math.random() * 900000 + 100000);
  const today = new Date().toLocaleDateString();

  const grandTotal = cart.reduce(
    (sum, item) => sum + item.qty * item.product.price,
    0
  );

  // ⭐ FIXED SAVE ORDER FUNCTION
  const saveOrder = async () => {
    try {
      const items = cart.map((item) => ({
        name: item.product.name,
        price: item.product.price,
        qty: item.qty,
        productId: item.product._id || item.product.id,
      }));

      await api.post("/orders", {
        invoiceNumber,
        email: user?.email || "guest@example.com",
        userId: userId || null, // ⭐ Important: attach userId
        items,
        total: grandTotal,
        status: "Placed",
      });

      console.log("✅ Order saved successfully!");
    } catch (err) {
      console.error("❌ Save Order Error:", err);
    }
  };

  // Save order once
  useEffect(() => {
    saveOrder();
  }, []);

  // Download PDF
  const downloadPDF = async () => {
    const canvas = await html2canvas(billRef.current, {
      scale: 3,
      useCORS: true,
      backgroundColor: null,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Invoice_${invoiceNumber}.pdf`);
  };

  return (
    <div className="container" style={{ marginTop: 20 }}>
      <div
        ref={billRef}
        className="card"
        style={{
          padding: 28,
          borderRadius: 24,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.85), rgba(255,240,230,0.9))",
          boxShadow: "0 25px 70px rgba(255,170,120,0.25)",
        }}
      >
        <h2>🛍️ PrimeShop</h2>
        <p className="muted">Premium Shopping Experience</p>

        <hr style={{ margin: "18px 0" }} />

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <p><b>Invoice No:</b> {invoiceNumber}</p>
          <p><b>Date:</b> {today}</p>
        </div>

        <table style={{ width: "100%", marginTop: 10, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #eee" }}>
              <th align="left" style={{ padding: 8 }}>Product</th>
              <th align="center" style={{ padding: 8 }}>Qty</th>
              <th align="center" style={{ padding: 8 }}>Price</th>
              <th align="center" style={{ padding: 8 }}>Total</th>
            </tr>
          </thead>

          <tbody>
            {cart.map((item) => (
              <tr key={item.product.id} style={{ borderBottom: "1px solid #f2f2f2" }}>
                <td style={{ padding: 8 }}>{item.product.name}</td>
                <td align="center">{item.qty}</td>
                <td align="center">₹{item.product.price.toLocaleString()}</td>
                <td align="center">
                  ₹{(item.qty * item.product.price).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3
          style={{
            marginTop: 20,
            textAlign: "right",
            background: "linear-gradient(90deg, #ff8a00, #ff6f00)",
            WebkitBackgroundClip: "text",
            color: "transparent",
            fontWeight: 900,
          }}
        >
          Grand Total: ₹{grandTotal.toLocaleString()}
        </h3>
      </div>

      <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
        <button className="btn" onClick={downloadPDF}>📄 Download PDF</button>
        <Link to="/" className="btn alt">Continue Shopping</Link>
      </div>
    </div>
  );
}
