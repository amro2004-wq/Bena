import "./PromoBanners.css";

import { MapPin, ArrowLeft, Plus } from "lucide-react";

import { useNavigate } from "react-router-dom";

import sellBox from "../assets/bena-sell-box.png";

function PromoBanners() {
  const navigate = useNavigate();

  return (
    <section className="promo-banners" aria-label="استكشف وبيع على بينا">
      {/* NEARBY */}

      <article className="promo-card promo-nearby">
        <div className="nearby-visual" aria-hidden="true">
          <div className="map-pattern" />

          <div className="map-pin">
            <MapPin size={48} strokeWidth={2.2} />
          </div>
        </div>

        <div className="promo-content promo-content-light">
          <h3>منتجات قريبة منك</h3>

          <p>
            اكتشف منتجات من حولك
            <br />
            في منطقتك بسهولة
          </p>

          <button
            type="button"
            className="promo-white-btn"
            onClick={() => navigate("/products")}
          >
            <span>استكشف الآن</span>

            <ArrowLeft size={14} aria-hidden="true" />
          </button>
        </div>
      </article>

      {/* SELL */}

      <article className="promo-card promo-sell">
        <div className="sell-visual" aria-hidden="true">
          <img src={sellBox} alt="" loading="lazy" />
        </div>

        <div className="promo-content promo-content-dark">
          <span className="promo-label">عندك شيء ما بتستخدمه؟</span>

          <h3>حوّله لفرصة بيع على بينا</h3>

          <button
            type="button"
            className="promo-orange-btn"
            onClick={() => navigate("/sell")}
          >
            <Plus size={15} aria-hidden="true" />

            <span>ابدأ البيع الآن</span>
          </button>
        </div>
      </article>
    </section>
  );
}

export default PromoBanners;
