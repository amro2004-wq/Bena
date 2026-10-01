import "./OrderDetails.css";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowRight,
  Package,
  CalendarDays,
  MapPin,
  Phone,
  UserRound,
  Home,
  Banknote,
  Truck,
  ShoppingBag,
  CheckCircle2,
  Clock3,
  XCircle,
  CircleCheck,
  ImageOff,
} from "lucide-react";

/* STATUS */

const ALLOWED_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "completed",
  "cancelled",
];

const TRACKING_STEPS = [
  {
    status: "pending",
    title: "تم إنشاء الطلب",
    description: "تم استلام طلبك بنجاح",
  },
  {
    status: "confirmed",
    title: "تم التأكيد",
    description: "تم تأكيد طلبك",
  },
  {
    status: "preparing",
    title: "قيد التجهيز",
    description: "جاري تجهيز طلبك",
  },
  {
    status: "completed",
    title: "مكتمل",
    description: "تم إكمال الطلب",
  },
];

const STATUS_ORDER = {
  pending: 0,
  confirmed: 1,
  preparing: 2,
  completed: 3,
};

/* PRODUCT IMAGE */

function OrderProductImage({ product, onOpen }) {
  const [hasError, setHasError] = useState(false);

  const image = useMemo(() => {
    if (product?.image) {
      return product.image;
    }

    if (Array.isArray(product?.images) && product.images.length > 0) {
      return product.images[0];
    }

    return null;
  }, [product]);

  useEffect(() => {
    setHasError(false);
  }, [image]);

  const canOpen =
    product?.id !== undefined &&
    product?.id !== null &&
    String(product.id).trim() !== "";

  return (
    <button
      type="button"
      className="order-details-product-image"
      onClick={onOpen}
      disabled={!canOpen}
      aria-label={
        canOpen ? `عرض ${product?.name || "المنتج"}` : "تفاصيل المنتج غير متاحة"
      }
    >
      {image && !hasError ? (
        <img
          src={image}
          alt={product?.name || "منتج"}
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="order-details-product-image-fallback">
          <ImageOff size={27} strokeWidth={1.5} aria-hidden="true" />
        </div>
      )}
    </button>
  );
}

