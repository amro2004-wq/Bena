import "./Favorites.css";

import { defaultProducts } from "../data/products";

import { Heart, MapPin, ArrowRight } from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useState } from "react";

import Toast from "../components/Toast";

function Favorites() {
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("benaCurrentUser"));

  const userId = String(currentUser?.id);

  const getUserFavorites = () => {
    const allFavorites =
      JSON.parse(localStorage.getItem("benaFavorites")) || {};

    if (Array.isArray(allFavorites)) {
      return [];
    }

    return allFavorites[userId] || [];
  };

  const [favoriteIds, setFavoriteIds] = useState(getUserFavorites);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
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

  const savedProducts = JSON.parse(localStorage.getItem("benaProducts")) || [];

  const allProducts = [...savedProducts, ...defaultProducts];

  const favoriteProducts = allProducts.filter((product) =>
    favoriteIds.some((id) => Number(id) === Number(product.id)),
  );

  const removeFavorite = (e, productId) => {
    e.stopPropagation();

    const updatedFavorites = favoriteIds.filter(
      (id) => Number(id) !== Number(productId),
    );

    setFavoriteIds(updatedFavorites);

    const allFavorites =
      JSON.parse(localStorage.getItem("benaFavorites")) || {};

    const favoritesObject = Array.isArray(allFavorites) ? {} : allFavorites;

    const updatedAllFavorites = {
      ...favoritesObject,

      [userId]: updatedFavorites,
    };

    localStorage.setItem("benaFavorites", JSON.stringify(updatedAllFavorites));

    showToast("تمت إزالة المنتج من المفضلة", "info");
  };

  return (
    <main className="favorites-page" dir="rtl">
      <Toast show={toast.show} message={toast.message} type={toast.type} />

      <div className="favorites-container">
        <button
          type="button"
          className="favorites-back"
          onClick={() => navigate("/")}
        >
          <ArrowRight size={18} />
          العودة للرئيسية
        </button>

        <div className="favorites-heading">
          <div>
            <span>منتجاتك المحفوظة</span>

            <h1>المفضلة</h1>

            <p>كل المنتجات اللي حفظتها بتلاقيها هون.</p>
          </div>

          <div className="favorites-count">
            <Heart size={19} />
            {favoriteProducts.length} منتجات
          </div>
        </div>

        {favoriteProducts.length > 0 ? (
          <div className="favorites-grid">
            {favoriteProducts.map((product) => (
              <article
                key={product.id}
                className="favorite-card"
                onClick={() => navigate(`/products/${product.id}`)}
              >
                <div className="favorite-card-image">
                  <img src={product.image} alt={product.name} />

                  <button
                    type="button"
                    className="favorite-remove"
                    aria-label="إزالة من المفضلة"
                    onClick={(e) => removeFavorite(e, product.id)}
                  >
                    <Heart size={19} fill="currentColor" />
                  </button>

                  <span
                    className={`favorite-condition ${product.conditionClass}`}
                  >
                    {product.condition}
                  </span>
                </div>

                <div className="favorite-card-content">
                  <span className="favorite-category">
                    {product.category || "أخرى"}
                  </span>

                  <h3>{product.name}</h3>

                  <div className="favorite-location">
                    <MapPin size={14} />

                    {product.location}
                  </div>

                  <div className="favorite-price">
                    <strong>{Number(product.price).toLocaleString()}</strong>

                    <span>₪</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="favorites-empty">
            <Heart size={50} strokeWidth={1.4} />

            <h2>المفضلة فارغة</h2>

            <p>اضغط على القلب الموجود على أي منتج لحفظه هنا.</p>

            <button type="button" onClick={() => navigate("/products")}>
              استكشف المنتجات
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default Favorites;
