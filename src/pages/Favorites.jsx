import "./Favorites.css";

import { defaultProducts } from "../data/products";

import { Heart, MapPin, ArrowRight, ImageOff } from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Toast from "../components/Toast";

function Favorites() {
  const navigate = useNavigate();

  const toastTimerRef = useRef(null);

  /* STORAGE */

  const readStorage = useCallback((key, fallback) => {
    try {
      const value = localStorage.getItem(key);

      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }, []);

  /* CURRENT USER */

  const getCurrentUser = useCallback(() => {
    const user = readStorage("benaCurrentUser", null);

    if (!user || typeof user !== "object" || Array.isArray(user)) {
      return null;
    }

    return user;
  }, [readStorage]);

  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());

  const userId =
    currentUser?.id !== undefined && currentUser?.id !== null
      ? String(currentUser.id)
      : null;

  /* FAVORITES */

  const getUserFavorites = useCallback(
    (targetUserId) => {
      if (!targetUserId) {
        return [];
      }

      const allFavorites = readStorage("benaFavorites", {});

      if (
        !allFavorites ||
        typeof allFavorites !== "object" ||
        Array.isArray(allFavorites)
      ) {
        return [];
      }

      const userFavorites = allFavorites[String(targetUserId)];

      return Array.isArray(userFavorites) ? userFavorites : [];
    },
    [readStorage],
  );

  const [favoriteIds, setFavoriteIds] = useState(() =>
    getUserFavorites(userId),
  );

  /* PRODUCTS */

  const getSavedProducts = useCallback(() => {
    const products = readStorage("benaProducts", []);

    return Array.isArray(products) ? products : [];
  }, [readStorage]);

  const [savedProducts, setSavedProducts] = useState(() => getSavedProducts());

  /* ALL PRODUCTS */

  const allProducts = useMemo(() => {
    const productsMap = new Map();

    defaultProducts.forEach((product) => {
      if (product?.id === undefined || product?.id === null) {
        return;
      }

      productsMap.set(String(product.id), product);
    });

    savedProducts.forEach((product) => {
      if (product?.id === undefined || product?.id === null) {
        return;
      }

      productsMap.set(String(product.id), product);
    });

    return Array.from(productsMap.values());
  }, [savedProducts]);

  /* FAVORITE PRODUCTS */

  const favoriteProducts = useMemo(() => {
    const favoriteSet = new Set(favoriteIds.map((id) => String(id)));

    return allProducts.filter((product) => {
      if (product?.id === undefined || product?.id === null) {
        return false;
      }

      return favoriteSet.has(String(product.id));
    });
  }, [allProducts, favoriteIds]);

  /* TOAST */

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = useCallback((message, type = "success") => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast({
      show: true,
      message,
      type,
    });

    toastTimerRef.current = setTimeout(() => {
      setToast((current) => ({
        ...current,
        show: false,
      }));

      toastTimerRef.current = null;
    }, 2200);
  }, []);

  /* CLEAN TOAST */

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  /* REFRESH */

  const refreshFavorites = useCallback(() => {
    const user = getCurrentUser();

    setCurrentUser(user);

    const targetUserId =
      user?.id !== undefined && user?.id !== null ? String(user.id) : null;

    setFavoriteIds(getUserFavorites(targetUserId));
  }, [getCurrentUser, getUserFavorites]);

  const refreshProducts = useCallback(() => {
    setSavedProducts(getSavedProducts());
  }, [getSavedProducts]);

  /* EVENTS */

  useEffect(() => {
    const handleStorage = (event) => {
      if (
        !event.key ||
        event.key === "benaCurrentUser" ||
        event.key === "benaFavorites"
      ) {
        refreshFavorites();
      }

      if (!event.key || event.key === "benaProducts") {
        refreshProducts();
      }
    };

    window.addEventListener("storage", handleStorage);

    window.addEventListener("bena-favorites-updated", refreshFavorites);

    window.addEventListener("bena-products-updated", refreshProducts);

    return () => {
      window.removeEventListener("storage", handleStorage);

      window.removeEventListener("bena-favorites-updated", refreshFavorites);

      window.removeEventListener("bena-products-updated", refreshProducts);
    };
  }, [refreshFavorites, refreshProducts]);

  /* PRODUCT IMAGE */

  const getProductImage = (product) => {
    if (product?.image) {
      return product.image;
    }

    if (Array.isArray(product?.images) && product.images.length > 0) {
      return product.images[0];
    }

    return null;
  };

  /* CONDITION */

  const getConditionClass = (product) => {
    const allowedClasses = ["new", "excellent", "used"];

    if (allowedClasses.includes(product?.conditionClass)) {
      return product.conditionClass;
    }

    if (product?.condition === "جديد") {
      return "new";
    }

    if (product?.condition === "ممتاز") {
      return "excellent";
    }

    return "used";
  };

  /* PRICE */

  const getProductPrice = (product) => {
    const price = Number(product?.price);

    if (!Number.isFinite(price) || price < 0) {
      return 0;
    }

    return price;
  };

  /* OPEN PRODUCT */

  const openProduct = (productId) => {
    if (productId === undefined || productId === null) {
      return;
    }

    navigate(`/products/${productId}`);
  };

  /* REMOVE FAVORITE */

  const removeFavorite = (productId) => {
    if (!userId) {
      navigate("/login", {
        state: {
          from: "/favorites",
        },
      });

      return;
    }

    const allFavorites = readStorage("benaFavorites", {});

    const favoritesObject =
      allFavorites &&
      typeof allFavorites === "object" &&
      !Array.isArray(allFavorites)
        ? allFavorites
        : {};

    const latestUserFavorites = Array.isArray(favoritesObject[userId])
      ? favoritesObject[userId]
      : [];

    const updatedFavorites = latestUserFavorites.filter(
      (favoriteId) => String(favoriteId) !== String(productId),
    );

    const updatedAllFavorites = {
      ...favoritesObject,
      [userId]: updatedFavorites,
    };

    try {
      localStorage.setItem(
        "benaFavorites",
        JSON.stringify(updatedAllFavorites),
      );

      setFavoriteIds(updatedFavorites);

      window.dispatchEvent(new Event("bena-favorites-updated"));

      showToast("تمت إزالة المنتج من المفضلة", "info");
    } catch {
      showToast("تعذر تحديث المفضلة، حاول مرة أخرى", "error");
    }
  };

  return (
    <main className="favorites-page" dir="rtl">
      <Toast show={toast.show} message={toast.message} type={toast.type} />

      <div className="favorites-container">
        {/* BACK */}

        <button
          type="button"
          className="favorites-back"
          onClick={() => navigate("/")}
        >
          <ArrowRight size={19} />

          <span>العودة للرئيسية</span>
        </button>

        {/* HEADING */}

        <div className="favorites-heading">
          <div>
            <span>منتجاتك المحفوظة</span>

            <h1>المفضلة</h1>

            <p>كل المنتجات اللي حفظتها بتلاقيها هون.</p>
          </div>

          <div className="favorites-count" aria-live="polite">
            <Heart size={19} />

            <span>{favoriteProducts.length} منتجات</span>
          </div>
        </div>

        {/* PRODUCTS */}

        {favoriteProducts.length > 0 ? (
          <div className="favorites-grid">
            {favoriteProducts.map((product) => {
              const productImage = getProductImage(product);

              const productPrice = getProductPrice(product);

              return (
                <article className="favorite-card" key={String(product.id)}>
                  <div className="favorite-card-image">
                    <button
                      type="button"
                      className="favorite-product-link"
                      aria-label={`عرض ${product.name || "المنتج"}`}
                      onClick={() => openProduct(product.id)}
                    >
                      {productImage ? (
                        <img
                          src={productImage}
                          alt={product.name || "صورة المنتج"}
                        />
                      ) : (
                        <div className="favorite-image-fallback">
                          <ImageOff size={34} strokeWidth={1.5} />

                          <span>لا توجد صورة</span>
                        </div>
                      )}
                    </button>

                    <button
                      type="button"
                      className="favorite-remove"
                      aria-label={`إزالة ${product.name || "المنتج"} من المفضلة`}
                      title="إزالة من المفضلة"
                      onClick={() => removeFavorite(product.id)}
                    >
                      <Heart size={19} fill="currentColor" />
                    </button>

                    <span
                      className={`favorite-condition ${getConditionClass(
                        product,
                      )}`}
                    >
                      {product.condition || "مستخدم"}
                    </span>
                  </div>

                  <div className="favorite-card-content">
                    <span className="favorite-category">
                      {product.category || "أخرى"}
                    </span>

                    <button
                      type="button"
                      className="favorite-title-button"
                      onClick={() => openProduct(product.id)}
                    >
                      {product.name || "منتج بدون اسم"}
                    </button>

                    <div className="favorite-location">
                      <MapPin size={14} />

                      <span>{product.location || "غير محدد"}</span>
                    </div>

                    <div className="favorite-card-bottom">
                      <div className="favorite-price">
                        <strong>{productPrice.toLocaleString()}</strong>

                        <span>₪</span>
                      </div>

                      <button
                        type="button"
                        className="favorite-view-button"
                        onClick={() => openProduct(product.id)}
                      >
                        عرض المنتج
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
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
