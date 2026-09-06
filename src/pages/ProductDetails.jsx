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
  Pencil,
} from "lucide-react";

import Toast from "../components/Toast";

function ProductDetails() {
  const { id } = useParams();

  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("benaCurrentUser"));

  const userId = currentUser ? String(currentUser.id) : null;

  const savedProducts = JSON.parse(localStorage.getItem("benaProducts")) || [];

  const products = [...savedProducts, ...defaultProducts];

  const product = products.find((item) => Number(item.id) === Number(id));

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [isFavorite, setIsFavorite] = useState(() => {
    if (!userId) {
      return false;
    }

    const allFavorites =
      JSON.parse(localStorage.getItem("benaFavorites")) || {};

    if (Array.isArray(allFavorites)) {
      return false;
    }

    const userFavorites = allFavorites[userId] || [];

    return userFavorites.some((item) => Number(item) === Number(id));
  });

  const showToast = (message, type = "success") => {
    setToast({
      show: true,
      message,
      type,
    });

    setTimeout(() => {
      setToast((current) => ({
        ...current,
        show: false,
      }));
    }, 2200);
  };

  const isOwner =
    product?.sellerId &&
    currentUser &&
    Number(product.sellerId) === Number(currentUser.id);

  const requireLogin = (callback) => {
    if (!currentUser) {
      showToast("سجل دخولك أولاً للمتابعة", "info");

      setTimeout(() => {
        navigate("/login", {
          state: {
            from: `/products/${id}`,
          },
        });
      }, 650);

      return;
    }

    callback();
  };

  const toggleFavorite = () => {
    requireLogin(() => {
      if (isOwner) {
        showToast("هذا المنتج تابع لك", "info");

        return;
      }

      const allFavorites =
        JSON.parse(localStorage.getItem("benaFavorites")) || {};

      const favoritesObject = Array.isArray(allFavorites) ? {} : allFavorites;

      const userFavorites = favoritesObject[userId] || [];

      const exists = userFavorites.some(
        (item) => Number(item) === Number(product.id),
      );

      const updatedUserFavorites = exists
        ? userFavorites.filter((item) => Number(item) !== Number(product.id))
        : [...userFavorites, product.id];

      const updatedAllFavorites = {
        ...favoritesObject,

        [userId]: updatedUserFavorites,
      };

      localStorage.setItem(
        "benaFavorites",
        JSON.stringify(updatedAllFavorites),
      );

      setIsFavorite(!exists);

      showToast(
        exists ? "تمت إزالة المنتج من المفضلة" : "تمت إضافة المنتج للمفضلة ✓",
        exists ? "info" : "success",
      );
    });
  };

  const handleMessageSeller = () => {
    requireLogin(() => {
      if (isOwner) {
        showToast("هذا المنتج تابع لك", "info");

        return;
      }

      navigate(`/messages/${product.id}`);
    });
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);

      showToast("تم نسخ رابط المنتج ✓", "success");
    } catch {
      showToast("تعذر نسخ رابط المنتج", "error");
    }
  };

  if (!product) {
    return (
      <div className="product-not-found" dir="rtl">
        <h2>المنتج غير موجود</h2>

        <button type="button" onClick={() => navigate("/products")}>
          العودة للمنتجات
        </button>
      </div>
    );
  }

  return (
    <main className="product-details-page" dir="rtl">
      <Toast show={toast.show} message={toast.message} type={toast.type} />

      <div className="product-details-container">
        <button
          type="button"
          className="product-back-btn"
          onClick={() => navigate(-1)}
        >
          <ArrowRight size={18} />
          العودة
        </button>

        <div className="product-details-grid">
          <div className="product-gallery">
            <div className="product-main-image">
              <img src={product.image} alt={product.name} />

              <span className={`details-condition ${product.conditionClass}`}>
                {product.condition}
              </span>

              {!isOwner && (
                <button
                  type="button"
                  className="details-favorite"
                  aria-label={isFavorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}
                  onClick={toggleFavorite}
                >
                  <Heart
                    size={21}
                    fill={isFavorite ? "currentColor" : "none"}
                  />
                </button>
              )}
            </div>
          </div>

          <div className="product-info">
            <div className="product-info-top">
              <div>
                <span className="product-category">
                  {product.category || "أخرى"}
                </span>

                <h1>{product.name}</h1>
              </div>

              <button
                type="button"
                className="share-button"
                aria-label="مشاركة"
                onClick={handleShare}
              >
                <Share2 size={18} />
              </button>
            </div>

            <div className="details-price">
              <strong>{Number(product.price).toLocaleString()}</strong>

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

            <div className="product-description">
              <h3>وصف المنتج</h3>

              <p>{product.description || "لا يوجد وصف لهذا المنتج."}</p>
            </div>

            <div className="details-divider"></div>

            <div className="seller-section">
              <h3>معلومات البائع</h3>

              <div className="seller-card">
                <div className="seller-avatar">
                  <UserRound size={25} />
                </div>

                <div className="seller-info">
                  <strong>
                    {isOwner
                      ? `${currentUser.name} - أنت`
                      : product.sellerName || "بائع على بينا"}
                  </strong>

                  <span>
                    <ShieldCheck size={14} />

                    {isOwner ? "هذا المنتج تابع لك" : "حساب على منصة بينا"}
                  </span>
                </div>
              </div>
            </div>

            <div className="product-actions">
              {isOwner ? (
                <button
                  type="button"
                  className="message-seller-btn"
                  onClick={() => navigate(`/edit-product/${product.id}`)}
                >
                  <Pencil size={19} />
                  تعديل المنتج
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="message-seller-btn"
                    onClick={handleMessageSeller}
                  >
                    <MessageCircle size={19} />
                    مراسلة البائع
                  </button>

                  <button
                    type="button"
                    className="favorite-product-btn"
                    onClick={toggleFavorite}
                  >
                    <Heart
                      size={19}
                      fill={isFavorite ? "currentColor" : "none"}
                    />

                    {isFavorite ? "تمت الإضافة للمفضلة" : "إضافة للمفضلة"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ProductDetails;
