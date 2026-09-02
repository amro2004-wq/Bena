import "./Newsletter.css";

import { useState } from "react";
import { Mail } from "lucide-react";

import benaLogo from "../assets/bena-logo.png";
import googlePlayBadge from "../assets/google-play-badge.svg";
import appStoreBadge from "../assets/app-store-badge.svg";

function Newsletter() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setMessage("أدخل بريدك الإلكتروني");
      setMessageType("error");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      setMessage("أدخل بريد إلكتروني صحيح");
      setMessageType("error");
      return;
    }

    setMessage("تم الاشتراك بنجاح ✓");
    setMessageType("success");
    setEmail("");
  };

  return (
    <section className="newsletter" dir="rtl">
      <div className="newsletter-text">
        <h3>اشترك في نشرتنا البريدية</h3>

        <p>احصل على أحدث العروض والمنتجات الجديدة أول بأول</p>
      </div>

      <form className="subscribe-area" onSubmit={handleSubscribe}>
        <div className="email-field">
          <Mail size={14} />

          <input
            type="email"
            placeholder="أدخل بريدك الإلكتروني"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setMessage("");
              setMessageType("");
            }}
          />
        </div>

        <button type="submit" className="subscribe-btn">
          اشترك
        </button>

        {message && (
          <span className={`subscribe-message ${messageType}`}>{message}</span>
        )}
      </form>

      <div className="app-section">
        <div className="app-phone">
          <div className="phone-notch"></div>

          <div className="phone-screen">
            <img src={benaLogo} alt="بينا" />
          </div>
        </div>

        <div className="app-details">
          <h3>حمّل تطبيق بينا</h3>

          <p>تجربة أفضل في التطبيق</p>

          <div className="store-buttons">
            <img
              src={googlePlayBadge}
              alt="Get it on Google Play"
              className="store-badge google-badge"
            />

            <img
              src={appStoreBadge}
              alt="Download on the App Store"
              className="store-badge apple-badge"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Newsletter;
