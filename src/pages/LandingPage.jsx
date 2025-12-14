// src/pages/LandingPage.jsx
import React, { useEffect, useRef } from "react";
import "../styles/landing.css";
import girlsImg from "../assets/girls.png";
import bgImg from "../assets/background.jpg";
import Home from "./Home";

/*
  Landing V4:
  - Canvas particle field
  - Neon 3D title
  - Camera zoom background
  - Girl rises from bottom
  - Smooth scroll-snap to the Home section
*/

export default function LandingPage() {
  const canvasRef = useRef(null);
  const cardRef = useRef(null);

  // Simple particle system (canvas)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const particles = [];
    const P = 80; // particle count

    function resetSize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resetSize);

    function rand(min, max) {
      return Math.random() * (max - min) + min;
    }

    for (let i = 0; i < P; i++) {
      particles.push({
        x: rand(0, w),
        y: rand(h * 0.25, h),
        r: rand(0.8, 3.2),
        vx: rand(-0.15, 0.15),
        vy: rand(-0.1, -0.6),
        alpha: rand(0.06, 0.28),
      });
    }

    let raf = null;
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (let p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += Math.sin(Date.now() / 2000 + p.r) * 0.002;
        if (p.y < -20 || p.x < -40 || p.x > w + 40) {
          p.x = rand(0, w);
          p.y = rand(h * 0.8, h + 60);
        }
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,235,200,${Math.max(0.02, Math.min(0.65, p.alpha))})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resetSize);
    };
  }, []);

  // mouse parallax / tilt for the card
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const onMove = (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx; // -1 .. 1
      const dy = (e.clientY - cy) / cy; // -1 .. 1
      const rx = dy * 6; // rotateX
      const ry = -dx * 8; // rotateY
      const tx = -dx * 14; // translateX subtle
      const ty = -dy * 10; // translateY subtle
      card.style.transform = `perspective(1300px) translate3d(${tx}px, ${ty}px, 0) rotateX(${rx}deg) rotateY(${ry}deg)`;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <>
      {/* full-screen hero with scroll-snap */}
      <section className="landing-snap-viewport">
        {/* canvas layer for particles */}
        <canvas ref={canvasRef} className="landing-canvas" />

        {/* background image zoom wrapper */}
        <div
          className="landing-bg"
          style={{ backgroundImage: `url(${bgImg})` }}
        />

        <div className="landing-hero">
          <div className="glass-card" ref={cardRef}>

            {/* LEFT */}
            <div className="left-section">
              <h1 className="neon-title">
                <span className="neon-prime">PRIME</span>
                <span className="neon-shop">SHOP</span>
              </h1>

              <p className="hero-slogan">
                Experience prime shopping with us — in an inexpensive way.
              </p>

              <div className="cta-row">
                <button
                  className="cta-primary"
                  onClick={() =>
                    window.scrollTo({ top: window.innerHeight, behavior: "smooth" })
                  }
                >
                  Shop Now
                </button>

                <a
                  className="cta-ghost"
                  href="#explore"
                  onClick={(e) => {
                    e.preventDefault();
                    window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
                  }}
                >
                  Explore
                </a>
              </div>
            </div>

            {/* RIGHT */}
            <div className="right-section">
              <div className="ring" aria-hidden />
              <img src={girlsImg} alt="Model" className="girl-img" />
            </div>
          </div>
        </div>
      </section>

      {/* Below: main site content (Home) with snap target id */}
      <main id="explore" className="below-site">
        <Home />
      </main>
    </>
  );
}