function OrderDetails() {
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

  /* USER */

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

  /* ORDER */

  const getOrder = useCallback(
    (targetUserId) => {
      if (
        !targetUserId ||
        id === undefined ||
        id === null ||
        String(id).trim() === ""
      ) {
        return null;
      }

      const savedOrders = readStorage("benaOrders", []);

      if (!Array.isArray(savedOrders)) {
        return null;
      }

      return (
        savedOrders.find((item) => {
          if (
            !item ||
            typeof item !== "object" ||
            Array.isArray(item) ||
            item.id === undefined ||
            item.id === null ||
            item.userId === undefined ||
            item.userId === null
          ) {
            return false;
          }

          return (
            String(item.id) === String(id) &&
            String(item.userId) === String(targetUserId)
          );
        }) || null
      );
    },
    [id, readStorage],
  );

  const [order, setOrder] = useState(() => getOrder(userId));

  /* REFRESH */

  const refreshOrder = useCallback(() => {
    const user = getCurrentUser();

    setCurrentUser(user);

    const targetUserId =
      user?.id !== undefined && user?.id !== null ? String(user.id) : null;

    setOrder(getOrder(targetUserId));
  }, [getCurrentUser, getOrder]);

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

  const getOrderStatus = (targetOrder) => {
    const status = String(targetOrder?.status || "pending");

    return ALLOWED_STATUSES.includes(status) ? status : "pending";
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "confirmed":
        return {
          text: "تم التأكيد",
          className: "confirmed",
          icon: <CheckCircle2 size={17} aria-hidden="true" />,
        };

      case "preparing":
        return {
          text: "قيد التجهيز",
          className: "preparing",
          icon: <Package size={17} aria-hidden="true" />,
        };

      case "completed":
        return {
          text: "مكتمل",
          className: "completed",
          icon: <CheckCircle2 size={17} aria-hidden="true" />,
        };

      case "cancelled":
        return {
          text: "ملغي",
          className: "cancelled",
          icon: <XCircle size={17} aria-hidden="true" />,
        };

      default:
        return {
          text: "قيد الانتظار",
          className: "pending",
          icon: <Clock3 size={17} aria-hidden="true" />,
        };
    }
  };

  const normalizedStatus = getOrderStatus(order);

  const currentStatusIndex =
    STATUS_ORDER[normalizedStatus] !== undefined
      ? STATUS_ORDER[normalizedStatus]
      : 0;

  /* PRODUCTS */

  const products = useMemo(() => {
    if (!Array.isArray(order?.products)) {
      return [];
    }

    return order.products.filter(
      (product) =>
        product && typeof product === "object" && !Array.isArray(product),
    );
  }, [order]);

  /* DATE */

  const formatDate = (date) => {
    if (!date) {
      return "غير محدد";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "غير محدد";
    }

    return parsedDate.toLocaleString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  /* PRICE */

  const formatPrice = (price) => {
    const value = Number(price);

    if (!Number.isFinite(value) || value < 0) {
      return "0";
    }

    return value.toLocaleString();
  };

  /* DELIVERY */

  const getDeliveryMethod = () => {
    if (order?.deliveryMethod === "pickup") {
      return "استلام مباشر";
    }

    if (order?.deliveryMethod === "seller") {
      return "التنسيق مع البائع";
    }

    return "غير محدد";
  };

  /* PAYMENT */

  const getPaymentMethod = () => {
    if (order?.paymentMethod === "cash") {
      return "الدفع نقدًا عند الاستلام";
    }

    return "غير محدد";
  };

  /* OPEN PRODUCT */

  const openProduct = (product) => {
    if (
      product?.id === undefined ||
      product?.id === null ||
      String(product.id).trim() === ""
    ) {
      return;
    }

    navigate(`/products/${encodeURIComponent(String(product.id))}`);
  };

  /* NOT FOUND */

  if (!order) {
    return (
      <main className="order-details-page" dir="rtl">
        <div className="order-details-container">
          <button
            type="button"
            className="order-details-back"
            onClick={() => navigate("/orders")}
          >
            <ArrowRight size={19} aria-hidden="true" />
            <span>العودة للطلبات</span>
          </button>

          <div className="order-details-not-found">
            <div className="order-details-not-found-icon">
              <Package size={42} aria-hidden="true" />
            </div>

            <h2>الطلب غير موجود</h2>

            <p>قد يكون الطلب غير متاح أو لا يخص هذا الحساب.</p>

            <button type="button" onClick={() => navigate("/orders")}>
              العودة إلى طلباتي
            </button>
          </div>
        </div>
      </main>
    );
  }

  const status = getStatusInfo(normalizedStatus);

  const orderId =
    order?.id !== undefined && order?.id !== null
      ? String(order.id)
      : "غير محدد";

  return (
    <main className="order-details-page" dir="rtl">
      <div className="order-details-container">
        {/* BACK */}

        <button
          type="button"
          className="order-details-back"
          onClick={() => navigate("/orders")}
        >
          <ArrowRight size={19} aria-hidden="true" />
          <span>العودة للطلبات</span>
        </button>

        {/* HEADING */}

        <div className="order-details-heading">
          <div>
            <span>تفاصيل الشراء</span>

            <h1>
              <Package size={30} aria-hidden="true" />
              تفاصيل الطلب
            </h1>

            <p>راجع المنتجات ومعلومات الاستلام الخاصة بطلبك.</p>
          </div>

          <div className={`order-details-status ${status.className}`}>
            {status.icon}
            {status.text}
          </div>
        </div>

        {/* TRACKING */}

        {normalizedStatus === "cancelled" ? (
          <section className="order-tracking-cancelled">
            <div className="order-tracking-cancelled-icon">
              <XCircle size={24} aria-hidden="true" />
            </div>

            <div>
              <h2>تم إلغاء الطلب</h2>
              <p>تم إلغاء هذا الطلب ولن يتم استكمال مراحل التجهيز.</p>
            </div>
          </section>
        ) : (
          <section className="order-tracking">
            <div className="order-tracking-header">
              <div>
                <span>حالة الطلب</span>
                <h2>تتبع طلبك</h2>
              </div>

              <span className="order-tracking-number">#{orderId}</span>
            </div>

            <div className="order-tracking-steps">
              {TRACKING_STEPS.map((step, index) => {
                const isCompleted = index < currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                const isActive = index <= currentStatusIndex;

                return (
                  <div
                    className={`order-tracking-step ${
                      isCompleted ? "completed" : ""
                    } ${isCurrent ? "current" : ""}`}
                    key={step.status}
                  >
                    <div className="order-tracking-step-progress">
                      <div
                        className={`order-tracking-circle ${
                          isActive ? "active" : ""
                        }`}
                      >
                        {isCompleted || normalizedStatus === "completed" ? (
                          <CircleCheck size={20} aria-hidden="true" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>

                      {index < TRACKING_STEPS.length - 1 && (
                        <div
                          className={`order-tracking-line ${
                            index < currentStatusIndex ? "active" : ""
                          }`}
                        />
                      )}
                    </div>

                    <div className="order-tracking-step-content">
                      <strong>{step.title}</strong>
                      <span>{step.description}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* LAYOUT */}

        <div className="order-details-layout">
          <div className="order-details-main">
            {/* PRODUCTS */}

            <section className="order-details-card">
              <div className="order-details-card-title">
                <ShoppingBag size={20} aria-hidden="true" />
                <h2>المنتجات</h2>
              </div>

              {products.length > 0 ? (
                <div className="order-details-products">
                  {products.map((product, index) => (
                    <article
                      className="order-details-product"
                      key={`${orderId}-${product?.id ?? "product"}-${index}`}
                    >
                      <OrderProductImage
                        product={product}
                        onOpen={() => openProduct(product)}
                      />

                      <div className="order-details-product-info">
                        <span>{product?.category || "أخرى"}</span>

                        <h3>{product?.name || "منتج بدون اسم"}</h3>

                        {product?.location && (
                          <div className="order-details-product-location">
                            <MapPin size={14} aria-hidden="true" />
                            <span>{product.location}</span>
                          </div>
                        )}
                      </div>

                      <div className="order-details-product-price">
                        <strong>{formatPrice(product?.price)}</strong>
                        <span>₪</span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="order-details-products-empty">
                  <ShoppingBag size={27} aria-hidden="true" />
                  <span>لا توجد منتجات مسجلة في هذا الطلب.</span>
                </div>
              )}
            </section>

            {/* CUSTOMER */}

            <section className="order-details-card">
              <div className="order-details-card-title">
                <UserRound size={20} aria-hidden="true" />
                <h2>بيانات المستلم</h2>
              </div>

              <div className="order-details-info-grid">
                <div className="order-details-info-item">
                  <UserRound size={17} aria-hidden="true" />

                  <div>
                    <span>الاسم</span>
                    <strong>{order?.customer?.name || "غير محدد"}</strong>
                  </div>
                </div>

                <div className="order-details-info-item">
                  <Phone size={17} aria-hidden="true" />

                  <div>
                    <span>رقم الجوال</span>
                    <strong>{order?.customer?.phone || "غير محدد"}</strong>
                  </div>
                </div>

                <div className="order-details-info-item">
                  <MapPin size={17} aria-hidden="true" />

                  <div>
                    <span>المنطقة</span>
                    <strong>{order?.customer?.location || "غير محدد"}</strong>
                  </div>
                </div>

                <div className="order-details-info-item">
                  <Home size={17} aria-hidden="true" />

                  <div>
                    <span>العنوان</span>
                    <strong>{order?.customer?.address || "غير محدد"}</strong>
                  </div>
                </div>
              </div>

              {order?.customer?.notes && (
                <div className="order-details-notes">
                  <span>ملاحظات</span>
                  <p>{order.customer.notes}</p>
                </div>
              )}
            </section>
          </div>

          {/* SUMMARY */}

          <aside className="order-details-summary">
            <h2>ملخص الطلب</h2>

            <div className="order-details-summary-row">
              <span>رقم الطلب</span>
              <strong>#{orderId}</strong>
            </div>

            <div className="order-details-summary-row">
              <span>تاريخ الطلب</span>

              <div className="order-details-summary-value">
                <CalendarDays size={15} aria-hidden="true" />
                <strong>{formatDate(order.createdAt)}</strong>
              </div>
            </div>

            <div className="order-details-summary-row">
              <span>عدد المنتجات</span>
              <strong>{products.length}</strong>
            </div>

            <div className="order-details-summary-divider" />

            <div className="order-details-summary-row">
              <span>طريقة الاستلام</span>

              <div className="order-details-summary-value">
                <Truck size={15} aria-hidden="true" />
                <strong>{getDeliveryMethod()}</strong>
              </div>
            </div>

            <div className="order-details-summary-row">
              <span>طريقة الدفع</span>

              <div className="order-details-summary-value">
                <Banknote size={15} aria-hidden="true" />
                <strong>{getPaymentMethod()}</strong>
              </div>
            </div>

            <div className="order-details-summary-divider" />

            <div className="order-details-total">
              <span>الإجمالي</span>

              <div>
                <strong>{formatPrice(order.total)}</strong>
                <span>₪</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default OrderDetails;
