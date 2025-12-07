import React from "react";
import { motion } from "framer-motion";

export default function ProductModal({ product, onClose, onAdd }) {
  if (!product) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div className="modal-card" onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}>
        <div className="modal-left">
          <img src={product.img} alt={product.name} className="modal-image" />
        </div>
        <div className="modal-right">
          <h2>{product.name}</h2>
          <p className="muted">Category: {product.category}</p>
          <h3>₹{product.price.toLocaleString()}</h3>
          <p>{product.description}</p>
          <div style={{ marginTop: 12 }}>
            <button className="btn" onClick={() => { onAdd(product); onClose(); }}>Add to Cart</button>
            <button className="btn alt" onClick={onClose} style={{ marginLeft: 8 }}>Close</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
