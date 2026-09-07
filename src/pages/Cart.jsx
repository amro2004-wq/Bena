import "./Cart.css";

import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  ShoppingCart,
  Trash2,
  MapPin,
  ArrowLeft,
} from "lucide-react";

import { defaultProducts } from "../data/products";

import { getCart, removeFromCart, saveCart } from "../utils/cart";

import Toast from "../components/Toast";

function Cart() {
  const navigate = useNavigate();

  /* USER */

  const currentUser = JSON.parse(localStorage.getItem("benaCurrentUser"));

  const userId = currentUser ? String(currentUser.id) : null;

  /* CART */

  const [cartIds, setCartIds] = useState(() => {
    if (!userId) {
      return [];
    }

    return getCart(userId);
  });

  /* TOAST */

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  /* PRODUCTS */

  const savedProducts = useMemo(() => {
    return JSON.parse(localStorage.getItem("benaProducts")) || [];
  }, []);

  const allProducts = useMemo(() => {
    return [...savedProducts, ...defaultProducts];
  }, [savedProducts]);

  /* CLEAN CART */

  useEffect(() => {
    if (!userId) {
      return;
    }

    const validIds = cartIds.filter((cartId) =>
      allProducts.some((product) => Number(product.id) === Number(cartId)),
    );

    if (validIds.length === cartIds.length) {
      return;
    }

    saveCart(userId, validIds);

    setCartIds(validIds);
  }, [userId, cartIds, allProducts]);

  /* CART PRODUCTS */

  const cartProducts = useMemo(() => {
    return cartIds
      .map((cartId) =>
        allProducts.find((product) => Number(product.id) === Number(cartId)),
      )
      .filter(Boolean);
  }, [cartIds, allProducts]);

  /* TOTAL */

  const total = cartProducts.reduce(
    (sum, product) => sum + Number(product.price || 0),
    0,
  );

  /* TOAST */

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

  /* REMOVE PRODUCT */

  const handleRemove = (productId) => {
    if (!userId) {
      return;
    }

    const updatedCart = removeFromCart(userId, productId);

    setCartIds(updatedCart);

    showToast("تمت إزالة المنتج من السلة", "info");
  };

  /* CLEAR CART */

  const clearCart = () => {
    if (!userId) {
      return;
    }

    saveCart(userId, []);

    setCartIds([]);

    showToast("تم تفريغ السلة", "info");
  };

  return (
    <main className="cart-page" dir="rtl">
      <Toast show={toast.show} message={toast.message} type={toast.type} />

      <div className="cart-container">
        <button
          type="button"
          className="cart-back-button"
          onClick={() => navigate(-1)}
        >
          <ArrowRight size={19} />

          <span>العودة</span>
        </button>

        <div className="cart-heading">
          <div>
            <span className="cart-heading-label">مشترياتك</span>

            <h1>
              <ShoppingCart size={30} />
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
              تفريغ السلة
            </button>
          )}
        </div>

        {cartProducts.length > 0 ? (
          <div className="cart-layout">
            <section className="cart-products">
              {cartProducts.map((product) => (
                <article className="cart-product-card" key={product.id}>
                  <button
                    type="button"
                    className="cart-product-image"
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    <img src={product.image} alt={product.name} />
                  </button>

                  <div className="cart-product-info">
                    <span className="cart-product-category">
                      {product.category || "أخرى"}
                    </span>

                    <h3>{product.name}</h3>

                    <div className="cart-product-location">
                      <MapPin size={14} />

                      {product.location}
                    </div>

                    <div className="cart-product-bottom">
                      <div className="cart-product-price">
                        <strong>
                          {Number(product.price).toLocaleString()}
                        </strong>

                        <span>₪</span>
                      </div>

                      <button
                        type="button"
                        className="cart-remove-button"
                        onClick={() => handleRemove(product.id)}
                      >
                        <Trash2 size={16} />
                        إزالة
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            <aside className="cart-summary">
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
                onClick={() =>
                  showToast("رح نضيف نظام إتمام الطلب بالخطوة القادمة", "info")
                }
              >
                متابعة الشراء
                <ArrowLeft size={18} />
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
              تصفح المنتجات
              <ArrowLeft size={17} />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default Cart;
