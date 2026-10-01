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
  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="about"
      className="footer"
      dir="rtl"
      aria-label="تذييل موقع بينا"
    >
      <div className="footer-content">
        {/* BRAND */}

        <div className="footer-brand">
          <Link
            to="/"
            className="footer-logo-link"
            aria-label="العودة إلى الصفحة الرئيسية"
          >
            <img src={benaLogo} alt="بينا" className="footer-logo" />
          </Link>

          <p className="footer-tagline">من الناس ... للناس</p>

          <p className="footer-copy">جميع الحقوق محفوظة © {currentYear} بينا</p>
        </div>

        {/* ABOUT */}

        <nav className="footer-column" aria-label="عن بينا">
          <h4>عن بينا</h4>

          <Link to="/info/about">من نحن</Link>

          <Link to="/info/privacy">سياسة الخصوصية</Link>

          <Link to="/info/terms">الشروط والأحكام</Link>
        </nav>

        {/* HELP */}

        <nav className="footer-column" aria-label="المساعدة">
          <h4>المساعدة</h4>

          <Link to="/info/faq">الأسئلة الشائعة</Link>

          <Link to="/info/guide">دليل الاستخدام</Link>

          <Link to="/info/contact">تواصل معنا</Link>
        </nav>

        {/* SELLERS */}

        <nav className="footer-column" aria-label="معلومات للبائعين">
          <h4>للبائعين</h4>

          <Link to="/info/how-to-sell">كيف أبيع؟</Link>

          <Link to="/info/fees">العمولة والرسوم</Link>

          <Link to="/info/selling-tips">نصائح للبيع</Link>
        </nav>

        {/* SOCIAL */}

        <div className="footer-social" aria-label="حسابات التواصل الاجتماعي">
          <a
            href="https://www.instagram.com/amro___radwan/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="بينا على إنستغرام"
            title="Instagram"
          >
            <FaInstagram aria-hidden="true" />
          </a>

          <a
            href="https://www.facebook.com/amro.radwan.2025"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="بينا على فيسبوك"
            title="Facebook"
          >
            <FaFacebookF aria-hidden="true" />
          </a>

          <a
            href="https://wa.me/970597227016"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="تواصل مع بينا عبر واتساب"
            title="WhatsApp"
          >
            <FaWhatsapp aria-hidden="true" />
          </a>

          <a
            href="https://t.me/amro_redwan"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="بينا على تيليجرام"
            title="Telegram"
          >
            <FaTelegramPlane aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
