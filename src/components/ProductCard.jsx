import React from "react";
import { Link } from "react-router-dom";

export default function ProductCard({ product, onAdd }) {
  
  const productId = product.id || product._id;

  return (
    <div className="product-card">
      <Link to={`/product/${productId}`} className="product-image-wrap">
        <img
          src={product.img}
          alt={product.name}
          className="product-image"
          onError={(e) => (e.target.src = "/images/default.jpg")}
        />
      </Link>

      <div className="product-info">
        <Link to={`/product/${productId}`} className="product-name">
          {product.name}
        </Link>

        <div className="product-category">{product.category}</div>

        <div className="product-bottom">
          <div className="product-price">
            ₹{product.price?.toLocaleString()}
          </div>

          <button className="add-btn premium-add" onClick={() => onAdd(product)}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
