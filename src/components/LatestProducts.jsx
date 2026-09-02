import "./LatestProducts.css";
import { defaultProducts } from "../data/products";
import { Heart, ChevronLeft, ChevronRight, MapPin } from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";

function LatestProducts() {
  const navigate = useNavigate();

  const sliderRef = useRef(null);

  const [favorites, setFavorites] = useState(() => {
    return JSON.parse(localStorage.getItem("benaFavorites")) || [];
  });

  const savedProducts = JSON.parse(localStorage.getItem("benaProducts")) || [];

  /* PRODUCTS */

  const products = [...savedProducts, ...defaultProducts].sort(
    (a, b) => Number(b.id) - Number(a.id),
  );

  const openProduct = (id) => {
    navigate(`/products/${id}`);
  };

  const isFavorite = (id) => {
    return favorites.some((item) => Number(item) === Number(id));
  };

  const toggleFavorite = (id) => {
    setFavorites((current) => {
      const exists = current.some((item) => Number(item) === Number(id));

      const updated = exists
        ? current.filter((item) => Number(item) !== Number(id))
        : [...current, id];

      localStorage.setItem("benaFavorites", JSON.stringify(updated));

      return updated;
    });
  };

  const scrollSlider = (direction) => {
    if (!sliderRef.current) return;

    const card = sliderRef.current.querySelector(".product-card");

    if (!card) return;

    const cardWidth = card.offsetWidth + 18;

    sliderRef.current.scrollBy({
      left: direction === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  };

  return (
    <section id="latest-products" className="latest-products" dir="rtl">
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

                <button
                  type="button"
                  className={`product-card__favorite ${
                    isFavorite(product.id) ? "active" : ""
                  }`}
                  aria-label="أضف للمفضلة"
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
