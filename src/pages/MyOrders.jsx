import "./MyOrders.css";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  Package,
  CalendarDays,
  ShoppingBag,
  MapPin,
  ChevronLeft,
  ImageOff,
} from "lucide-react";

/* FILTERS */

const ORDER_FILTERS = [
  {
    value: "all",
    label: "الكل",
  },
  {
    value: "pending",
    label: "قيد الانتظار",
  },
  {
    value: "confirmed",
    label: "تم التأكيد",
  },
  {
    value: "preparing",
    label: "قيد التجهيز",
  },
  {
    value: "completed",
    label: "مكتمل",
  },
  {
    value: "cancelled",
    label: "ملغي",
  },
];

const ALLOWED_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "completed",
  "cancelled",
];

function MyOrders() {
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

  /* FILTER */

  const [activeFilter, setActiveFilter] = useState("all");

  /* STATUS */

  const getOrderStatus = useCallback((order) => {
    const status = String(order?.status || "pending");

    return ALLOWED_STATUSES.includes(status) ? status : "pending";
  }, []);

  const getStatusInfo = (status) => {
    switch (status) {
      case "confirmed":
        return {
          text: "تم التأكيد",
          className: "confirmed",
        };

      case "preparing":
        return {
          text: "قيد التجهيز",
          className: "preparing",
        };

      case "completed":
        return {
          text: "مكتمل",
          className: "completed",
        };

      case "cancelled":
        return {
          text: "ملغي",
          className: "cancelled",
        };

      default:
        return {
          text: "قيد الانتظار",
          className: "pending",
        };
    }
  };

  /* ORDERS */

  const getUserOrders = useCallback(
    (targetUserId) => {
      if (!targetUserId) {
        return [];
      }

      const savedOrders = readStorage("benaOrders", []);

      if (!Array.isArray(savedOrders)) {
        return [];
      }

      return savedOrders
        .filter((order) => {
          if (
            !order ||
            typeof order !== "object" ||
            Array.isArray(order) ||
            order.userId === undefined ||
            order.userId === null
          ) {
            return false;
          }

          return String(order.userId) === String(targetUserId);
        })
        .sort((a, b) => {
          const dateA = new Date(a?.createdAt || 0).getTime();
          const dateB = new Date(b?.createdAt || 0).getTime();

          const safeDateA = Number.isFinite(dateA) ? dateA : 0;
          const safeDateB = Number.isFinite(dateB) ? dateB : 0;

          return safeDateB - safeDateA;
        });
    },
    [readStorage],
  );

  const [orders, setOrders] = useState(() => getUserOrders(userId));

  /* REFRESH */

  const refreshOrders = useCallback(() => {
    const user = getCurrentUser();

    setCurrentUser(user);

    const targetUserId =
      user?.id !== undefined && user?.id !== null ? String(user.id) : null;

    setOrders(getUserOrders(targetUserId));
  }, [getCurrentUser, getUserOrders]);

  /* EVENTS */

  useEffect(() => {
    refreshOrders();

    const handleStorage = (event) => {
      if (
        !event.key ||
        event.key === "benaOrders" ||
        event.key === "benaCurrentUser"
      ) {
        refreshOrders();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("bena-orders-updated", refreshOrders);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("bena-orders-updated", refreshOrders);
    };
  }, [refreshOrders]);

  /* FILTER COUNTS */

  const filterCounts = useMemo(() => {
    const counts = {
      all: orders.length,
      pending: 0,
      confirmed: 0,
      preparing: 0,
      completed: 0,
      cancelled: 0,
    };

    orders.forEach((order) => {
      const status = getOrderStatus(order);

      if (Object.prototype.hasOwnProperty.call(counts, status)) {
        counts[status] += 1;
      }
    });

    return counts;
  }, [orders, getOrderStatus]);

  /* FILTERED ORDERS */

  const filteredOrders = useMemo(() => {
    if (activeFilter === "all") {
      return orders;
    }

    return orders.filter((order) => getOrderStatus(order) === activeFilter);
  }, [orders, activeFilter, getOrderStatus]);

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

  /* TOTAL */

  const getOrderTotal = (order) => {
    const total = Number(order?.total);

    return Number.isFinite(total) && total >= 0 ? total : 0;
  };

  /* ORDER ID */

  const getOrderId = (order) => {
    if (
      order?.id === undefined ||
      order?.id === null ||
      String(order.id).trim() === ""
    ) {
      return null;
    }

    return String(order.id);
  };

  /* OPEN ORDER */

  const openOrder = (order) => {
    const orderId = getOrderId(order);

    if (!orderId) {
      return;
    }

    navigate(`/orders/${encodeURIComponent(orderId)}`);
  };

  return (
    <main className="my-orders-page" dir="rtl">
      <div className="my-orders-container">
        {/* BACK */}

        <button
          type="button"
          className="my-orders-back"
          onClick={() => navigate("/")}
        >
          <ArrowRight size={19} />

          <span>العودة للرئيسية</span>
        </button>

        {/* HEADING */}

        <div className="my-orders-heading">
          <span>مشترياتك</span>

          <h1>
            <Package size={30} aria-hidden="true" />
            طلباتي
          </h1>

          <p>تابع جميع الطلبات التي قمت بإنشائها على بينا.</p>
        </div>

        {orders.length > 0 ? (
          <>
            {/* FILTERS */}

            <div
              className="my-orders-filters"
              role="group"
              aria-label="تصفية الطلبات حسب الحالة"
            >
              {ORDER_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  className={`my-orders-filter ${
                    activeFilter === filter.value ? "active" : ""
                  }`}
                  aria-pressed={activeFilter === filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                >
                  <span>{filter.label}</span>

                  <span className="my-orders-filter-count" aria-hidden="true">
                    {filterCounts[filter.value] ?? 0}
                  </span>
                </button>
              ))}
            </div>

            {/* ORDERS */}

            {filteredOrders.length > 0 ? (
              <div className="my-orders-list">
                {filteredOrders.map((order, orderIndex) => {
                  const orderStatus = getOrderStatus(order);
                  const status = getStatusInfo(orderStatus);
                  const orderId = getOrderId(order);

                  const products = Array.isArray(order?.products)
                    ? order.products.filter(
                        (product) =>
                          product &&
                          typeof product === "object" &&
                          !Array.isArray(product),
                      )
                    : [];

                  const orderKey =
                    orderId || `order-${orderIndex}-${order.createdAt || ""}`;

                  return (
                    <article className="my-order-card" key={orderKey}>
                      {/* TOP */}

                      <div className="my-order-top">
                        <div>
                          <span className="my-order-label">رقم الطلب</span>

                          <strong>
                            {orderId ? `#${orderId}` : "غير محدد"}
                          </strong>
                        </div>

                        <span className={`my-order-status ${status.className}`}>
                          {status.text}
                        </span>
                      </div>

                      {/* INFO */}

                      <div className="my-order-info">
                        <div>
                          <CalendarDays size={16} aria-hidden="true" />

                          <span>{formatDate(order.createdAt)}</span>
                        </div>

                        <div>
                          <ShoppingBag size={16} aria-hidden="true" />

                          <span>
                            {products.length}{" "}
                            {products.length === 1 ? "منتج" : "منتجات"}
                          </span>
                        </div>

                        <div>
                          <MapPin size={16} aria-hidden="true" />

                          <span>{order?.customer?.location || "غير محدد"}</span>
                        </div>
                      </div>

                      {/* PRODUCTS */}

                      <div className="my-order-products">
                        {products.length > 0 ? (
                          <>
                            {products.slice(0, 4).map((product, index) => {
                              const image = getProductImage(product);

                              return (
                                <div
                                  className="my-order-product-image"
                                  key={`${orderKey}-${
                                    product?.id ?? "product"
                                  }-${index}`}
                                  title={product?.name || "منتج"}
                                >
                                  {image ? (
                                    <>
                                      <img
                                        src={image}
                                        alt={product?.name || "منتج"}
                                        onError={(event) => {
                                          event.currentTarget.style.display =
                                            "none";

                                          const fallback =
                                            event.currentTarget
                                              .nextElementSibling;

                                          if (fallback) {
                                            fallback.hidden = false;
                                          }
                                        }}
                                      />

                                      <div
                                        className="my-order-image-fallback"
                                        hidden
                                      >
                                        <ImageOff
                                          size={22}
                                          strokeWidth={1.5}
                                          aria-hidden="true"
                                        />
                                      </div>
                                    </>
                                  ) : (
                                    <div className="my-order-image-fallback">
                                      <ImageOff
                                        size={22}
                                        strokeWidth={1.5}
                                        aria-hidden="true"
                                      />
                                    </div>
                                  )}
                                </div>
                              );
                            })}

                            {products.length > 4 && (
                              <div
                                className="my-order-more"
                                title={`${products.length - 4} منتجات إضافية`}
                              >
                                +{products.length - 4}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="my-order-no-products">
                            لا توجد تفاصيل للمنتجات
                          </div>
                        )}
                      </div>

                      {/* BOTTOM */}

                      <div className="my-order-bottom">
                        <div className="my-order-total">
                          <span>الإجمالي</span>

                          <div>
                            <strong>
                              {getOrderTotal(order).toLocaleString()}
                            </strong>

                            <span>₪</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="my-order-details-button"
                          onClick={() => openOrder(order)}
                          disabled={!orderId}
                        >
                          تفاصيل الطلب
                          <ChevronLeft size={17} aria-hidden="true" />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              /* FILTER EMPTY */

              <div className="my-orders-filter-empty">
                <div>
                  <Package size={32} aria-hidden="true" />
                </div>

                <h2>لا توجد طلبات بهذه الحالة</h2>

                <p>لا يوجد لديك حاليًا أي طلب ضمن هذه الحالة.</p>

                <button type="button" onClick={() => setActiveFilter("all")}>
                  عرض جميع الطلبات
                </button>
              </div>
            )}
          </>
        ) : (
          /* EMPTY */

          <div className="my-orders-empty">
            <div>
              <Package size={38} aria-hidden="true" />
            </div>

            <h2>لا توجد طلبات بعد</h2>

            <p>بعد إتمام أول عملية شراء سيظهر طلبك هنا.</p>

            <button type="button" onClick={() => navigate("/products")}>
              تصفح المنتجات
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default MyOrders;
