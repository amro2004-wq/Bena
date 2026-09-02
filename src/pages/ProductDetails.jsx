import "./ProductDetails.css";
import { defaultProducts } from "../data/products";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Heart,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Clock,
  Share2,
  UserRound,
} from "lucide-react";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(() => {
    const savedFavorites =
      JSON.parse(localStorage.getItem("benaFavorites")) || [];

    return savedFavorites.some((item) => Number(item) === Number(id));
  });
  const savedProducts = JSON.parse(localStorage.getItem("benaProducts")) || [];
  const toggleFavorite = () => {
    const savedFavorites =
      JSON.parse(localStorage.getItem("benaFavorites")) || [];

    const exists = savedFavorites.some(
      (item) => Number(item) === Number(product.id),
    );

    const updatedFavorites = exists
      ? savedFavorites.filter((item) => Number(item) !== Number(product.id))
      : [...savedFavorites, product.id];

    localStorage.setItem("benaFavorites", JSON.stringify(updatedFavorites));

    setIsFavorite(!exists);
  };
  const products = [...savedProducts, ...defaultProducts];

  const product = products.find((item) => Number(item.id) === Number(id));
  if (!product) {
    return (
      <div className="product-not-found" dir="rtl">
        <h2>المنتج غير موجود</h2>

        <button onClick={() => navigate("/products")}>العودة للمنتجات</button>
      </div>
    );
  }

  return (
    <main className="product-details-page" dir="rtl">
      <div className="product-details-container">
        {/* Back */}
        <button
          type="button"
          className="product-back-btn"
          onClick={() => navigate(-1)}
        >
          <ArrowRight size={18} />
          العودة
        </button>

        <div className="product-details-grid">
          {/* Product Image */}
          <div className="product-gallery">
            <div className="product-main-image">
              <img src={product.image} alt={product.name} />

              <span className={`details-condition ${product.conditionClass}`}>
                {product.condition}
              </span>

              <button
                type="button"
                className="details-favorite"
                aria-label="إضافة للمفضلة"
                onClick={toggleFavorite}
              >
                <Heart size={21} fill={isFavorite ? "currentColor" : "none"} />
              </button>
            </div>
          </div>

          {/* Product Information */}
          <div className="product-info">
            <div className="product-info-top">
              <div>
                <span className="product-category">{product.category}</span>
                <h1>{product.name}</h1>
              </div>

              <button
                type="button"
                className="share-button"
                aria-label="مشاركة"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("تم نسخ رابط المنتج");
                }}
              >
                <Share2 size={18} />
              </button>
            </div>

            <div className="details-price">
              <strong>{product.price}</strong>
              <span>₪</span>
            </div>

            <div className="details-meta">
              <div>
                <MapPin size={17} />
                <span>{product.location}</span>
              </div>

              <div>
                <Clock size={17} />
                <span>نُشر حديثًا</span>
              </div>
            </div>

            <div className="details-divider"></div>

            {/* Description */}
            <div className="product-description">
              <h3>وصف المنتج</h3>
              <p>{product.description}</p>
            </div>

            <div className="details-divider"></div>

            {/* Seller */}
            <div className="seller-section">
              <h3>معلومات البائع</h3>

              <div className="seller-card">
                <div className="seller-avatar">
                  <UserRound size={25} />
                </div>

                <div className="seller-info">
                  <strong>بائع على بينا</strong>

                  <span>
                    <ShieldCheck size={14} />
                    حساب موثوق
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="product-actions">
              <button
                type="button"
                className="message-seller-btn"
                onClick={() => navigate(`/messages/${product.id}`)}
              >
                <MessageCircle size={19} />
                مراسلة البائع
              </button>
              <button
                type="button"
                className="favorite-product-btn"
                onClick={toggleFavorite}
              >
                <Heart size={19} fill={isFavorite ? "currentColor" : "none"} />

                {isFavorite ? "تمت الإضافة للمفضلة" : "إضافة للمفضلة"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ProductDetails;
