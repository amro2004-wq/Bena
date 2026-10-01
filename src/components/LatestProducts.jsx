import "./LatestProducts.css";

import { defaultProducts } from "../data/products";

import {
  Heart,
  ChevronLeft,
  ChevronRight,
  MapPin,
  ShoppingCart,
  Check,
  ImageOff,
  Clock3,
  PackageCheck,
  LockKeyhole,
  BadgeCheck,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useCallback, useEffect, useRef, useState } from "react";

import Toast from "../components/Toast";

import { addToCart, animateProductToCart, getCart } from "../utils/cart";

/* STORAGE */

const readStorage = (key, fallback) => {
  try {
    const value = JSON.parse(localStorage.getItem(key));

    return value ?? fallback;
  } catch {
    return fallback;
  }
};

const getCurrentUser = () => {
  const user = readStorage("benaCurrentUser", null);

  if (
    !user ||
    typeof user !== "object" ||
    Array.isArray(user) ||
    user.id === undefined ||
    user.id === null
  ) {
    return null;
  }

  return user;
};

const getSavedProducts = () => {
  const products = readStorage("benaProducts", []);

  return Array.isArray(products) ? products : [];
};

const getOrders = () => {
  const orders = readStorage("benaOrders", []);

  return Array.isArray(orders) ? orders : [];
};

/* PRODUCT HELPERS */

const getProductImage = (product) => {
  if (typeof product?.image === "string" && product.image.trim()) {
    return product.image;
  }

  if (
    Array.isArray(product?.images) &&
    typeof product.images[0] === "string" &&
    product.images[0].trim()
  ) {
    return product.images[0];
  }

  return "";
};

const getConditionClass = (product) => {
  if (product?.conditionClass) {
    return product.conditionClass;
  }

  const condition = String(product?.condition || "").trim();

  if (condition === "جديد") {
    return "new";
  }

  if (condition === "ممتاز") {
    return "excellent";
  }

  return "used";
};

const getProductTime = (product) => {
  const createdAt = new Date(product?.createdAt || "").getTime();

  if (Number.isFinite(createdAt)) {
    return createdAt;
  }

  const numericId = Number(product?.id);

  return Number.isFinite(numericId) ? numericId : 0;
};

/* ORDER HELPERS */

const normalizeStatus = (status) => {
  return String(status || "")
    .trim()
    .toLowerCase();
};

const getOrderTime = (order) => {
  const values = [
    order?.updatedAt,
    order?.createdAt,
    order?.date,
    order?.orderDate,
  ];

  for (const value of values) {
    const time = new Date(value || "").getTime();

    if (Number.isFinite(time)) {
      return time;
    }
  }

  const numericId = Number(order?.id);

  return Number.isFinite(numericId) ? numericId : 0;
};

/*
  نستخرج IDs المنتجات من الطلب.

  Checkout عندك يخزن المنتجات داخل order.products،
  لكن وضعت أكثر من احتمال هنا حتى يظل الكود متوافقًا
  لو تغير شكل الطلب لاحقًا.
*/

const getOrderProductIds = (order) => {
  const ids = [];

  const addId = (value) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    ids.push(String(value));
  };

  if (Array.isArray(order?.products)) {
    order.products.forEach((item) => {
      if (item && typeof item === "object") {
        addId(
          item.productId ??
            item.id ??
            item.product?.id ??
            item.product?.productId,
        );
      } else {
        addId(item);
      }
    });
  }

  if (Array.isArray(order?.items)) {
    order.items.forEach((item) => {
      if (item && typeof item === "object") {
        addId(
          item.productId ??
            item.id ??
            item.product?.id ??
            item.product?.productId,
        );
      } else {
        addId(item);
      }
    });
  }

  addId(order?.productId);

  return [...new Set(ids)];
};

const orderContainsProduct = (order, productId) => {
  const targetId = String(productId);

  return getOrderProductIds(order).some((id) => id === targetId);
};

const getOrderBuyerId = (order) => {
  const id =
    order?.buyerId ??
    order?.userId ??
    order?.buyer?.id ??
    order?.user?.id ??
    null;

  if (id === undefined || id === null || id === "") {
    return null;
  }

  return String(id);
};

