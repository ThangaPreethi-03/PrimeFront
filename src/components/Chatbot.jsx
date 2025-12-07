import React, { useState, useRef, useEffect } from "react";
import "../styles/chatbot.css"; 

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! I'm PrimeBot 🤖 How can I assist you?" }
  ]);

  const bottomRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ALL Responses (offers + discounts + old FAQs)
  const replies = {
    // 🔥 OFFERS & DISCOUNTS
    offer: "🔥 Today's Offers:\n• 40% OFF on Wearables\n• 30% OFF on Audio\n• 20% OFF Shoes\n• Special Combos available!",
    offers: "🔥 Huge offers today! Check Wearables, Audio & Accessories categories.",
    discount: "💸 Discounts:\n• New users: 15% OFF\n• Orders above ₹2000: Auto 10% OFF\n• Festival Sale: Up to 50% OFF!",
    discounts: "💸 You get up to 50% OFF during our Mega Sale!",
    coupon: "🎟️ Coupon Codes:\n• PRIME10 – 10% OFF\n• PRIME20 – 20% OFF above ₹2500\n• FIRSTBUY – 15% OFF for new users",
    coupons: "🎟️ Available coupons: PRIME10, PRIME20, FIRSTBUY.",
    sale: "🔥 Mega Sale LIVE NOW! Huge discounts on Electronics, Wearables, Shoes!",
    deals: "✨ Best Deals Today:\n• Smartwatch from ₹1299\n• Earbuds from ₹799\n• Shoes from ₹699!",
    deal: "✨ Exclusive Deals: check the Deals section for more offers!",
    price: "💰 Prices vary based on stock & discount. See product page for final price.",
    cheapest: "💸 Cheapest deals today: Shoes from ₹649, Earbuds from ₹499!",

    // OLD FAQS (kept same)
    order: "To track your order, go to the 'Track Orders' page.",
    track: "Open the Track Orders page to see live status.",
    refund: "Refunds take 5–7 business days.",
    return: "Returns are accepted within 7 days of delivery.",
    payment: "If your payment failed, refund will be processed in 2–3 days.",
    delivery: "Delivery usually takes 3–5 business days.",
    help: "You can ask me about orders, offers, delivery, discounts… anything!"
  };

  // Reply finder
  const findReply = (msg) => {
    const text = msg.toLowerCase();
    for (let key in replies) {
      if (text.includes(key)) return replies[key];
    }
    return "I'm not sure I understand 😅 Try asking about offers, discounts, orders, refunds…";
  };

  // Send message
  const send = () => {
    if (!input.trim()) return;

    const userMsg = { from: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    const botReply = findReply(input);

    setTimeout(() => {
      setMessages((prev) => [...prev, { from: "bot", text: botReply }]);
    }, 350);

    setInput("");
  };

  return (
    <>
      {/* Floating button */}
      <button className="chat-btn" onClick={() => setOpen(!open)}>
        💬
      </button>

      {open && (
        <div className="chat-window">
          <div className="chat-header">
            <span>PrimeBot Assistant</span>
            <button className="chat-close" onClick={() => setOpen(false)}>✖</button>
          </div>

          <div className="chat-body">
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.from}`}>
                {m.text}
              </div>
            ))}
            <div ref={bottomRef}></div>
          </div>

          <div className="chat-footer">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask me anything…"
            />
            <button className="send" onClick={send}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}
