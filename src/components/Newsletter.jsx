import "./Newsletter.css";

import { useEffect, useRef, useState } from "react";

import { Mail } from "lucide-react";

import benaLogo from "../assets/bena-logo.png";
import googlePlayBadge from "../assets/google-play-badge.svg";
import appStoreBadge from "../assets/app-store-badge.svg";

function Newsletter() {
  const [email, setEmail] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const messageTimerRef = useRef(null);

  /* MESSAGE */

  const showMessage = (text, type) => {
    if (messageTimerRef.current) {
      clearTimeout(messageTimerRef.current);
    }

    setMessage(text);
    setMessageType(type);

    messageTimerRef.current = setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (messageTimerRef.current) {
        clearTimeout(messageTimerRef.current);
      }
    };
  }, []);

  /* SUBSCRIBE */

  const handleSubscribe = (event) => {
    event.preventDefault();

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      showMessage("أدخل بريدك الإلكتروني", "error");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      showMessage("أدخل بريد إلكتروني صحيح", "error");
      return;
    }

    showMessage("تم الاشتراك بنجاح ✓", "success");

    setEmail("");
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);

    if (message) {
      setMessage("");
      setMessageType("");

      if (messageTimerRef.current) {
        clearTimeout(messageTimerRef.current);
        messageTimerRef.current = null;
      }
    }
  };

  return (
    <section
      className="newsletter"
      dir="rtl"
      aria-labelledby="newsletter-title"
    >
      {/* TEXT */}

      <div className="newsletter-text">
        <h3 id="newsletter-title">اشترك في نشرتنا البريدية</h3>

        <p>احصل على أحدث العروض والمنتجات الجديدة أول بأول</p>
      </div>

      {/* SUBSCRIBE */}

      <form className="subscribe-area" onSubmit={handleSubscribe} noValidate>
        <div className="email-field">
          <Mail size={14} aria-hidden="true" />

          <input
            type="email"
            name="email"
            placeholder="أدخل بريدك الإلكتروني"
            aria-label="البريد الإلكتروني"
            aria-describedby={message ? "subscribe-message" : undefined}
            aria-invalid={messageType === "error"}
            autoComplete="email"
            inputMode="email"
            maxLength={120}
            value={email}
            onChange={handleEmailChange}
          />
        </div>

        <button type="submit" className="subscribe-btn">
          اشترك
        </button>

        {message && (
          <span
            id="subscribe-message"
            className={`subscribe-message ${messageType}`}
            role={messageType === "error" ? "alert" : "status"}
            aria-live="polite"
          >
            {message}
          </span>
        )}
      </form>

      {/* APP */}

      <div className="app-section">
        <div className="app-phone" aria-hidden="true">
          <div className="phone-notch" />

          <div className="phone-screen">
            <img src={benaLogo} alt="" />
          </div>
        </div>

        <div className="app-details">
          <h3>حمّل تطبيق بينا</h3>

          <p>تجربة أفضل في التطبيق</p>

          <div
            className="store-buttons"
            aria-label="تطبيق بينا قريبًا على متاجر التطبيقات"
          >
            <img
              src={googlePlayBadge}
              alt="Google Play"
              className="store-badge google-badge"
            />

            <img
              src={appStoreBadge}
              alt="App Store"
              className="store-badge apple-badge"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Newsletter;
