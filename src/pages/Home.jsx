import React, { useEffect, useMemo, useState } from "react";
import ProductCard from "../components/ProductCard";
import api from "../services/api";
import FALLBACK_PRODUCTS from "../data/AllProducts";
import { useCart, useAuth } from "../App";
import ProductModal from "../components/ProductModal";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [maxPrice, setMaxPrice] = useState(100000);
  const [modal, setModal] = useState(null);

  const { addToCart } = useCart();
  const { user } = useAuth();

  const interests = user?.interests || [];

  /* ---------------- FETCH PRODUCTS ---------------- */
  useEffect(() => {
    let active = true;

    api
      .get("/products")
      .then((res) => {
        if (active && Array.isArray(res.data) && res.data.length > 0) {
          setProducts(res.data);
        } else {
          setProducts(FALLBACK_PRODUCTS);
        }
      })
      .catch(() => {
        if (active) setProducts(FALLBACK_PRODUCTS);
      });

    return () => (active = false);
  }, []);

  /* ---------------- CATEGORY LIST ---------------- */
  const categories = useMemo(() => {
    return ["All", ...Array.from(new Set(products.map((p) => p.category || "Other")))];
  }, [products]);

  /* ---------------- FILTER RESULTS ---------------- */
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();

    return products.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (p.price > maxPrice) return false;
      if (!q) return true;

      return (
        p.name.toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q)
      );
    });
  }, [products, query, category, maxPrice]);

  /* ---------------- AI RECOMMENDATIONS ---------------- */
  const recommended = useMemo(() => {
    if (!interests.length) return [];
    return products.filter((p) => interests.includes(p.category));
  }, [products, interests]);

  return (
    <div className="container home-wide">

      {/* ⭐ RECOMMENDED SECTION (ONLY ONCE) */}
      {recommended.length > 0 && (
        <>
          <h2 className="section-title">Recommended for You ⭐</h2>

          <div className="product-grid premium-grid">
            {recommended.map((p) => (
              <ProductCard
                key={p._id || p.id}
                product={p}
                onAdd={addToCart}
              />
            ))}
          </div>

          {/* ⭐ FILTER BAR BELOW RECOMMENDED */}
          <div
            className="card filter-bar"
            style={{
              padding: 20,
              borderRadius: 18,
              marginTop: 30,
              marginBottom: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 25,
              flexWrap: "nowrap",
              maxWidth: "900px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {/* Search */}
            <input
              className="auth-input"
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: "260px",
                borderRadius: 10,
                padding: "12px 14px",
              }}
            />

            {/* Category */}
            <select
              className="auth-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: "180px",
                borderRadius: 10,
                padding: "12px",
              }}
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>

            {/* Price Slider */}
            <div style={{ width: "260px" }}>
              <label style={{ fontWeight: 700 }}>
                Max Price:{" "}
                {maxPrice === 100000 ? "No limit" : `₹${maxPrice.toLocaleString()}`}
              </label>

              <input
                type="range"
                min="500"
                max="50000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                style={{ width: "100%", marginTop: 8 }}
              />
            </div>
          </div>
        </>
      )}

      {/* ---------------- PRODUCT GRID ---------------- */}
      <section className="products">
        <div className="resultsHeader">
          <h2>Products</h2>
          <div className="muted">{filtered.length} results</div>
        </div>

        <div className="product-grid premium-grid">
          {filtered.map((p) => (
            <ProductCard
              key={p._id || p.id}
              product={p}
              onAdd={(prod) => addToCart(prod)}
            />
          ))}
        </div>
      </section>

      {/* PRODUCT MODAL */}
      {modal && (
        <ProductModal
          product={modal}
          onClose={() => setModal(null)}
          onAdd={addToCart}
        />
      )}
    </div>
  );
}
