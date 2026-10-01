import "./Cart.css";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  ShoppingCart,
  Trash2,
  MapPin,
  ArrowLeft,
  ImageOff,
} from "lucide-react";

import { defaultProducts } from "../data/products";

import { getCart, removeFromCart, saveCart } from "../utils/cart";

import Toast from "../components/Toast";

function Cart() {
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

  /* CART */

  const getUserCart = useCallback((targetUserId) => {
    if (!targetUserId) {
      return [];
    }

    try {
      const cart = getCart(String(targetUserId));

      return Array.isArray(cart) ? cart : [];
    } catch {
      return [];
    }
  }, []);

  const [cartIds, setCartIds] = useState(() => getUserCart(userId));

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

  /* REFRESH CART */

  const refreshCart = useCallback(() => {
    const user = getCurrentUser();

    setCurrentUser(user);

    const targetUserId =
      user?.id !== undefined && user?.id !== null ? String(user.id) : null;

    setCartIds(getUserCart(targetUserId));
  }, [getCurrentUser, getUserCart]);

  /* REFRESH PRODUCTS */

  const refreshProducts = useCallback(() => {
    setSavedProducts(getSavedProducts());
  }, [getSavedProducts]);

  /* EVENTS */

  useEffect(() => {
    const handleStorage = (event) => {
      if (
        !event.key ||
        event.key === "benaCurrentUser" ||
        event.key === "benaCart"
      ) {
        refreshCart();
      }

      if (!event.key || event.key === "benaProducts") {
        refreshProducts();
      }
    };

    window.addEventListener("storage", handleStorage);

    window.addEventListener("bena-cart-updated", refreshCart);

    window.addEventListener("bena-products-updated", refreshProducts);

    return () => {
      window.removeEventListener("storage", handleStorage);

      window.removeEventListener("bena-cart-updated", refreshCart);

      window.removeEventListener("bena-products-updated", refreshProducts);
    };
  }, [refreshCart, refreshProducts]);

  /* CLEAN CART */

  useEffect(() => {
    if (!userId) {
      return;
    }

    const validProductIds = new Set(
      allProducts
        .filter((product) => product?.id !== undefined && product?.id !== null)
        .map((product) => String(product.id)),
    );

    const validIds = cartIds.filter((cartId) =>
      validProductIds.has(String(cartId)),
    );

    if (validIds.length === cartIds.length) {
      return;
    }

    try {
      saveCart(userId, validIds);

      setCartIds(validIds);

      window.dispatchEvent(new Event("bena-cart-updated"));
    } catch {
      /* KEEP CURRENT CART */
    }
  }, [userId, cartIds, allProducts]);

  /* CART PRODUCTS */

  const cartProducts = useMemo(() => {
    const productsMap = new Map(
      allProducts
        .filter((product) => product?.id !== undefined && product?.id !== null)
        .map((product) => [String(product.id), product]),
    );

    return cartIds
      .map((cartId) => productsMap.get(String(cartId)))
      .filter(Boolean);
  }, [cartIds, allProducts]);

  /* PRICE */

  const getProductPrice = (product) => {
    const price = Number(product?.price);

    if (!Number.isFinite(price) || price < 0) {
      return 0;
    }

    return price;
  };

  /* TOTAL */

  const total = useMemo(() => {
    return cartProducts.reduce((sum, product) => {
      const price = Number(product?.price);

      return sum + (Number.isFinite(price) && price >= 0 ? price : 0);
    }, 0);
  }, [cartProducts]);

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

  /* PRODUCT PATH */

  const getProductPath = (productId) => {
    return `/products/${encodeURIComponent(String(productId))}`;
  };

  /* REMOVE PRODUCT */

  const handleRemove = (productId) => {
    if (!userId) {
      navigate("/login", {
        state: {
          from: "/cart",
        },
      });

      return;
    }

    try {
      const updatedCart = removeFromCart(userId, productId);

      setCartIds(Array.isArray(updatedCart) ? updatedCart : []);

      window.dispatchEvent(new Event("bena-cart-updated"));

      showToast("تمت إزالة المنتج من السلة", "info");
    } catch {
      showToast("تعذر إزالة المنتج من السلة", "error");
    }
  };

  /* CLEAR CART */

  const clearCart = () => {
    if (!userId) {
      navigate("/login", {
        state: {
          from: "/cart",
        },
      });

      return;
    }

    try {
      saveCart(userId, []);

      setCartIds([]);

      window.dispatchEvent(new Event("bena-cart-updated"));

      showToast("تم تفريغ السلة", "info");
    } catch {
      showToast("تعذر تفريغ السلة، حاول مرة أخرى", "error");
    }
  };

  return (
    <main className="cart-page" dir="rtl">
      <Toast show={toast.show} message={toast.message} type={toast.type} />

      <div className="cart-container">
        {/* BACK */}

        <button
          type="button"
          className="cart-back-button"
          onClick={() => navigate("/")}
        >
          <ArrowRight size={19} />

          <span>العودة للرئيسية</span>
        </button>

        {/* HEADING */}

        <div className="cart-heading">
          <div>
            <span className="cart-heading-label">مشترياتك</span>

            <h1>
              <ShoppingCart size={30} aria-hidden="true" />
              سلة التسوق
            </h1>

            <p>المنتجات التي اخترتها جاهزة لمراجعتها.</p>
          </div>

          {cartProducts.length > 0 && (
            <button
              type="button"
              className="cart-clear-button"
              onClick={clearCart}
            >
              <Trash2 size={17} />

              <span>تفريغ السلة</span>
            </button>
          )}
        </div>

        {/* CART CONTENT */}

        {cartProducts.length > 0 ? (
          <div className="cart-layout">
            {/* PRODUCTS */}

            <section className="cart-products" aria-label="منتجات سلة التسوق">
              {cartProducts.map((product) => {
                const productImage = getProductImage(product);

                const productPrice = getProductPrice(product);

                const productPath = getProductPath(product.id);

                return (
                  <article
                    className="cart-product-card"
                    key={String(product.id)}
                  >
                    <button
                      type="button"
                      className="cart-product-image"
                      aria-label={`عرض ${product.name || "المنتج"}`}
                      onClick={() => navigate(productPath)}
                    >
                      {productImage ? (
                        <>
                          <img
                            src={productImage}
                            alt={product.name || "صورة المنتج"}
                            onError={(event) => {
                              event.currentTarget.style.display = "none";

                              const fallback =
                                event.currentTarget.nextElementSibling;

                              if (fallback) {
                                fallback.style.display = "flex";
                              }
                            }}
                          />

                          <div
                            className="cart-image-fallback"
                            style={{
                              display: "none",
                            }}
                          >
                            <ImageOff size={32} strokeWidth={1.5} />

                            <span>لا توجد صورة</span>
                          </div>
                        </>
                      ) : (
                        <div className="cart-image-fallback">
                          <ImageOff size={32} strokeWidth={1.5} />

                          <span>لا توجد صورة</span>
                        </div>
                      )}
                    </button>

                    <div className="cart-product-info">
                      <span className="cart-product-category">
                        {product.category || "أخرى"}
                      </span>

                      <button
                        type="button"
                        className="cart-product-title"
                        onClick={() => navigate(productPath)}
                      >
                        {product.name || "منتج بدون اسم"}
                      </button>

                      <div className="cart-product-location">
                        <MapPin size={14} />

                        <span>{product.location || "غير محدد"}</span>
                      </div>

                      <div className="cart-product-bottom">
                        <div className="cart-product-price">
                          <strong>{productPrice.toLocaleString()}</strong>

                          <span>₪</span>
                        </div>

                        <button
                          type="button"
                          className="cart-remove-button"
                          aria-label={`إزالة ${
                            product.name || "المنتج"
                          } من السلة`}
                          onClick={() => handleRemove(product.id)}
                        >
                          <Trash2 size={16} />

                          <span>إزالة</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>

            {/* SUMMARY */}

            <aside className="cart-summary" aria-label="ملخص سلة التسوق">
              <h2>ملخص السلة</h2>

              <div className="cart-summary-row">
                <span>عدد المنتجات</span>

                <strong>{cartProducts.length}</strong>
              </div>

              <div className="cart-summary-divider" />

              <div className="cart-summary-total">
                <span>المجموع</span>

                <div>
                  <strong>{total.toLocaleString()}</strong>

                  <span>₪</span>
                </div>
              </div>

              <button
                type="button"
                className="cart-checkout-button"
                onClick={() => navigate("/checkout")}
              >
                متابعة الشراء
              </button>

              <p>لا يتم الدفع حاليًا داخل المنصة.</p>
            </aside>
          </div>
        ) : (
          <div className="cart-empty">
            <div className="cart-empty-icon">
              <ShoppingCart size={38} />
            </div>

            <h2>سلتك فارغة</h2>

            <p>أضف المنتجات التي تعجبك وستظهر هنا.</p>

            <button type="button" onClick={() => navigate("/products")}>
              <span>تصفح المنتجات</span>

              <ArrowLeft size={17} />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default Cart;
