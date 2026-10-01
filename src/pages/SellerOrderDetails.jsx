import "./SellerOrderDetails.css";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowRight,
  Package,
  CalendarDays,
  UserRound,
  Phone,
  MapPin,
  ShoppingBag,
  ImageOff,
  Clock3,
  Check,
  CheckCircle2,
  Boxes,
  XCircle,
  ShieldCheck,
  ChevronLeft,
} from "lucide-react";

/* STATUSES */

const ALLOWED_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "completed",
  "cancelled",
];

/* STATUS STEPS */

const STATUS_STEPS = [
  {
    value: "pending",
    label: "تم الاستلام",
    description: "وصل الطلب",
  },
  {
    value: "confirmed",
    label: "تم التأكيد",
    description: "تم قبول الطلب",
  },
  {
    value: "preparing",
    label: "قيد التجهيز",
    description: "جاري تجهيز الطلب",
  },
  {
    value: "completed",
    label: "مكتمل",
    description: "اكتملت العملية",
  },
];

/* NEXT STATUS */

const NEXT_STATUS = {
  pending: "confirmed",
  confirmed: "preparing",
  preparing: "completed",
};

/* STATUS CONTENT */

const STATUS_CONTENT = {
  pending: {
    title: "طلب جديد بانتظار التأكيد",
    description: "راجع تفاصيل الطلب وتأكد من توفر المنتجات قبل تأكيده.",
    action: "تأكيد الطلب",
  },

  confirmed: {
    title: "تم تأكيد الطلب",
    description: "تم قبول الطلب ويمكنك الآن البدء بتجهيز المنتجات للمشتري.",
    action: "نقل إلى قيد التجهيز",
  },

  preparing: {
    title: "الطلب قيد التجهيز",
    description: "أكمل تجهيز المنتجات، وبعد تسليم الطلب يمكنك إنهاء العملية.",
    action: "تحديد كمكتمل",
  },

  completed: {
    title: "تم إكمال الطلب",
    description: "تم إنهاء هذا الطلب بنجاح ولا يحتاج إلى أي إجراء إضافي.",
    action: null,
  },

  cancelled: {
    title: "تم إلغاء الطلب",
    description: "هذا الطلب ملغي ولا يمكن إجراء تغييرات إضافية على حالته.",
    action: null,
  },
};

/* NOTIFICATIONS */

const STATUS_NOTIFICATION_TEXT = {
  confirmed: {
    title: "تم تأكيد طلبك",
    message: "قام البائع بتأكيد طلبك.",
  },

  preparing: {
    title: "طلبك قيد التجهيز",
    message: "بدأ البائع بتجهيز طلبك.",
  },

  completed: {
    title: "تم إكمال طلبك",
    message: "تم تحديث حالة طلبك إلى مكتمل.",
  },

  cancelled: {
    title: "تم إلغاء طلبك",
    message: "قام البائع بإلغاء الطلب.",
  },
};

function SellerOrderDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

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

  const [currentUser, setCurrentUser] = useState(getCurrentUser);

  const userId =
    currentUser?.id !== undefined && currentUser?.id !== null
      ? String(currentUser.id)
      : null;

  /* ORDERS */

  const getStoredOrders = useCallback(() => {
    const orders = readStorage("benaOrders", []);

    return Array.isArray(orders) ? orders : [];
  }, [readStorage]);

  /* ORDER */

  const getOrder = useCallback(() => {
    if (!id || !userId) {
      return null;
    }

    const orders = getStoredOrders();

    const foundOrder = orders.find(
      (order) =>
        order &&
        typeof order === "object" &&
        !Array.isArray(order) &&
        String(order.id) === String(id),
    );

    if (!foundOrder) {
      return null;
    }

    const sellerId =
      foundOrder?.sellerId !== undefined && foundOrder?.sellerId !== null
        ? String(foundOrder.sellerId)
        : null;

    if (sellerId && sellerId === userId) {
      return foundOrder;
    }

    const products = Array.isArray(foundOrder?.products)
      ? foundOrder.products
      : [];

    const belongsToSeller = products.some((product) => {
      if (!product || typeof product !== "object" || Array.isArray(product)) {
        return false;
      }

      const productSellerId =
        product?.sellerId !== undefined && product?.sellerId !== null
          ? String(product.sellerId)
          : product?.userId !== undefined && product?.userId !== null
            ? String(product.userId)
            : product?.ownerId !== undefined && product?.ownerId !== null
              ? String(product.ownerId)
              : null;

      return productSellerId === userId;
    });

    return belongsToSeller ? foundOrder : null;
  }, [id, userId, getStoredOrders]);

  const [order, setOrder] = useState(getOrder);

  /* REFRESH */

  const refreshOrder = useCallback(() => {
    const user = getCurrentUser();

    setCurrentUser(user);

    if (!user?.id) {
      setOrder(null);
      return;
    }

    const orders = getStoredOrders();

    const foundOrder = orders.find((item) => String(item?.id) === String(id));

    if (!foundOrder) {
      setOrder(null);
      return;
    }

    const targetUserId = String(user.id);

    const directSellerId =
      foundOrder?.sellerId !== undefined && foundOrder?.sellerId !== null
        ? String(foundOrder.sellerId)
        : null;

    if (directSellerId === targetUserId) {
      setOrder(foundOrder);
      return;
    }

    const products = Array.isArray(foundOrder?.products)
      ? foundOrder.products
      : [];

    const belongsToSeller = products.some((product) => {
      const sellerId =
        product?.sellerId !== undefined && product?.sellerId !== null
          ? String(product.sellerId)
          : product?.userId !== undefined && product?.userId !== null
            ? String(product.userId)
            : product?.ownerId !== undefined && product?.ownerId !== null
              ? String(product.ownerId)
              : null;

      return sellerId === targetUserId;
    });

    setOrder(belongsToSeller ? foundOrder : null);
  }, [getCurrentUser, getStoredOrders, id]);

  /* EVENTS */

  useEffect(() => {
    refreshOrder();

    const handleStorage = (event) => {
      if (
        !event.key ||
        event.key === "benaOrders" ||
        event.key === "benaCurrentUser"
      ) {
        refreshOrder();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("bena-orders-updated", refreshOrder);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("bena-orders-updated", refreshOrder);
    };
  }, [refreshOrder]);

  /* STATUS */

  const getOrderStatus = useCallback((targetOrder) => {
    const status = String(targetOrder?.status || "pending")
      .trim()
      .toLowerCase();

    return ALLOWED_STATUSES.includes(status) ? status : "pending";
  }, []);

  const status = getOrderStatus(order);

  const getStatusText = (value) => {
    switch (value) {
      case "confirmed":
        return "تم التأكيد";

      case "preparing":
        return "قيد التجهيز";

      case "completed":
        return "مكتمل";

      case "cancelled":
        return "ملغي";

      default:
        return "قيد الانتظار";
    }
  };

  const statusContent = STATUS_CONTENT[status] || STATUS_CONTENT.pending;

  const nextStatus = NEXT_STATUS[status] || null;

  /* STATUS INDEX */

  const currentStatusIndex = useMemo(() => {
    if (status === "cancelled") {
      return -1;
    }

    return STATUS_STEPS.findIndex((step) => step.value === status);
  }, [status]);

  /* DATE */

  const formatDate = (date) => {
    if (!date) {
      return "غير محدد";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "غير محدد";
    }

    return parsedDate.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  /* PRODUCTS */

  const products = useMemo(() => {
    if (!Array.isArray(order?.products)) {
      return [];
    }

    const safeProducts = order.products.filter(
      (product) =>
        product && typeof product === "object" && !Array.isArray(product),
    );

    if (!userId) {
      return [];
    }

    const sellerProducts = safeProducts.filter((product) => {
      const productSellerId =
        product?.sellerId !== undefined && product?.sellerId !== null
          ? String(product.sellerId)
          : product?.userId !== undefined && product?.userId !== null
            ? String(product.userId)
            : product?.ownerId !== undefined && product?.ownerId !== null
              ? String(product.ownerId)
              : null;

      return productSellerId === userId;
    });

    if (sellerProducts.length > 0) {
      return sellerProducts;
    }

    const directSellerId =
      order?.sellerId !== undefined && order?.sellerId !== null
        ? String(order.sellerId)
        : null;

    return directSellerId === userId ? safeProducts : [];
  }, [order, userId]);

  /* IMAGE */

  const getProductImage = (product) => {
    if (product?.image) {
      return product.image;
    }

    if (Array.isArray(product?.images) && product.images.length > 0) {
      return product.images[0];
    }

    return null;
  };

  /* PRICE */

  const getProductPrice = (product) => {
    const price = Number(product?.price);

    return Number.isFinite(price) && price >= 0 ? price : 0;
  };

  /* QUANTITY */

  const getProductQuantity = (product) => {
    const quantity = Number(product?.quantity);

    return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
  };

  /* SELLER TOTAL */

  const sellerTotal = useMemo(() => {
    return products.reduce((total, product) => {
      return total + getProductPrice(product) * getProductQuantity(product);
    }, 0);
  }, [products]);

  /* BUYER */

  const buyerName = order?.customer?.name || order?.buyerName || "مستخدم بينا";

  const buyerPhone = order?.customer?.phone || order?.phone || "غير محدد";

  const buyerLocation =
    order?.customer?.location || order?.location || "غير محدد";

  const buyerAddress = order?.customer?.address || order?.address || "غير محدد";

  /* CREATE NOTIFICATION */

  const createBuyerNotification = useCallback(
    (updatedOrder, newStatus, updatedAt) => {
      const buyerId =
        updatedOrder?.userId !== undefined && updatedOrder?.userId !== null
          ? String(updatedOrder.userId)
          : updatedOrder?.buyerId !== undefined &&
              updatedOrder?.buyerId !== null
            ? String(updatedOrder.buyerId)
            : null;

      if (!buyerId) {
        return;
      }

      const notificationInfo = STATUS_NOTIFICATION_TEXT[newStatus];

      if (!notificationInfo) {
        return;
      }

      try {
        const savedNotifications = readStorage("benaNotifications", []);

        const notifications = Array.isArray(savedNotifications)
          ? savedNotifications
          : [];

        const notification = {
          id: `${updatedOrder.id}_${newStatus}_${Date.now()}`,
          userId: buyerId,
          type: "order-status",
          orderId: updatedOrder.id,
          title: notificationInfo.title,
          text: notificationInfo.message,
          message: notificationInfo.message,
          link: `/orders/${encodeURIComponent(String(updatedOrder.id))}`,
          createdAt: updatedAt,
          read: false,
        };

        localStorage.setItem(
          "benaNotifications",
          JSON.stringify([notification, ...notifications]),
        );

        window.dispatchEvent(new CustomEvent("bena-notifications-updated"));
      } catch (error) {
        console.error("Failed to create buyer notification:", error);
      }
    },
    [readStorage],
  );

  /* UPDATE STATUS */

  const updateOrderStatus = (newStatus) => {
    if (!order || !userId) {
      return;
    }

    const normalizedStatus = String(newStatus || "")
      .trim()
      .toLowerCase();

    if (!ALLOWED_STATUSES.includes(normalizedStatus)) {
      return;
    }

    const latestOrders = getStoredOrders();

    const latestOrder = latestOrders.find(
      (item) => String(item?.id) === String(order.id),
    );

    if (!latestOrder) {
      refreshOrder();
      return;
    }

    const currentStatus = getOrderStatus(latestOrder);

    /* PREVENT CHANGES AFTER FINAL STATUS */

    if (currentStatus === "completed" || currentStatus === "cancelled") {
      refreshOrder();
      return;
    }

    const expectedNextStatus = NEXT_STATUS[currentStatus];

    const isNextStatus = normalizedStatus === expectedNextStatus;

    const isCancellation = normalizedStatus === "cancelled";

    if (!isNextStatus && !isCancellation) {
      refreshOrder();
      return;
    }

    /* CHECK SELLER */

    const directSellerId =
      latestOrder?.sellerId !== undefined && latestOrder?.sellerId !== null
        ? String(latestOrder.sellerId)
        : null;

    const latestProducts = Array.isArray(latestOrder?.products)
      ? latestOrder.products
      : [];

    const sellerOwnsOrder =
      directSellerId === userId ||
      latestProducts.some((product) => {
        const sellerId =
          product?.sellerId !== undefined && product?.sellerId !== null
            ? String(product.sellerId)
            : product?.userId !== undefined && product?.userId !== null
              ? String(product.userId)
              : product?.ownerId !== undefined && product?.ownerId !== null
                ? String(product.ownerId)
                : null;

        return sellerId === userId;
      });

    if (!sellerOwnsOrder) {
      refreshOrder();
      return;
    }

    /* UPDATE ORDER */

    const updatedAt = new Date().toISOString();

    let updatedOrder = null;

    const updatedOrders = latestOrders.map((item) => {
      if (String(item?.id) !== String(order.id)) {
        return item;
      }

      updatedOrder = {
        ...item,
        status: normalizedStatus,
        updatedAt,
        statusUpdatedAt: updatedAt,
        statusUpdatedBy: userId,
      };

      return updatedOrder;
    });

    if (!updatedOrder) {
      return;
    }

    /* GET PRODUCT IDS */

    const orderProductIds = latestProducts
      .filter((product) => {
        if (!product || typeof product !== "object" || Array.isArray(product)) {
          return false;
        }

        const sellerId =
          product?.sellerId !== undefined && product?.sellerId !== null
            ? String(product.sellerId)
            : product?.userId !== undefined && product?.userId !== null
              ? String(product.userId)
              : product?.ownerId !== undefined && product?.ownerId !== null
                ? String(product.ownerId)
                : null;

        return sellerId === userId || directSellerId === userId;
      })
      .map((product) => product?.id ?? product?.productId)
      .filter(
        (productId) =>
          productId !== undefined && productId !== null && productId !== "",
      )
      .map((productId) => String(productId));

    /* UPDATE PRODUCTS */

    const savedProducts = readStorage("benaProducts", []);

    const productsArray = Array.isArray(savedProducts) ? savedProducts : [];

    const updatedProducts = productsArray.map((product) => {
      if (
        product?.id === undefined ||
        product?.id === null ||
        !orderProductIds.includes(String(product.id))
      ) {
        return product;
      }

      /* CANCELLED */

      if (normalizedStatus === "cancelled") {
        const {
          orderStatus,
          orderId,
          buyerId,
          reservedAt,
          soldAt,
          ...availableProduct
        } = product;

        return {
          ...availableProduct,
          updatedAt,
        };
      }

      /* COMPLETED */

      if (normalizedStatus === "completed") {
        return {
          ...product,
          orderStatus: "completed",
          orderId: updatedOrder.id,
          buyerId: updatedOrder?.userId ?? updatedOrder?.buyerId ?? null,
          soldAt: updatedAt,
          updatedAt,
        };
      }

      /* PENDING CONFIRMED PREPARING */

      return {
        ...product,
        orderStatus: normalizedStatus,
        orderId: updatedOrder.id,
        buyerId: updatedOrder?.userId ?? updatedOrder?.buyerId ?? null,
        reservedAt: product?.reservedAt || updatedAt,
        updatedAt,
      };
    });

    /* REMOVE PRODUCTS FROM CARTS */

    let updatedCart = null;

    if (
      normalizedStatus === "confirmed" ||
      normalizedStatus === "preparing" ||
      normalizedStatus === "completed"
    ) {
      const savedCart = readStorage("benaCart", {});

      const cartObject =
        savedCart && typeof savedCart === "object" && !Array.isArray(savedCart)
          ? savedCart
          : {};

      updatedCart = Object.fromEntries(
        Object.entries(cartObject).map(([cartUserId, cartItems]) => {
          const safeCartItems = Array.isArray(cartItems) ? cartItems : [];

          const filteredCart = safeCartItems.filter((cartProductId) => {
            return !orderProductIds.includes(String(cartProductId));
          });

          return [cartUserId, filteredCart];
        }),
      );
    }

    /* SAVE */

    try {
      localStorage.setItem("benaOrders", JSON.stringify(updatedOrders));

      if (productsArray.length > 0) {
        localStorage.setItem("benaProducts", JSON.stringify(updatedProducts));
      }

      if (updatedCart) {
        localStorage.setItem("benaCart", JSON.stringify(updatedCart));
      }

      setOrder(updatedOrder);

      /* EVENTS */

      window.dispatchEvent(new CustomEvent("bena-orders-updated"));

      window.dispatchEvent(new CustomEvent("bena-products-updated"));

      if (updatedCart) {
        window.dispatchEvent(new CustomEvent("bena-cart-updated"));
      }

      /* NOTIFICATION */

      createBuyerNotification(updatedOrder, normalizedStatus, updatedAt);
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };
  /* NOT FOUND */

  if (!order) {
    return (
      <main className="seller-order-details-page" dir="rtl">
        <div className="seller-order-details-container">
          <button
            type="button"
            className="seller-order-back"
            onClick={() => navigate("/seller-orders")}
          >
            <ArrowRight size={18} />
            العودة للطلبات الواردة
          </button>

          <div className="seller-order-not-found">
            <div className="seller-order-not-found-icon">
              <Package size={36} strokeWidth={1.5} />
            </div>

            <h1>الطلب غير موجود</h1>

            <p>لم نتمكن من العثور على هذا الطلب، أو أنه لا يخص منتجاتك.</p>

            <button type="button" onClick={() => navigate("/seller-orders")}>
              عرض الطلبات الواردة
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="seller-order-details-page" dir="rtl">
      <div className="seller-order-details-container">
        {/* BACK */}

        <button
          type="button"
          className="seller-order-back"
          onClick={() => navigate("/seller-orders")}
        >
          <ArrowRight size={18} />
          العودة للطلبات الواردة
        </button>

        {/* HEADER */}

        <section className="seller-order-header">
          <div className="seller-order-header-main">
            <div className="seller-order-header-icon">
              <ShoppingBag size={23} strokeWidth={1.8} />
            </div>

            <div>
              <span className="seller-order-eyebrow">طلب وارد</span>

              <h1>
                طلب #
                {order.id !== undefined && order.id !== null
                  ? String(order.id)
                  : "غير محدد"}
              </h1>

              <div className="seller-order-header-meta">
                <span>
                  <CalendarDays size={15} />
                  {formatDate(order.createdAt)}
                </span>

                <span>
                  <Package size={15} />
                  {products.length} {products.length === 1 ? "منتج" : "منتجات"}
                </span>
              </div>
            </div>
          </div>

          <span className={`seller-order-header-status ${status}`}>
            {status === "completed" && <CheckCircle2 size={15} />}

            {status === "cancelled" && <XCircle size={15} />}

            {status === "preparing" && <Boxes size={15} />}

            {(status === "pending" || status === "confirmed") && (
              <Clock3 size={15} />
            )}

            {getStatusText(status)}
          </span>
        </section>

        {/* STATUS */}

        <section className="seller-order-status-card">
          <div className="seller-order-section-heading">
            <div>
              <span>متابعة الطلب</span>
              <h2>حالة الطلب</h2>
            </div>

            <ShieldCheck size={22} strokeWidth={1.7} aria-hidden="true" />
          </div>

          {status !== "cancelled" ? (
            <div className="seller-status-timeline">
              {STATUS_STEPS.map((step, index) => {
                const isCompleted = index < currentStatusIndex;

                const isCurrent = index === currentStatusIndex;

                const isFuture = index > currentStatusIndex;

                return (
                  <div
                    className={`seller-status-step ${
                      isCompleted ? "completed" : ""
                    } ${isCurrent ? "current" : ""} ${
                      isFuture ? "future" : ""
                    }`}
                    key={step.value}
                  >
                    <div className="seller-status-step-top">
                      <div className="seller-status-circle">
                        {isCompleted ? (
                          <Check size={16} strokeWidth={2.5} />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>

                      {index < STATUS_STEPS.length - 1 && (
                        <div className="seller-status-line">
                          <span />
                        </div>
                      )}
                    </div>

                    <div className="seller-status-step-text">
                      <strong>{step.label}</strong>
                      <span>{step.description}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="seller-order-cancelled-box">
              <div>
                <XCircle size={22} />
              </div>

              <div>
                <strong>تم إلغاء هذا الطلب</strong>

                <span>لن يتم تنفيذ أي مراحل إضافية لهذا الطلب.</span>
              </div>
            </div>
          )}

          {/* CURRENT STATUS */}

          <div className={`seller-current-status ${status}`}>
            <div className="seller-current-status-content">
              <div className="seller-current-status-icon">
                {status === "pending" && <Clock3 size={21} />}

                {status === "confirmed" && <CheckCircle2 size={21} />}

                {status === "preparing" && <Boxes size={21} />}

                {status === "completed" && <CheckCircle2 size={21} />}

                {status === "cancelled" && <XCircle size={21} />}
              </div>

              <div>
                <span>الحالة الحالية</span>

                <strong>{statusContent.title}</strong>

                <p>{statusContent.description}</p>
              </div>
            </div>

            {nextStatus && status !== "cancelled" && status !== "completed" && (
              <div className="seller-current-status-actions">
                <button
                  type="button"
                  className="seller-next-status-button"
                  onClick={() => updateOrderStatus(nextStatus)}
                >
                  {statusContent.action}

                  <ChevronLeft size={17} />
                </button>

                <button
                  type="button"
                  className="seller-cancel-order-button"
                  onClick={() => updateOrderStatus("cancelled")}
                >
                  إلغاء الطلب
                </button>
              </div>
            )}
          </div>
        </section>

        {/* CONTENT */}

        <div className="seller-order-content-grid">
          {/* PRODUCTS */}

          <section className="seller-order-products-card">
            <div className="seller-order-section-heading">
              <div>
                <span>تفاصيل الشراء</span>
                <h2>المنتجات المطلوبة</h2>
              </div>

              <span className="seller-products-count">{products.length}</span>
            </div>

            <div className="seller-order-products-list">
              {products.length > 0 ? (
                products.map((product, index) => {
                  const image = getProductImage(product);

                  const price = getProductPrice(product);

                  const quantity = getProductQuantity(product);

                  return (
                    <article
                      className="seller-order-product"
                      key={`${product?.id ?? "product"}-${index}`}
                    >
                      <div className="seller-order-product-image">
                        {image ? (
                          <>
                            <img
                              src={image}
                              alt={product?.name || "منتج"}
                              onError={(event) => {
                                event.currentTarget.style.display = "none";

                                const fallback =
                                  event.currentTarget.nextElementSibling;

                                if (fallback) {
                                  fallback.hidden = false;
                                }
                              }}
                            />

                            <div
                              className="seller-order-product-fallback"
                              hidden
                            >
                              <ImageOff size={25} strokeWidth={1.5} />
                            </div>
                          </>
                        ) : (
                          <div className="seller-order-product-fallback">
                            <ImageOff size={25} strokeWidth={1.5} />
                          </div>
                        )}
                      </div>

                      <div className="seller-order-product-info">
                        <span>{product?.category || "منتج من بينا"}</span>

                        <h3>{product?.name || "منتج بدون اسم"}</h3>

                        <div className="seller-order-product-meta">
                          <span>
                            الكمية: <strong>{quantity}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="seller-order-product-price">
                        <span>السعر</span>

                        <div>
                          <strong>{(price * quantity).toLocaleString()}</strong>

                          <span>₪</span>
                        </div>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="seller-order-products-empty">
                  <Package size={30} />

                  <span>لا توجد منتجات مرتبطة بهذا الطلب.</span>
                </div>
              )}
            </div>

            <div className="seller-order-products-total">
              <span>إجمالي منتجاتك في الطلب</span>

              <div>
                <strong>{sellerTotal.toLocaleString()}</strong>

                <span>₪</span>
              </div>
            </div>
          </section>

          {/* SIDE */}

          <aside className="seller-order-side">
            {/* BUYER */}

            <section className="seller-order-info-card">
              <div className="seller-order-side-heading">
                <div className="seller-order-side-icon">
                  <UserRound size={18} />
                </div>

                <div>
                  <span>بيانات التواصل</span>
                  <h2>معلومات المشتري</h2>
                </div>
              </div>

              <div className="seller-order-buyer">
                <div className="seller-order-buyer-avatar">
                  <UserRound size={22} strokeWidth={1.7} />
                </div>

                <div>
                  <span>اسم المشتري</span>
                  <strong>{buyerName}</strong>
                </div>
              </div>

              <div className="seller-order-info-list">
                <div>
                  <Phone size={16} />

                  <div>
                    <span>رقم الهاتف</span>
                    <strong>{buyerPhone}</strong>
                  </div>
                </div>

                <div>
                  <MapPin size={16} />

                  <div>
                    <span>المنطقة</span>
                    <strong>{buyerLocation}</strong>
                  </div>
                </div>

                <div>
                  <MapPin size={16} />

                  <div>
                    <span>العنوان</span>
                    <strong>{buyerAddress}</strong>
                  </div>
                </div>
              </div>
            </section>

            {/* SUMMARY */}

            <section className="seller-order-summary-card">
              <div className="seller-order-side-heading">
                <div className="seller-order-side-icon">
                  <ShoppingBag size={18} />
                </div>

                <div>
                  <span>ملخص العملية</span>
                  <h2>تفاصيل الطلب</h2>
                </div>
              </div>

              <div className="seller-order-summary-list">
                <div>
                  <span>رقم الطلب</span>

                  <strong>
                    #
                    {order.id !== undefined && order.id !== null
                      ? String(order.id)
                      : "غير محدد"}
                  </strong>
                </div>

                <div>
                  <span>تاريخ الطلب</span>

                  <strong>{formatDate(order.createdAt)}</strong>
                </div>

                <div>
                  <span>عدد المنتجات</span>

                  <strong>{products.length}</strong>
                </div>

                <div>
                  <span>حالة الطلب</span>

                  <strong className={`seller-summary-status ${status}`}>
                    {getStatusText(status)}
                  </strong>
                </div>
              </div>

              <div className="seller-order-summary-total">
                <span>الإجمالي</span>

                <div>
                  <strong>{sellerTotal.toLocaleString()}</strong>

                  <span>₪</span>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default SellerOrderDetails;
