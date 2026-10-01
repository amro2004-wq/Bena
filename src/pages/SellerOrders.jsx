import "./SellerOrders.css";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  Store,
  CalendarDays,
  ShoppingBag,
  MapPin,
  ChevronLeft,
  ImageOff,
  UserRound,
  PackageCheck,
} from "lucide-react";

/* =========================
   FILTERS
========================= */

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

function SellerOrders() {
  const navigate = useNavigate();

  /* =========================
     STORAGE
  ========================= */

  const readStorage = useCallback((key, fallback) => {
    try {
      const value = localStorage.getItem(key);

      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }, []);

  /* =========================
     CURRENT USER
  ========================= */

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

  /* =========================
     FILTER
  ========================= */

  const [activeFilter, setActiveFilter] = useState("all");

  /* =========================
     STATUS
  ========================= */

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

  /* =========================
     SELLER ORDERS
  ========================= */

  const getSellerOrders = useCallback(
    (targetSellerId) => {
      if (!targetSellerId) {
        return [];
      }

      const savedOrders = readStorage("benaOrders", []);

      if (!Array.isArray(savedOrders)) {
        return [];
      }

      return savedOrders
        .filter((order) => {
          if (!order || typeof order !== "object" || Array.isArray(order)) {
            return false;
          }

          /*
            الطلبات الجديدة:
            sellerId موجود مباشرة على الطلب.
          */

          if (order.sellerId !== undefined && order.sellerId !== null) {
            return String(order.sellerId) === String(targetSellerId);
          }

          /*
            دعم مؤقت للطلبات القديمة:
            نفحص المنتجات الموجودة داخل الطلب.
          */

          if (Array.isArray(order.products)) {
            return order.products.some((product) => {
              if (
                !product ||
                typeof product !== "object" ||
                Array.isArray(product)
              ) {
                return false;
              }

              if (product.sellerId === undefined || product.sellerId === null) {
                return false;
              }

              return String(product.sellerId) === String(targetSellerId);
            });
          }

          return false;
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

  const [orders, setOrders] = useState(() => getSellerOrders(userId));

  /* =========================
     REFRESH
  ========================= */

  const refreshOrders = useCallback(() => {
    const user = getCurrentUser();

    setCurrentUser(user);

    const targetUserId =
      user?.id !== undefined && user?.id !== null ? String(user.id) : null;

    setOrders(getSellerOrders(targetUserId));
  }, [getCurrentUser, getSellerOrders]);

  /* =========================
     EVENTS
  ========================= */

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

  /* =========================
     FILTER COUNTS
  ========================= */

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

  /* =========================
     FILTERED ORDERS
  ========================= */

  const filteredOrders = useMemo(() => {
    if (activeFilter === "all") {
      return orders;
    }

    return orders.filter((order) => getOrderStatus(order) === activeFilter);
  }, [orders, activeFilter, getOrderStatus]);

  /* =========================
     DATE
  ========================= */

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

  /* =========================
     PRODUCT IMAGE
  ========================= */

  const getProductImage = (product) => {
    if (product?.image) {
      return product.image;
    }

    if (Array.isArray(product?.images) && product.images.length > 0) {
      return product.images[0];
    }

    return null;
  };

  /* =========================
     TOTAL
  ========================= */

  const getOrderTotal = (order) => {
    const total = Number(order?.total);

    return Number.isFinite(total) && total >= 0 ? total : 0;
  };

  /* =========================
     ORDER ID
  ========================= */

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

  /* =========================
     CUSTOMER NAME
  ========================= */

  const getCustomerName = (order) => {
    if (
      typeof order?.customer?.name === "string" &&
      order.customer.name.trim()
    ) {
      return order.customer.name.trim();
    }

    if (typeof order?.buyerName === "string" && order.buyerName.trim()) {
      return order.buyerName.trim();
    }

    return "مستخدم بينا";
  };

  /* =========================
     PRODUCTS FOR THIS SELLER
  ========================= */

  const getOrderProducts = (order) => {
    if (!Array.isArray(order?.products)) {
      return [];
    }

    const validProducts = order.products.filter(
      (product) =>
        product && typeof product === "object" && !Array.isArray(product),
    );

    /*
      الطلب الجديد يحتوي فقط منتجات البائع.
    */

    if (
      order?.sellerId !== undefined &&
      order?.sellerId !== null &&
      String(order.sellerId) === String(userId)
    ) {
      return validProducts;
    }

    /*
      دعم الطلبات القديمة.
    */

    return validProducts.filter(
      (product) =>
        product?.sellerId !== undefined &&
        product?.sellerId !== null &&
        String(product.sellerId) === String(userId),
    );
  };

  /* =========================
     OPEN ORDER
  ========================= */

  const openOrder = (order) => {
    const orderId = getOrderId(order);

    if (!orderId) {
      return;
    }

    navigate(`/seller-orders/${encodeURIComponent(orderId)}`);
  };

  /* =========================
     PAGE
  ========================= */

  return (
    <main className="seller-orders-page" dir="rtl">
      <div className="seller-orders-container">
        {/* BACK */}

        <button
          type="button"
          className="seller-orders-back"
          onClick={() => navigate("/")}
        >
          <ArrowRight size={19} />

          <span>العودة للرئيسية</span>
        </button>

        {/* HEADING */}

        <div className="seller-orders-heading">
          <span>إدارة المبيعات</span>

          <h1>
            <Store size={30} aria-hidden="true" />
            الطلبات الواردة
          </h1>

          <p>تابع الطلبات الجديدة على منتجاتك وأدر حالة كل طلب.</p>
        </div>

        {orders.length > 0 ? (
          <>
            {/* STATS */}

            <div className="seller-orders-stats">
              <div className="seller-orders-stat">
                <div>
                  <ShoppingBag size={20} />
                </div>

                <span>إجمالي الطلبات</span>

                <strong>{orders.length}</strong>
              </div>

              <div className="seller-orders-stat">
                <div>
                  <PackageCheck size={20} />
                </div>

                <span>طلبات مكتملة</span>

                <strong>{filterCounts.completed}</strong>
              </div>

              <div className="seller-orders-stat">
                <div>
                  <Store size={20} />
                </div>

                <span>بانتظار المراجعة</span>

                <strong>{filterCounts.pending}</strong>
              </div>
            </div>

            {/* FILTERS */}

            <div
              className="seller-orders-filters"
              role="group"
              aria-label="تصفية الطلبات الواردة حسب الحالة"
            >
              {ORDER_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  className={`seller-orders-filter ${
                    activeFilter === filter.value ? "active" : ""
                  }`}
                  aria-pressed={activeFilter === filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                >
                  <span>{filter.label}</span>

                  <span
                    className="seller-orders-filter-count"
                    aria-hidden="true"
                  >
                    {filterCounts[filter.value] ?? 0}
                  </span>
                </button>
              ))}
            </div>

            {/* ORDERS */}

            {filteredOrders.length > 0 ? (
              <div className="seller-orders-list">
                {filteredOrders.map((order, orderIndex) => {
                  const orderStatus = getOrderStatus(order);

                  const status = getStatusInfo(orderStatus);

                  const orderId = getOrderId(order);

                  const products = getOrderProducts(order);

                  const orderKey =
                    orderId ||
                    `seller-order-${orderIndex}-${order.createdAt || ""}`;

                  return (
                    <article className="seller-order-card" key={orderKey}>
                      {/* TOP */}

                      <div className="seller-order-top">
                        <div className="seller-order-number">
                          <span>رقم الطلب</span>

                          <strong>
                            {orderId ? `#${orderId}` : "غير محدد"}
                          </strong>
                        </div>

                        <span
                          className={`seller-order-status ${status.className}`}
                        >
                          {status.text}
                        </span>
                      </div>

                      {/* CUSTOMER */}

                      <div className="seller-order-customer">
                        <div className="seller-order-customer-icon">
                          <UserRound size={20} aria-hidden="true" />
                        </div>

                        <div>
                          <span>طلب من</span>

                          <strong>{getCustomerName(order)}</strong>
                        </div>
                      </div>

                      {/* INFO */}

                      <div className="seller-order-info">
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

                      <div className="seller-order-products">
                        {products.length > 0 ? (
                          <>
                            {products.slice(0, 4).map((product, index) => {
                              const image = getProductImage(product);

                              return (
                                <div
                                  className="seller-order-product"
                                  key={`${orderKey}-${
                                    product?.id ?? "product"
                                  }-${index}`}
                                >
                                  <div className="seller-order-product-image">
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
                                          className="seller-order-image-fallback"
                                          hidden
                                        >
                                          <ImageOff
                                            size={21}
                                            strokeWidth={1.5}
                                          />
                                        </div>
                                      </>
                                    ) : (
                                      <div className="seller-order-image-fallback">
                                        <ImageOff size={21} strokeWidth={1.5} />
                                      </div>
                                    )}
                                  </div>

                                  <div className="seller-order-product-info">
                                    <strong>{product?.name || "منتج"}</strong>

                                    <span>
                                      {Number(
                                        product?.price || 0,
                                      ).toLocaleString()}{" "}
                                      ₪
                                    </span>
                                  </div>
                                </div>
                              );
                            })}

                            {products.length > 4 && (
                              <div className="seller-order-more">
                                +{products.length - 4}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="seller-order-no-products">
                            لا توجد تفاصيل للمنتجات
                          </div>
                        )}
                      </div>

                      {/* BOTTOM */}

                      <div className="seller-order-bottom">
                        <div className="seller-order-total">
                          <span>قيمة الطلب</span>

                          <div>
                            <strong>
                              {getOrderTotal(order).toLocaleString()}
                            </strong>

                            <span>₪</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="seller-order-details-button"
                          onClick={() => openOrder(order)}
                          disabled={!orderId}
                        >
                          إدارة الطلب
                          <ChevronLeft size={17} aria-hidden="true" />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="seller-orders-filter-empty">
                <div>
                  <Store size={32} />
                </div>

                <h2>لا توجد طلبات بهذه الحالة</h2>

                <p>لا يوجد حاليًا أي طلب وارد ضمن هذه الحالة.</p>

                <button type="button" onClick={() => setActiveFilter("all")}>
                  عرض جميع الطلبات
                </button>
              </div>
            )}
          </>
        ) : (
          /* EMPTY */

          <div className="seller-orders-empty">
            <div>
              <Store size={40} aria-hidden="true" />
            </div>

            <span>طلبات البيع</span>

            <h2>لا توجد طلبات واردة بعد</h2>

            <p>
              عندما يشتري أحد المستخدمين منتجًا قمت بنشره، سيظهر الطلب هنا
              لتتمكن من متابعته وإدارته.
            </p>

            <button type="button" onClick={() => navigate("/my-products")}>
              عرض منتجاتي
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default SellerOrders;
