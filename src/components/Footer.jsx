import "./Footer.css";

import {
  FaInstagram,
  FaFacebookF,
  FaWhatsapp,
  FaTelegramPlane,
} from "react-icons/fa";

import { Link } from "react-router-dom";
import benaLogo from "../assets/bena-logo.png";

function Footer() {
  return (
    <footer id="about" className="footer" dir="rtl">
      <div className="footer-content">
        {/* Brand */}
        <div className="footer-brand">
          <img src={benaLogo} alt="بينا" className="footer-logo" />

          <p className="footer-tagline">من الناس ... للناس</p>

          <p className="footer-copy">جميع الحقوق محفوظة © 2026 بينا</p>
        </div>

        {/* About */}
        <div className="footer-column">
          <h4>عن بينا</h4>

          <Link to="/info/about">من نحن</Link>
          <Link to="/info/privacy">سياسة الخصوصية</Link>
          <Link to="/info/terms">الشروط والأحكام</Link>
        </div>

        {/* Help */}
        <div className="footer-column">
          <h4>المساعدة</h4>

          <Link to="/info/faq">الأسئلة الشائعة</Link>
          <Link to="/info/guide">دليل الاستخدام</Link>
          <Link to="/info/contact">تواصل معنا</Link>
        </div>

        {/* Sellers */}
        <div className="footer-column">
          <h4>للبائعين</h4>

          <Link to="/info/how-to-sell">كيف أبيع؟</Link>
          <Link to="/info/fees">العمولة والرسوم</Link>
          <Link to="/info/selling-tips">نصائح للبيع</Link>
        </div>

        {/* Social */}
        <div className="footer-social">
          <a
            href="https://www.instagram.com/amro___radwan/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <FaInstagram />
          </a>

          <a
            href="https://www.facebook.com/amro.radwan.2025"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
          >
            <FaFacebookF />
          </a>

          <a
            href="https://wa.me/970597227016"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
          >
            <FaWhatsapp />
          </a>

          <a
            href="https://t.me/amro_redwan"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Telegram"
          >
            <FaTelegramPlane />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
