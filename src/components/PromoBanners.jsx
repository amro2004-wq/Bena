import "./PromoBanners.css";

import { MapPin, ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import sellBox from "../assets/bena-sell-box.png";

function PromoBanners() {
  const navigate = useNavigate();

  return (
    <section className="promo-banners">
      {/* Nearby Products */}
      <div className="promo-card promo-nearby">
        <div className="nearby-visual">
          <div className="map-pattern"></div>

          <div className="map-pin">
            <MapPin />
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
            استكشف الآن
            <ArrowLeft size={14} />
          </button>
        </div>
      </div>

      {/* Sell Product */}
      <div className="promo-card promo-sell">
        <div className="sell-visual">
          <img src={sellBox} alt="بيع منتج على بينا" />
        </div>

        <div className="promo-content promo-content-dark">
          <span className="promo-label">عندك شيء ما بتستخدمه؟</span>

          <h3>حوّله لفرصة بيع على بينا</h3>

          <button
            type="button"
            className="promo-orange-btn"
            onClick={() => navigate("/sell")}
          >
            <Plus size={15} />
            ابدأ البيع الآن
          </button>
        </div>
      </div>
    </section>
  );
}

export default PromoBanners;
