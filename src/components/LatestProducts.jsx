import "./LatestProducts.css";

import { defaultProducts } from "../data/products";

import { Heart, ChevronLeft, ChevronRight, MapPin } from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";

import Toast from "../components/Toast";

function LatestProducts() {
  const navigate = useNavigate();

  const sliderRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("benaCurrentUser"));

  const userId = currentUser ? String(currentUser.id) : null;

  const [favorites, setFavorites] = useState(() => {
    if (!userId) {
      return [];
    }

    const allFavorites =
      JSON.parse(localStorage.getItem("benaFavorites")) || {};

    if (Array.isArray(allFavorites)) {
      return [];
    }

    return allFavorites[userId] || [];
  });

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const savedProducts = JSON.parse(localStorage.getItem("benaProducts")) || [];

  /* PRODUCTS */

  const products = [...savedProducts, ...defaultProducts].sort(
    (a, b) => Number(b.id) - Number(a.id),
  );

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

  const openProduct = (id) => {
    navigate(`/products/${id}`);
  };

  const isOwner = (product) => {
    if (!currentUser || !product?.sellerId) {
      return false;
    }

    return Number(product.sellerId) === Number(currentUser.id);
  };

  const isFavorite = (id) => {
    return favorites.some((item) => Number(item) === Number(id));
  };

  const toggleFavorite = (id) => {
    if (!currentUser) {
      showToast("سجل دخولك أولاً لإضافة المنتجات للمفضلة", "info");

      setTimeout(() => {
        navigate("/login", {
          state: {
            from: window.location.pathname + window.location.search,
          },
        });
      }, 650);

      return;
    }

    setFavorites((current) => {
      const exists = current.some((item) => Number(item) === Number(id));

      const updated = exists
        ? current.filter((item) => Number(item) !== Number(id))
        : [...current, id];

      const allFavorites =
        JSON.parse(localStorage.getItem("benaFavorites")) || {};

      const favoritesObject = Array.isArray(allFavorites) ? {} : allFavorites;

      const updatedAllFavorites = {
        ...favoritesObject,
        [userId]: updated,
      };

      localStorage.setItem(
        "benaFavorites",
        JSON.stringify(updatedAllFavorites),
      );

      showToast(
        exists ? "تمت إزالة المنتج من المفضلة" : "تمت إضافة المنتج للمفضلة ✓",
        exists ? "info" : "success",
      );

      return updated;
    });
  };

  const scrollSlider = (direction) => {
    if (!sliderRef.current) {
      return;
    }

    const card = sliderRef.current.querySelector(".product-card");

    if (!card) {
      return;
    }

    const cardWidth = card.offsetWidth + 18;

    sliderRef.current.scrollBy({
      left: direction === "left" ? -cardWidth : cardWidth,

      behavior: "smooth",
    });
  };

  return (
    <section id="latest-products" className="latest-products" dir="rtl">
      <Toast show={toast.show} message={toast.message} type={toast.type} />

      <div className="latest-products__header">
        <h2>
          <span></span>
          أحدث المنتجات
        </h2>

        <button
          type="button"
          className="view-all-btn"
          onClick={() => navigate("/products")}
        >
          عرض الكل
          <ChevronLeft size={16} />
        </button>
      </div>

      <div className="products-wrapper">
        {/* RIGHT ARROW */}

        <button
          type="button"
          className="slider-arrow slider-arrow--right"
          aria-label="تحريك لليمين"
          onClick={() => scrollSlider("right")}
        >
          <ChevronRight size={22} />
        </button>

        <div className="products-grid" ref={sliderRef}>
          {products.map((product) => (
            <article
              className="product-card"
              key={product.id}
              onClick={() => openProduct(product.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  openProduct(product.id);
                }
              }}
            >
              <div className="product-card__image">
                <img src={product.image} alt={product.name} />

                {!isOwner(product) && (
                  <button
                    type="button"
                    className={`product-card__favorite ${
                      isFavorite(product.id) ? "active" : ""
                    }`}
                    aria-label={
                      isFavorite(product.id)
                        ? "إزالة من المفضلة"
                        : "إضافة للمفضلة"
                    }
                    onClick={(e) => {
                      e.stopPropagation();

                      toggleFavorite(product.id);
                    }}
                  >
                    <Heart
                      size={18}
                      strokeWidth={1.8}
                      fill={isFavorite(product.id) ? "currentColor" : "none"}
                    />
                  </button>
                )}

                <span
                  className={`product-card__condition ${product.conditionClass}`}
                >
                  {product.condition}
                </span>
              </div>

              <div className="product-card__content">
                <h3>{product.name}</h3>

                <div className="product-card__bottom">
                  <div className="product-card__price">
                    <strong>{Number(product.price).toLocaleString()}</strong>

                    <span>₪</span>
                  </div>

                  <div className="product-card__location">
                    <MapPin size={13} strokeWidth={1.8} />

                    <span>{product.location}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* LEFT ARROW */}

        <button
          type="button"
          className="slider-arrow slider-arrow--left"
          aria-label="تحريك لليسار"
          onClick={() => scrollSlider("left")}
        >
          <ChevronLeft size={22} />
        </button>
      </div>
    </section>
  );
}

export default LatestProducts;
