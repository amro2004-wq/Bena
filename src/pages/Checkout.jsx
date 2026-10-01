import "./Checkout.css";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  MapPin,
  Phone,
  UserRound,
  Home,
  CreditCard,
  Banknote,
  Truck,
  ShoppingBag,
  CheckCircle2,
  ShieldCheck,
  ImageOff,
  ClipboardList,
} from "lucide-react";

import { defaultProducts } from "../data/products";

import Toast from "../components/Toast";
import Navbar from "../components/Navbar";

const ALLOWED_LOCATIONS = ["غزة", "شمال غزة", "دير البلح", "خان يونس", "رفح"];

const ALLOWED_DELIVERY_METHODS = ["seller", "pickup"];

function Checkout() {
  const navigate = useNavigate();

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

  const currentUser = useMemo(() => {
    const user = readStorage("benaCurrentUser", null);

    if (!user || typeof user !== "object" || Array.isArray(user)) {
      return null;
    }

    return user;
  }, [readStorage]);

  const userId =
    currentUser?.id !== undefined && currentUser?.id !== null
      ? String(currentUser.id)
      : null;

  /* PRODUCTS */

  const savedProducts = useMemo(() => {
    const products = readStorage("benaProducts", []);

    return Array.isArray(products) ? products : [];
  }, [readStorage]);

  const allProducts = useMemo(() => {
    const productsMap = new Map();

    defaultProducts.forEach((product) => {
      if (product?.id !== undefined && product?.id !== null) {
        productsMap.set(String(product.id), product);
      }
    });

    savedProducts.forEach((product) => {
      if (product?.id !== undefined && product?.id !== null) {
        productsMap.set(String(product.id), product);
      }
    });

    return Array.from(productsMap.values());
  }, [savedProducts]);

  /* CART */

  const allCarts = useMemo(() => {
    const carts = readStorage("benaCart", {});

    if (!carts || typeof carts !== "object" || Array.isArray(carts)) {
      return {};
    }

    return carts;
  }, [readStorage]);

  const cartIds = useMemo(() => {
    if (!userId) {
      return [];
    }

    const userCart = allCarts[userId];

    return Array.isArray(userCart) ? userCart : [];
  }, [allCarts, userId]);

  /* CART PRODUCTS */

  const cartProducts = useMemo(() => {
    return cartIds
      .map((cartId) =>
        allProducts.find((product) => String(product?.id) === String(cartId)),
      )
      .filter(Boolean);
  }, [allProducts, cartIds]);

  /* TOTAL */

  const totalPrice = useMemo(() => {
    return cartProducts.reduce((total, product) => {
      const price = Number(product?.price);

      return total + (Number.isFinite(price) && price >= 0 ? price : 0);
    }, 0);
  }, [cartProducts]);

  /* FORM */

  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    phone: currentUser?.phone || "",
    location: "",
    address: "",
    notes: "",
    paymentMethod: "cash",
    deliveryMethod: "seller",
  });

  /* STATE */

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [orderCompleted, setOrderCompleted] = useState(false);

  const [completedOrders, setCompletedOrders] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  /* TIMERS */

  const toastTimerRef = useRef(null);
  const redirectTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }

      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

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

      toastTimerRef.current = null;
    }, 2200);
  }, []);

  /* FORM CHANGE */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

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

  /* PRODUCT PRICE */

  const getProductPrice = (product) => {
    const price = Number(product?.price);

    return Number.isFinite(price) && price >= 0 ? price : 0;
  };

  /* SELLER ID */

  const getSellerId = (product) => {
    if (
      product?.sellerId !== undefined &&
      product?.sellerId !== null &&
      String(product.sellerId).trim() !== ""
    ) {
      return String(product.sellerId);
    }

    if (
      product?.userId !== undefined &&
      product?.userId !== null &&
      String(product.userId).trim() !== ""
    ) {
      return String(product.userId);
    }

    if (
      product?.ownerId !== undefined &&
      product?.ownerId !== null &&
      String(product.ownerId).trim() !== ""
    ) {
      return String(product.ownerId);
    }

    return null;
  };

  /* SELLER NAME */

  const getSellerName = (product) => {
    if (typeof product?.sellerName === "string" && product.sellerName.trim()) {
      return product.sellerName.trim();
    }

    if (typeof product?.ownerName === "string" && product.ownerName.trim()) {
      return product.ownerName.trim();
    }

    return "البائع";
  };

  /* PRODUCT ORDER STATUS */

  const getProductActiveOrder = (productId, orders) => {
    if (
      productId === undefined ||
      productId === null ||
      !Array.isArray(orders)
    ) {
      return null;
    }

    const targetProductId = String(productId);

    return (
      orders.find((order) => {
        const status = String(order?.status || "pending")
          .trim()
          .toLowerCase();

        if (status === "cancelled" || status === "completed") {
          return false;
        }

        const products = Array.isArray(order?.products) ? order.products : [];

        return products.some(
          (product) =>
            String(product?.id ?? product?.productId) === targetProductId,
        );
      }) || null
    );
  };

  /* VALIDATION */

  const validateForm = () => {
    if (!currentUser || !userId) {
      showToast("سجل دخولك أولاً لإتمام الطلب", "error");

      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }

      redirectTimerRef.current = setTimeout(() => {
        navigate("/login", {
          state: {
            from: "/checkout",
          },
        });
      }, 650);

      return false;
    }

    if (cartProducts.length === 0) {
      showToast("السلة فارغة", "info");

      return false;
    }

    const productWithoutSeller = cartProducts.find(
      (product) => !getSellerId(product),
    );

    if (productWithoutSeller) {
      showToast(
        `تعذر تحديد بائع المنتج: ${
          productWithoutSeller.name || "منتج بدون اسم"
        }`,
        "error",
      );

      return false;
    }

    const ownProduct = cartProducts.find(
      (product) => getSellerId(product) === String(userId),
    );

    if (ownProduct) {
      showToast(
        `لا يمكنك شراء منتجك الخاص: ${ownProduct.name || "المنتج"}`,
        "error",
      );

      return false;
    }

    const name = formData.name.trim();
    const phone = formData.phone.trim();
    const address = formData.address.trim();

    if (!name) {
      showToast("أدخل اسم المستلم", "error");

      return false;
    }

    if (name.length < 2) {
      showToast("أدخل اسم مستلم صحيح", "error");

      return false;
    }

    if (!phone) {
      showToast("أدخل رقم الجوال", "error");

      return false;
    }

    const normalizedPhone = phone.replace(/[\s-]/g, "");
    const phoneDigits = normalizedPhone.replace(/\D/g, "");

    if (!/^\+?[0-9]+$/.test(normalizedPhone) || phoneDigits.length < 7) {
      showToast("أدخل رقم جوال صحيح", "error");

      return false;
    }

    if (!formData.location || !ALLOWED_LOCATIONS.includes(formData.location)) {
      showToast("اختر المنطقة", "error");

      return false;
    }

    if (!address) {
      showToast("أدخل العنوان بالتفصيل", "error");

      return false;
    }

    if (!ALLOWED_DELIVERY_METHODS.includes(formData.deliveryMethod)) {
      showToast("اختر طريقة استلام صحيحة", "error");

      return false;
    }

    if (formData.paymentMethod !== "cash") {
      showToast("طريقة الدفع غير متاحة", "error");

      return false;
    }

    return true;
  };

  /* GROUP PRODUCTS BY SELLER */

  const groupProductsBySeller = () => {
    const sellerGroups = new Map();

    cartProducts.forEach((product) => {
      const sellerId = getSellerId(product);

      if (!sellerId) {
        return;
      }

      if (!sellerGroups.has(sellerId)) {
        sellerGroups.set(sellerId, {
          sellerId,
          sellerName: getSellerName(product),
          products: [],
        });
      }

      sellerGroups.get(sellerId).products.push(product);
    });

    return Array.from(sellerGroups.values());
  };

  /* CREATE UNIQUE ORDER ID */

  const createOrderId = (baseTime, index) => {
    return Number(`${baseTime}${index + 1}`);
  };

  /* SUBMIT */

  const handleSubmit = (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      /* GET LATEST ORDERS */

      const storedOrders = readStorage("benaOrders", []);

      const savedOrders = Array.isArray(storedOrders) ? storedOrders : [];

      /* PREVENT DUPLICATE PRODUCT ORDERS */

      const unavailableProduct = cartProducts.find((product) => {
        return Boolean(getProductActiveOrder(product?.id, savedOrders));
      });

      if (unavailableProduct) {
        const activeOrder = getProductActiveOrder(
          unavailableProduct.id,
          savedOrders,
        );

        const activeBuyerId =
          activeOrder?.buyerId !== undefined && activeOrder?.buyerId !== null
            ? String(activeOrder.buyerId)
            : activeOrder?.userId !== undefined && activeOrder?.userId !== null
              ? String(activeOrder.userId)
              : null;

        if (activeBuyerId === String(userId)) {
          showToast(
            `لديك طلب قائم بالفعل على ${
              unavailableProduct.name || "هذا المنتج"
            }`,
            "info",
          );
        } else {
          showToast(
            `${unavailableProduct.name || "هذا المنتج"} قيد الطلب حاليًا`,
            "error",
          );
        }

        setIsSubmitting(false);

        return;
      }

      const now = new Date().toISOString();

      /* GROUP BY SELLER */

      const sellerGroups = groupProductsBySeller();

      if (sellerGroups.length === 0) {
        throw new Error("NO_SELLERS");
      }

      const baseTime = Date.now();

      /* CREATE ORDERS */

      const newOrders = sellerGroups.map((sellerGroup, index) => {
        const orderId = createOrderId(baseTime, index);

        const orderProducts = sellerGroup.products.map((product) => ({
          id: product.id,

          name: product.name || "منتج بدون اسم",

          category: product.category || "أخرى",

          price: getProductPrice(product),

          location: product.location || "",

          image: getProductImage(product),

          sellerId: sellerGroup.sellerId,

          sellerName: sellerGroup.sellerName,
        }));

        const orderTotal = orderProducts.reduce(
          (total, product) => total + getProductPrice(product),
          0,
        );

        return {
          id: orderId,

          userId: String(userId),

          buyerId: String(userId),

          buyerName: currentUser?.name || formData.name.trim() || "مستخدم بينا",

          sellerId: String(sellerGroup.sellerId),

          sellerName: sellerGroup.sellerName,

          customer: {
            name: formData.name.trim(),

            phone: formData.phone.trim(),

            location: formData.location,

            address: formData.address.trim(),

            notes: formData.notes.trim(),
          },

          paymentMethod: formData.paymentMethod,

          deliveryMethod: formData.deliveryMethod,

          products: orderProducts,

          total: orderTotal,

          status: "pending",

          createdAt: now,

          updatedAt: now,
        };
      });

      /* SAVE ORDERS */

      const updatedOrders = [...newOrders, ...savedOrders];

      localStorage.setItem("benaOrders", JSON.stringify(updatedOrders));

      /* MARK PRODUCTS AS PENDING */

      const orderedProductData = new Map();

      newOrders.forEach((newOrder) => {
        const products = Array.isArray(newOrder.products)
          ? newOrder.products
          : [];

        products.forEach((product) => {
          if (product?.id === undefined || product?.id === null) {
            return;
          }

          orderedProductData.set(String(product.id), {
            orderId: newOrder.id,

            buyerId: String(newOrder.buyerId || newOrder.userId),

            sellerId: String(newOrder.sellerId),
          });
        });
      });

      /* GET LATEST SAVED PRODUCTS */

      const latestSavedProducts = readStorage("benaProducts", []);

      const savedProductsArray = Array.isArray(latestSavedProducts)
        ? latestSavedProducts
        : [];

      /* ADD ORDERED DEFAULT PRODUCTS TO STORAGE */

      const savedProductIds = new Set(
        savedProductsArray
          .filter(
            (product) => product?.id !== undefined && product?.id !== null,
          )
          .map((product) => String(product.id)),
      );

      const missingDefaultProducts = defaultProducts.filter((product) => {
        if (product?.id === undefined || product?.id === null) {
          return false;
        }

        const productId = String(product.id);

        return (
          orderedProductData.has(productId) && !savedProductIds.has(productId)
        );
      });

      const productsToUpdate = [
        ...savedProductsArray,
        ...missingDefaultProducts,
      ];

      /* UPDATE PRODUCT ORDER STATUS */

      const updatedProducts = productsToUpdate.map((product) => {
        if (product?.id === undefined || product?.id === null) {
          return product;
        }

        const productId = String(product.id);

        const orderData = orderedProductData.get(productId);

        if (!orderData) {
          return product;
        }

        return {
          ...product,

          orderStatus: "pending",

          orderId: orderData.orderId,

          buyerId: orderData.buyerId,

          sellerId:
            product?.sellerId !== undefined && product?.sellerId !== null
              ? product.sellerId
              : orderData.sellerId,

          reservedAt: now,

          updatedAt: now,
        };
      });

      localStorage.setItem("benaProducts", JSON.stringify(updatedProducts));

      /* CLEAR BUYER CART */

      const currentCarts = readStorage("benaCart", {});

      const cartsObject =
        currentCarts &&
        typeof currentCarts === "object" &&
        !Array.isArray(currentCarts)
          ? currentCarts
          : {};

      const updatedCarts = {
        ...cartsObject,

        [String(userId)]: [],
      };

      localStorage.setItem("benaCart", JSON.stringify(updatedCarts));

      /* REMOVE ORDERED PRODUCTS FROM OTHER CARTS */

      const orderedProductIds = new Set(Array.from(orderedProductData.keys()));

      const cleanedCarts = Object.fromEntries(
        Object.entries(updatedCarts).map(([cartUserId, cartItems]) => {
          const safeCartItems = Array.isArray(cartItems) ? cartItems : [];

          const filteredItems = safeCartItems.filter(
            (cartProductId) => !orderedProductIds.has(String(cartProductId)),
          );

          return [cartUserId, filteredItems];
        }),
      );

      localStorage.setItem("benaCart", JSON.stringify(cleanedCarts));

      /* NOTIFICATIONS */

      const storedNotifications = readStorage("benaNotifications", []);

      const savedNotifications = Array.isArray(storedNotifications)
        ? storedNotifications
        : [];

      /* BUYER NOTIFICATIONS */

      const buyerNotifications = newOrders.map((order) => ({
        id: `${order.id}_created_buyer`,

        userId: String(userId),

        type: "order",

        orderId: order.id,

        title: "تم إنشاء الطلب",

        text: `تم إنشاء طلبك من ${order.sellerName} بقيمة ${Number(
          order.total,
        ).toLocaleString()} ₪`,

        createdAt: now,

        read: false,

        link: `/orders/${encodeURIComponent(String(order.id))}`,
      }));

      /* SELLER NOTIFICATIONS */

      const sellerNotifications = newOrders.map((order) => ({
        id: `${order.id}_new_seller_order`,

        userId: String(order.sellerId),

        type: "seller-order",

        orderId: order.id,

        title: "لديك طلب جديد",

        text: `${formData.name.trim()} طلب ${
          order.products.length === 1
            ? order.products[0]?.name || "منتجًا"
            : `${order.products.length} منتجات`
        } بقيمة ${Number(order.total).toLocaleString()} ₪`,

        createdAt: now,

        read: false,

        link: `/seller-orders/${encodeURIComponent(String(order.id))}`,
      }));

      localStorage.setItem(
        "benaNotifications",
        JSON.stringify([
          ...sellerNotifications,
          ...buyerNotifications,
          ...savedNotifications,
        ]),
      );

      /* EVENTS */

      window.dispatchEvent(new Event("bena-cart-updated"));

      window.dispatchEvent(new Event("bena-orders-updated"));

      window.dispatchEvent(new Event("bena-products-updated"));

      window.dispatchEvent(new Event("bena-notifications-updated"));

      /* SUCCESS */

      setCompletedOrders(
        newOrders.map((order) => ({
          id: order.id,

          sellerId: order.sellerId,

          sellerName: order.sellerName,

          total: order.total,
        })),
      );

      setOrderCompleted(true);

      if (newOrders.length === 1) {
        showToast("تم إنشاء الطلب بنجاح ✓", "success");
      } else {
        showToast(`تم إنشاء ${newOrders.length} طلبات بنجاح ✓`, "success");
      }
    } catch (error) {
      console.error("Failed to create order:", error);

      showToast("حدث خطأ أثناء إنشاء الطلب", "error");

      setIsSubmitting(false);
    }
  };

  /* SUCCESS */

  if (orderCompleted) {
    const singleOrder =
      completedOrders.length === 1 ? completedOrders[0] : null;

    return (
      <>
        <Navbar />

        <main className="checkout-page" dir="rtl">
          <Toast show={toast.show} message={toast.message} type={toast.type} />

          <div className="checkout-success">
            <div className="checkout-success-icon">
              <CheckCircle2 size={42} />
            </div>

            <span>تم استلام طلبك</span>

            <h1>
              {completedOrders.length > 1
                ? "تم إنشاء طلباتك بنجاح"
                : "تم إنشاء الطلب بنجاح"}
            </h1>

            <p>
              {completedOrders.length > 1
                ? `تم تقسيم مشترياتك إلى ${completedOrders.length} طلبات حسب البائعين، ويمكنك متابعة حالة كل طلب من صفحة طلباتي.`
                : "طلبك تم تسجيله على بينا، وسيتم التواصل معك بخصوص تفاصيل الاستلام."}
            </p>

            {singleOrder && (
              <div className="checkout-success-order">
                <span>رقم الطلب</span>

                <strong>#{singleOrder.id}</strong>
              </div>
            )}

            {completedOrders.length > 1 && (
              <div className="checkout-success-order">
                <span>عدد الطلبات</span>

                <strong>{completedOrders.length}</strong>
              </div>
            )}

            <div className="checkout-success-actions">
              <button
                type="button"
                className="checkout-success-primary"
                onClick={() => navigate("/orders")}
              >
                <ClipboardList size={17} />
                عرض طلباتي
              </button>

              <button
                type="button"
                className="checkout-success-secondary"
                onClick={() => navigate("/products")}
              >
                متابعة التسوق
              </button>
            </div>

            {singleOrder && (
              <button
                type="button"
                className="checkout-success-details"
                onClick={() =>
                  navigate(
                    `/orders/${encodeURIComponent(String(singleOrder.id))}`,
                  )
                }
              >
                عرض تفاصيل هذا الطلب
              </button>
            )}
          </div>
        </main>
      </>
    );
  }

  /* PAGE */

  return (
    <>
      <Navbar />

      <main className="checkout-page" dir="rtl">
        <Toast show={toast.show} message={toast.message} type={toast.type} />

        <div className="checkout-container">
          {/* BACK */}

          <button
            type="button"
            className="checkout-back"
            onClick={() => navigate("/")}
          >
            <ArrowRight size={19} />

            <span>العودة للرئيسية</span>
          </button>

          {/* HEADING */}

          <div className="checkout-heading">
            <span>الخطوة الأخيرة</span>

            <h1>إتمام الطلب</h1>

            <p>راجع بياناتك والمنتجات قبل تأكيد الطلب.</p>
          </div>

          {/* FORM */}

          <form className="checkout-layout" onSubmit={handleSubmit} noValidate>
            <div className="checkout-main">
              {/* CUSTOMER */}

              <section className="checkout-card">
                <div className="checkout-card-title">
                  <div className="checkout-card-icon">
                    <UserRound size={20} />
                  </div>

                  <div>
                    <h2>بيانات المستلم</h2>

                    <p>أدخل معلومات التواصل والاستلام.</p>
                  </div>
                </div>

                <div className="checkout-form-grid">
                  <div className="checkout-form-group">
                    <label htmlFor="checkout-name">
                      <UserRound size={15} />
                      اسم المستلم
                    </label>

                    <input
                      id="checkout-name"
                      type="text"
                      name="name"
                      placeholder="الاسم الكامل"
                      value={formData.name}
                      onChange={handleChange}
                      maxLength={80}
                      autoComplete="name"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="checkout-form-group">
                    <label htmlFor="checkout-phone">
                      <Phone size={15} />
                      رقم الجوال
                    </label>

                    <input
                      id="checkout-phone"
                      type="tel"
                      name="phone"
                      placeholder="مثال: 0590000000"
                      value={formData.phone}
                      onChange={handleChange}
                      maxLength={20}
                      autoComplete="tel"
                      inputMode="tel"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="checkout-form-group">
                    <label htmlFor="checkout-location">
                      <MapPin size={15} />
                      المنطقة
                    </label>

                    <select
                      id="checkout-location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    >
                      <option value="">اختر المنطقة</option>

                      {ALLOWED_LOCATIONS.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="checkout-form-group">
                    <label htmlFor="checkout-address">
                      <Home size={15} />
                      العنوان بالتفصيل
                    </label>

                    <input
                      id="checkout-address"
                      type="text"
                      name="address"
                      placeholder="الحي، الشارع، أقرب معلم..."
                      value={formData.address}
                      onChange={handleChange}
                      maxLength={180}
                      autoComplete="street-address"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="checkout-form-group checkout-form-group--full">
                  <label htmlFor="checkout-notes">ملاحظات إضافية</label>

                  <textarea
                    id="checkout-notes"
                    name="notes"
                    placeholder="أي تفاصيل إضافية بخصوص الاستلام..."
                    value={formData.notes}
                    onChange={handleChange}
                    maxLength={500}
                    disabled={isSubmitting}
                  />
                </div>
              </section>

              {/* DELIVERY */}

              <section className="checkout-card">
                <div className="checkout-card-title">
                  <div className="checkout-card-icon">
                    <Truck size={20} />
                  </div>

                  <div>
                    <h2>طريقة الاستلام</h2>

                    <p>اختر الطريقة الأنسب لاستلام المنتجات.</p>
                  </div>
                </div>

                <div className="checkout-options">
                  <label
                    className={`checkout-option ${
                      formData.deliveryMethod === "seller" ? "active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="seller"
                      checked={formData.deliveryMethod === "seller"}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />

                    <div className="checkout-option-icon">
                      <Truck size={21} />
                    </div>

                    <div>
                      <strong>التنسيق مع البائع</strong>

                      <span>يتم التواصل لتحديد مكان وموعد الاستلام.</span>
                    </div>
                  </label>

                  <label
                    className={`checkout-option ${
                      formData.deliveryMethod === "pickup" ? "active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="pickup"
                      checked={formData.deliveryMethod === "pickup"}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />

                    <div className="checkout-option-icon">
                      <MapPin size={21} />
                    </div>

                    <div>
                      <strong>استلام مباشر</strong>

                      <span>تستلم المنتج مباشرة من البائع بعد الاتفاق.</span>
                    </div>
                  </label>
                </div>
              </section>

              {/* PAYMENT */}

              <section className="checkout-card">
                <div className="checkout-card-title">
                  <div className="checkout-card-icon">
                    <CreditCard size={20} />
                  </div>

                  <div>
                    <h2>طريقة الدفع</h2>

                    <p>اختر طريقة الدفع المناسبة.</p>
                  </div>
                </div>

                <div className="checkout-options checkout-options--single">
                  <label
                    className={`checkout-option ${
                      formData.paymentMethod === "cash" ? "active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={formData.paymentMethod === "cash"}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />

                    <div className="checkout-option-icon">
                      <Banknote size={21} />
                    </div>

                    <div>
                      <strong>الدفع نقدًا عند الاستلام</strong>

                      <span>يتم الدفع للبائع عند استلام المنتج.</span>
                    </div>
                  </label>
                </div>
              </section>
            </div>

            {/* SUMMARY */}

            <aside className="checkout-side">
              <div className="checkout-summary">
                <div className="checkout-summary-title">
                  <div>
                    <span>مراجعة الطلب</span>

                    <h2>ملخص الطلب</h2>
                  </div>

                  <ShoppingBag size={22} />
                </div>

                <div className="checkout-products">
                  {cartProducts.length > 0 ? (
                    cartProducts.map((product) => {
                      const productImage = getProductImage(product);

                      const productPrice = getProductPrice(product);

                      return (
                        <div className="checkout-product" key={product.id}>
                          <button
                            type="button"
                            className="checkout-product-image"
                            onClick={() =>
                              navigate(
                                `/products/${encodeURIComponent(
                                  String(product.id),
                                )}`,
                              )
                            }
                            disabled={isSubmitting}
                            aria-label={`عرض ${product.name || "المنتج"}`}
                          >
                            {productImage ? (
                              <>
                                <img
                                  src={productImage}
                                  alt={product.name || "منتج"}
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
                                  className="checkout-image-fallback"
                                  style={{
                                    display: "none",
                                  }}
                                >
                                  <ImageOff size={24} strokeWidth={1.5} />
                                </div>
                              </>
                            ) : (
                              <div className="checkout-image-fallback">
                                <ImageOff size={24} strokeWidth={1.5} />
                              </div>
                            )}
                          </button>

                          <div className="checkout-product-info">
                            <span>{product.category || "منتج"}</span>

                            <strong>{product.name || "منتج بدون اسم"}</strong>

                            <small>{productPrice.toLocaleString()} ₪</small>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="checkout-empty-cart">
                      لا توجد منتجات في السلة.
                    </div>
                  )}
                </div>

                <div className="checkout-summary-divider" />

                <div className="checkout-summary-row">
                  <span>عدد المنتجات</span>

                  <strong>{cartProducts.length}</strong>
                </div>

                <div className="checkout-summary-row">
                  <span>التوصيل</span>

                  <strong>
                    {formData.deliveryMethod === "pickup"
                      ? "استلام مباشر"
                      : "يتم الاتفاق مع البائع"}
                  </strong>
                </div>

                <div className="checkout-summary-total">
                  <span>الإجمالي</span>

                  <strong>
                    {totalPrice.toLocaleString()}

                    <small> ₪</small>
                  </strong>
                </div>

                <button
                  type="submit"
                  className="checkout-confirm"
                  disabled={cartProducts.length === 0 || isSubmitting}
                >
                  <CheckCircle2 size={19} />

                  {isSubmitting ? "جاري إنشاء الطلب..." : "تأكيد الطلب"}
                </button>

                <div className="checkout-security">
                  <ShieldCheck size={16} />

                  <span>بياناتك تُستخدم فقط لإتمام عملية الطلب.</span>
                </div>
              </div>
            </aside>
          </form>
        </div>
      </main>
    </>
  );
}

export default Checkout;