/*
  أولوية الحالات:

  completed
  ثم preparing
  ثم confirmed
  ثم pending

  cancelled لا يحجز المنتج.
*/

const ORDER_STATUS_PRIORITY = {
  completed: 4,
  preparing: 3,
  confirmed: 2,
  pending: 1,
};

const getRelevantProductOrder = (orders, productId) => {
  if (!Array.isArray(orders)) {
    return null;
  }

  const relevantOrders = orders
    .filter((order) => {
      const status = normalizeStatus(order?.status);

      return (
        Object.prototype.hasOwnProperty.call(ORDER_STATUS_PRIORITY, status) &&
        orderContainsProduct(order, productId)
      );
    })
    .sort((a, b) => {
      const aStatus = normalizeStatus(a?.status);
      const bStatus = normalizeStatus(b?.status);

      const priorityDifference =
        (ORDER_STATUS_PRIORITY[bStatus] || 0) -
        (ORDER_STATUS_PRIORITY[aStatus] || 0);

      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      return getOrderTime(b) - getOrderTime(a);
    });

  return relevantOrders[0] || null;
};

function LatestProducts() {
  const navigate = useNavigate();

  const sliderRef = useRef(null);
  const toastTimerRef = useRef(null);

  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());

  const [products, setProducts] = useState(() => {
    const savedProducts = getSavedProducts();

    return [...savedProducts, ...defaultProducts].sort(
      (a, b) => getProductTime(b) - getProductTime(a),
    );
  });

  const [favorites, setFavorites] = useState([]);

  const [cartIds, setCartIds] = useState([]);

  const [orders, setOrders] = useState(() => getOrders());

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const userId =
    currentUser?.id !== undefined && currentUser?.id !== null
      ? String(currentUser.id)
      : null;

  /* TOAST */

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
    }, 2200);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  /* REFRESH USER */

  const refreshUser = useCallback(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  /* REFRESH PRODUCTS */

  const refreshProducts = useCallback(() => {
    const savedProducts = getSavedProducts();

    const combinedProducts = [...savedProducts, ...defaultProducts].sort(
      (a, b) => getProductTime(b) - getProductTime(a),
    );

    setProducts(combinedProducts);
  }, []);

  /* REFRESH FAVORITES */

  const refreshFavorites = useCallback(() => {
    const user = getCurrentUser();

    if (!user || user.id === undefined || user.id === null) {
      setFavorites([]);
      return;
    }

    const targetUserId = String(user.id);

    const allFavorites = readStorage("benaFavorites", {});

    if (
      !allFavorites ||
      typeof allFavorites !== "object" ||
      Array.isArray(allFavorites)
    ) {
      setFavorites([]);
      return;
    }

    const userFavorites = allFavorites[targetUserId];

    setFavorites(Array.isArray(userFavorites) ? userFavorites : []);
  }, []);

  /* REFRESH CART */

  const refreshCart = useCallback(() => {
    const user = getCurrentUser();

    if (!user || user.id === undefined || user.id === null) {
      setCartIds([]);
      return;
    }

    const cart = getCart(String(user.id));

    setCartIds(Array.isArray(cart) ? cart : []);
  }, []);

  /* REFRESH ORDERS */

  const refreshOrders = useCallback(() => {
    setOrders(getOrders());
  }, []);

  /* SYNC */

  useEffect(() => {
    refreshUser();
    refreshProducts();
    refreshFavorites();
    refreshCart();
    refreshOrders();

    const handleStorage = (event) => {
      if (
        !event.key ||
        [
          "benaCurrentUser",
          "benaUsers",
          "benaProducts",
          "benaFavorites",
          "benaCart",
          "benaOrders",
        ].includes(event.key)
      ) {
        refreshUser();
        refreshProducts();
        refreshFavorites();
        refreshCart();
        refreshOrders();
      }
    };

    const handleProductsUpdate = () => {
      refreshProducts();
    };

    const handleFavoritesUpdate = () => {
      refreshFavorites();
    };

    const handleCartUpdate = () => {
      refreshCart();
    };

    const handleUsersUpdate = () => {
      refreshUser();
    };

    const handleOrdersUpdate = () => {
      refreshOrders();
    };

    window.addEventListener("storage", handleStorage);

    window.addEventListener("bena-products-updated", handleProductsUpdate);

    window.addEventListener("bena-favorites-updated", handleFavoritesUpdate);

    window.addEventListener("bena-cart-updated", handleCartUpdate);

    window.addEventListener("bena-users-updated", handleUsersUpdate);

    window.addEventListener("bena-orders-updated", handleOrdersUpdate);

    return () => {
      window.removeEventListener("storage", handleStorage);

      window.removeEventListener("bena-products-updated", handleProductsUpdate);

      window.removeEventListener(
        "bena-favorites-updated",
        handleFavoritesUpdate,
      );

      window.removeEventListener("bena-cart-updated", handleCartUpdate);

      window.removeEventListener("bena-users-updated", handleUsersUpdate);

      window.removeEventListener("bena-orders-updated", handleOrdersUpdate);
    };
  }, [
    refreshUser,
    refreshProducts,
    refreshFavorites,
    refreshCart,
    refreshOrders,
  ]);

  /* PRODUCT */

  const openProduct = (id) => {
    navigate(`/products/${id}`);
  };

  /* OWNER */

  const isOwner = (product) => {
    if (
      !currentUser ||
      currentUser.id === undefined ||
      currentUser.id === null ||
      product?.sellerId === undefined ||
      product?.sellerId === null
    ) {
      return false;
    }

    return String(product.sellerId) === String(currentUser.id);
  };

  /* CART */

  const isInCart = (id) => {
    return cartIds.some((item) => String(item) === String(id));
  };

  /* PRODUCT ORDER */

  const getProductOrderInfo = (productId) => {
    const order = getRelevantProductOrder(orders, productId);

    if (!order) {
      return {
        order: null,
        status: null,
        buyerId: null,
        isCurrentBuyer: false,
        blocked: false,
        sold: false,
      };
    }

    const status = normalizeStatus(order.status);

    const buyerId = getOrderBuyerId(order);

    const isCurrentBuyer =
      Boolean(userId) && Boolean(buyerId) && String(userId) === String(buyerId);

    return {
      order,
      status,
      buyerId,
      isCurrentBuyer,
      blocked: ["pending", "confirmed", "preparing", "completed"].includes(
        status,
      ),
      sold: status === "completed",
    };
  };

  /* BUTTON STATE */

  const getPurchaseButtonState = (product) => {
    const inCart = isInCart(product.id);

    const orderInfo = getProductOrderInfo(product.id);

    if (orderInfo.status === "completed") {
      return {
        type: "sold",
        text: orderInfo.isCurrentBuyer ? "تم الشراء" : "تم البيع",
        disabled: true,
        icon: BadgeCheck,
      };
    }

    if (orderInfo.status === "preparing") {
      return {
        type: orderInfo.isCurrentBuyer ? "my-order" : "reserved",
        text: orderInfo.isCurrentBuyer ? "طلبك قيد التجهيز" : "محجوز",
        disabled: true,
        icon: PackageCheck,
      };
    }

    if (orderInfo.status === "confirmed") {
      return {
        type: orderInfo.isCurrentBuyer ? "my-order" : "reserved",
        text: orderInfo.isCurrentBuyer ? "تم قبول طلبك" : "محجوز",
        disabled: true,
        icon: Check,
      };
    }

    if (orderInfo.status === "pending") {
      return {
        type: orderInfo.isCurrentBuyer ? "my-order" : "reserved",
        text: orderInfo.isCurrentBuyer ? "بانتظار رد البائع" : "قيد الطلب",
        disabled: true,
        icon: orderInfo.isCurrentBuyer ? Clock3 : LockKeyhole,
      };
    }

    if (inCart) {
      return {
        type: "in-cart",
        text: "عرض السلة",
        disabled: false,
        icon: Check,
      };
    }

    return {
      type: "available",
      text: "أضف للسلة",
      disabled: false,
      icon: ShoppingCart,
    };
  };

  const handleAddToCart = (event, product) => {
    event.stopPropagation();

    if (!currentUser || !userId) {
      showToast("سجل دخولك أولاً لإضافة المنتجات للسلة", "info");

      setTimeout(() => {
        navigate("/login", {
          state: {
            from:
              window.location.pathname +
              window.location.search +
              window.location.hash,
          },
        });
      }, 650);

      return;
    }

    if (isOwner(product)) {
      showToast("لا يمكنك إضافة منتجك إلى السلة", "info");
      return;
    }

    /*
      مهم:
      نقرأ الطلبات من localStorage مرة ثانية هنا،
      وليس من state فقط، لمنع الإضافة حتى لو تغير الطلب
      قبل أن تعيد React الرسم.
    */

    const latestOrders = getOrders();

    const existingOrder = getRelevantProductOrder(latestOrders, product.id);

    if (existingOrder) {
      const status = normalizeStatus(existingOrder.status);

      const buyerId = getOrderBuyerId(existingOrder);

      const isCurrentBuyer =
        buyerId !== null && String(buyerId) === String(userId);

      refreshOrders();

      if (status === "completed") {
        showToast(
          isCurrentBuyer
            ? "لقد اشتريت هذا المنتج بالفعل"
            : "عذرًا، تم بيع هذا المنتج",
          "info",
        );

        return;
      }

      if (status === "pending") {
        showToast(
          isCurrentBuyer
            ? "طلبك بانتظار رد البائع"
            : "هذا المنتج قيد الطلب من مستخدم آخر",
          "info",
        );

        return;
      }

      if (status === "confirmed") {
        showToast(
          isCurrentBuyer
            ? "تم قبول طلبك لهذا المنتج"
            : "هذا المنتج محجوز حاليًا",
          "info",
        );

        return;
      }

      if (status === "preparing") {
        showToast(
          isCurrentBuyer
            ? "طلبك لهذا المنتج قيد التجهيز"
            : "هذا المنتج محجوز حاليًا",
          "info",
        );

        return;
      }
    }

    if (isInCart(product.id)) {
      navigate("/cart");
      return;
    }

    const productCard = event.currentTarget.closest(".product-card");

    const productImage = productCard?.querySelector(".product-card__image img");

    const result = addToCart(userId, product.id);

    if (!result?.added) {
      refreshCart();
      navigate("/cart");
      return;
    }

    setCartIds(Array.isArray(result.cart) ? result.cart : []);

    window.dispatchEvent(new Event("bena-cart-updated"));

    if (productImage) {
      animateProductToCart(productImage);
    }

    showToast("تمت إضافة المنتج للسلة ✓", "success");
  };

  /* FAVORITES */

  const isFavorite = (id) => {
    return favorites.some((item) => String(item) === String(id));
  };

  const toggleFavorite = (id) => {
    if (!currentUser || !userId) {
      showToast("سجل دخولك أولاً لإضافة المنتجات للمفضلة", "info");

      setTimeout(() => {
        navigate("/login", {
          state: {
            from:
              window.location.pathname +
              window.location.search +
              window.location.hash,
          },
        });
      }, 650);

      return;
    }

    const allFavorites = readStorage("benaFavorites", {});

    const favoritesObject =
      allFavorites &&
      typeof allFavorites === "object" &&
      !Array.isArray(allFavorites)
        ? allFavorites
        : {};

    const storedFavorites = Array.isArray(favoritesObject[userId])
      ? favoritesObject[userId]
      : [];

    const exists = storedFavorites.some((item) => String(item) === String(id));

    const updated = exists
      ? storedFavorites.filter((item) => String(item) !== String(id))
      : [...storedFavorites, id];

    const updatedAllFavorites = {
      ...favoritesObject,
      [userId]: updated,
    };

    localStorage.setItem("benaFavorites", JSON.stringify(updatedAllFavorites));

    setFavorites(updated);

    window.dispatchEvent(new Event("bena-favorites-updated"));

    showToast(
      exists ? "تمت إزالة المنتج من المفضلة" : "تمت إضافة المنتج للمفضلة ✓",
      exists ? "info" : "success",
    );
  };

  /* SLIDER */

  const scrollSlider = (direction) => {
    const slider = sliderRef.current;

    if (!slider) {
      return;
    }

    const card = slider.querySelector(".product-card");

    if (!card) {
      return;
    }

    const styles = window.getComputedStyle(slider);

    const gap = Number.parseFloat(styles.columnGap || styles.gap || "0");

    const cardWidth =
      card.getBoundingClientRect().width + (Number.isFinite(gap) ? gap : 0);

    slider.scrollBy({
      left: direction === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  };

  return (
    <section
      id="latest-products"
      className="latest-products"
      dir="rtl"
      aria-labelledby="latest-products-title"
    >
      <Toast show={toast.show} message={toast.message} type={toast.type} />

      {/* HEADER */}

      <div className="latest-products__header">
        <h2 id="latest-products-title">
          <span aria-hidden="true" />
          أحدث المنتجات
        </h2>

        <button
          type="button"
          className="view-all-btn"
          onClick={() => navigate("/products")}
        >
          <span>عرض الكل</span>

          <ChevronLeft size={16} aria-hidden="true" />
        </button>
      </div>

      {/* PRODUCTS */}

      <div className="products-wrapper">
        <button
          type="button"
          className="slider-arrow slider-arrow--right"
          aria-label="عرض المنتجات السابقة"
          onClick={() => scrollSlider("right")}
        >
          <ChevronRight size={22} aria-hidden="true" />
        </button>

        <div
          className="products-grid"
          ref={sliderRef}
          aria-label="أحدث المنتجات"
        >
          {products.map((product) => {
            const favorite = isFavorite(product.id);

            const owner = isOwner(product);

            const image = getProductImage(product);

            const price = Number(product?.price);

            const buttonState = getPurchaseButtonState(product);

            const ButtonIcon = buttonState.icon;

            return (
              <article
                className="product-card"
                key={String(product.id)}
                role="button"
                tabIndex={0}
                aria-label={`عرض تفاصيل ${product.name || "المنتج"}`}
                onClick={() => openProduct(product.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();

                    openProduct(product.id);
                  }
                }}
              >
                <div className="product-card__image">
                  {image ? (
                    <img
                      src={image}
                      alt={product.name || "صورة المنتج"}
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="product-card__image-fallback"
                      aria-hidden="true"
                    >
                      <ImageOff size={30} />
                    </div>
                  )}

                  {!owner && (
                    <button
                      type="button"
                      className={`product-card__favorite ${
                        favorite ? "active" : ""
                      }`}
                      aria-label={
                        favorite ? "إزالة من المفضلة" : "إضافة للمفضلة"
                      }
                      aria-pressed={favorite}
                      onClick={(event) => {
                        event.stopPropagation();

                        toggleFavorite(product.id);
                      }}
                      onKeyDown={(event) => {
                        event.stopPropagation();
                      }}
                    >
                      <Heart
                        size={18}
                        strokeWidth={1.8}
                        fill={favorite ? "currentColor" : "none"}
                        aria-hidden="true"
                      />
                    </button>
                  )}

                  <span
                    className={`product-card__condition ${getConditionClass(
                      product,
                    )}`}
                  >
                    {product.condition || "مستخدم"}
                  </span>
                </div>

                <div className="product-card__content">
                  <h3>{product.name || "منتج بدون اسم"}</h3>

                  <div className="product-card__bottom">
                    <div className="product-card__price">
                      <strong>
                        {Number.isFinite(price) ? price.toLocaleString() : "0"}
                      </strong>

                      <span>₪</span>
                    </div>

                    <div className="product-card__location">
                      <MapPin size={13} strokeWidth={1.8} aria-hidden="true" />

                      <span>{product.location || "قطاع غزة"}</span>
                    </div>
                  </div>

                  {!owner && (
                    <button
                      type="button"
                      className={`product-card__cart ${
                        buttonState.type === "in-cart" ? "in-cart" : ""
                      } ${
                        buttonState.type === "my-order" ? "order-pending" : ""
                      } ${
                        buttonState.type === "reserved" ? "order-reserved" : ""
                      } ${buttonState.type === "sold" ? "order-sold" : ""}`}
                      disabled={buttonState.disabled}
                      onClick={(event) => handleAddToCart(event, product)}
                      onKeyDown={(event) => {
                        event.stopPropagation();
                      }}
                    >
                      <ButtonIcon size={16} aria-hidden="true" />

                      <span>{buttonState.text}</span>
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <button
          type="button"
          className="slider-arrow slider-arrow--left"
          aria-label="عرض المنتجات التالية"
          onClick={() => scrollSlider("left")}
        >
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

export default LatestProducts;
