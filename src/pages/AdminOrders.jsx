import "./AdminOrders.css";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  Package,
  Search,
  CalendarDays,
  UserRound,
  MapPin,
  ChevronDown,
  Clock3,
  CheckCircle2,
  Boxes,
  XCircle,
  BadgeCheck,
  ImageOff,
} from "lucide-react";

import Toast from "../components/Toast";
import AdminSidebar from "../components/AdminSidebar";

/* STATUSES */

const ALLOWED_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "completed",
  "cancelled",
];

/* NEXT STATUS */

const NEXT_STATUS = {
  pending: "confirmed",
  confirmed: "preparing",
  preparing: "completed",
};

/* STATUS NOTIFICATIONS */

const STATUS_NOTIFICATION_TEXT = {
  confirmed: {
    title: "تم تأكيد طلبك",
    message: "تم تأكيد طلبك وهو الآن جاهز للمرحلة التالية.",
  },

  preparing: {
    title: "طلبك قيد التجهيز",
    message: "تم تحديث طلبك وبدأت عملية التجهيز.",
  },

  completed: {
    title: "تم إكمال طلبك",
    message: "تم تحديث حالة طلبك إلى مكتمل.",
  },

  cancelled: {
    title: "تم إلغاء الطلب",
    message: "تم إلغاء طلبك.",
  },
};

function AdminOrders() {
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

  /* GET ORDERS */

  const getStoredOrders = useCallback(() => {
    const savedOrders = readStorage("benaOrders", []);

    if (!Array.isArray(savedOrders)) {
      return [];
    }

    return savedOrders.filter(
      (order) =>
        order &&
        typeof order === "object" &&
        !Array.isArray(order) &&
        order.id !== undefined &&
        order.id !== null,
    );
  }, [readStorage]);

  /* ORDERS */

  const [orders, setOrders] = useState(() => getStoredOrders());

  /* SEARCH */

  const [search, setSearch] = useState("");

  /* FILTER */

  const [activeFilter, setActiveFilter] = useState("all");

  /* TOAST */

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  /* TOAST HELPER */

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

  /* REFRESH ORDERS */

  const refreshOrders = useCallback(() => {
    setOrders(getStoredOrders());
  }, [getStoredOrders]);

  /* EVENTS */

  useEffect(() => {
    refreshOrders();

    const handleStorage = (event) => {
      if (!event.key || event.key === "benaOrders") {
        refreshOrders();
      }
    };

    const handleOrdersUpdated = () => {
      refreshOrders();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("bena-orders-updated", handleOrdersUpdated);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("bena-orders-updated", handleOrdersUpdated);
    };
  }, [refreshOrders]);

  /* STATUS */

  const getOrderStatus = useCallback((order) => {
    const status = String(order?.status || "pending")
      .trim()
      .toLowerCase();

    return ALLOWED_STATUSES.includes(status) ? status : "pending";
  }, []);

  const getStatusText = (status) => {
    switch (status) {
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

  /* AVAILABLE STATUSES */

  const getAvailableStatuses = (currentStatus) => {
    if (currentStatus === "completed") {
      return ["completed"];
    }

    if (currentStatus === "cancelled") {
      return ["cancelled"];
    }

    const nextStatus = NEXT_STATUS[currentStatus];

    const statuses = [currentStatus];

    if (nextStatus) {
      statuses.push(nextStatus);
    }

    statuses.push("cancelled");

    return statuses;
  };

  /* DATE */

  const formatDate = (date) => {
    if (!date) {
      return "غير معروف";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "غير معروف";
    }

    return parsedDate.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

  /* ORDER PRODUCTS */

  const getOrderProducts = (order) => {
    if (!Array.isArray(order?.products)) {
      return [];
    }

    return order.products.filter(
      (product) =>
        product && typeof product === "object" && !Array.isArray(product),
    );
  };

  /* ORDER TOTAL */

  const getOrderTotal = (order) => {
    const total = Number(order?.total);

    if (!Number.isFinite(total) || total < 0) {
      return 0;
    }

    return total;
  };

  /* STATISTICS */

  const statistics = useMemo(() => {
    const safeOrders = Array.isArray(orders) ? orders : [];

    return {
      all: safeOrders.length,

      pending: safeOrders.filter((order) => getOrderStatus(order) === "pending")
        .length,

      confirmed: safeOrders.filter(
        (order) => getOrderStatus(order) === "confirmed",
      ).length,

      preparing: safeOrders.filter(
        (order) => getOrderStatus(order) === "preparing",
      ).length,

      completed: safeOrders.filter(
        (order) => getOrderStatus(order) === "completed",
      ).length,

      cancelled: safeOrders.filter(
        (order) => getOrderStatus(order) === "cancelled",
      ).length,
    };
  }, [orders, getOrderStatus]);

  /* FILTERED ORDERS */

  const filteredOrders = useMemo(() => {
    const value = search.trim().toLowerCase();

    return [...orders]
      .filter((order) => {
        const matchesStatus =
          activeFilter === "all" || getOrderStatus(order) === activeFilter;

        if (!matchesStatus) {
          return false;
        }

        if (!value) {
          return true;
        }

        const orderId = String(order?.id || "").toLowerCase();

        const customerName = String(order?.customer?.name || "").toLowerCase();

        const customerPhone = String(
          order?.customer?.phone || "",
        ).toLowerCase();

        const customerLocation = String(
          order?.customer?.location || "",
        ).toLowerCase();

        const customerAddress = String(
          order?.customer?.address || "",
        ).toLowerCase();

        return (
          orderId.includes(value) ||
          customerName.includes(value) ||
          customerPhone.includes(value) ||
          customerLocation.includes(value) ||
          customerAddress.includes(value)
        );
      })
      .sort((a, b) => {
        const firstDate = new Date(a?.createdAt || 0).getTime();
        const secondDate = new Date(b?.createdAt || 0).getTime();

        const safeFirstDate = Number.isNaN(firstDate) ? 0 : firstDate;
        const safeSecondDate = Number.isNaN(secondDate) ? 0 : secondDate;

        return safeSecondDate - safeFirstDate;
      });
  }, [orders, search, activeFilter, getOrderStatus]);

  /* CREATE BUYER NOTIFICATION */

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
        return true;
      }

      const notificationInfo = STATUS_NOTIFICATION_TEXT[newStatus];

      if (!notificationInfo) {
        return true;
      }

      try {
        const notificationsData = readStorage("benaNotifications", []);

        const notifications = Array.isArray(notificationsData)
          ? notificationsData
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

        return true;
      } catch (error) {
        console.error("Failed to create buyer notification:", error);

        return false;
      }
    },
    [readStorage],
  );

  /* UPDATE STATUS */

  const updateOrderStatus = (orderId, newStatus) => {
    const normalizedStatus = String(newStatus || "")
      .trim()
      .toLowerCase();

    if (!ALLOWED_STATUSES.includes(normalizedStatus)) {
      showToast("حالة الطلب غير صالحة", "error");
      return;
    }

    const latestOrders = getStoredOrders();

    const currentOrder = latestOrders.find(
      (order) => String(order.id) === String(orderId),
    );

    if (!currentOrder) {
      refreshOrders();
      showToast("تعذر العثور على الطلب", "error");
      return;
    }

    const currentStatus = getOrderStatus(currentOrder);

    if (currentStatus === normalizedStatus) {
      return;
    }

    if (currentStatus === "completed") {
      showToast("الطلب مكتمل ولا يمكن تغيير حالته", "error");
      refreshOrders();
      return;
    }

    if (currentStatus === "cancelled") {
      showToast("الطلب ملغي ولا يمكن تغيير حالته", "error");
      refreshOrders();
      return;
    }

    const nextStatus = NEXT_STATUS[currentStatus];

    const isNextStatus = normalizedStatus === nextStatus;
    const isCancellation = normalizedStatus === "cancelled";

    if (!isNextStatus && !isCancellation) {
      showToast("يجب تحديث حالة الطلب حسب ترتيب المراحل", "error");
      refreshOrders();
      return;
    }

    const updatedAt = new Date().toISOString();

    let updatedOrder = null;

    const updatedOrders = latestOrders.map((order) => {
      if (String(order.id) !== String(orderId)) {
        return order;
      }

      updatedOrder = {
        ...order,
        status: normalizedStatus,
        updatedAt,
        statusUpdatedAt: updatedAt,
        statusUpdatedBy: "admin",
      };

      return updatedOrder;
    });

    if (!updatedOrder) {
      showToast("تعذر العثور على الطلب", "error");
      return;
    }

    try {
      localStorage.setItem("benaOrders", JSON.stringify(updatedOrders));

      setOrders(updatedOrders);

      window.dispatchEvent(new CustomEvent("bena-orders-updated"));
    } catch (error) {
      console.error("Failed to update order:", error);

      showToast("تعذر تحديث حالة الطلب", "error");
      return;
    }

    const notificationCreated = createBuyerNotification(
      updatedOrder,
      normalizedStatus,
      updatedAt,
    );

    if (!notificationCreated) {
      showToast("تم تحديث الطلب، لكن تعذر إنشاء الإشعار", "info");

      return;
    }

    showToast(
      `تم تحديث الطلب #${orderId} إلى ${getStatusText(normalizedStatus)}`,
      "success",
    );
  };

  /* RESET */

  const resetFilters = () => {
    setSearch("");
    setActiveFilter("all");
  };

  return (
    <main className="admin-orders-page" dir="rtl">
      <Toast show={toast.show} message={toast.message} type={toast.type} />

      <AdminSidebar />

      <section className="admin-orders-content">
        {/* HEADER */}

        <div className="admin-orders-header">
          <div>
            <span>إدارة المنصة</span>

            <h1>
              <Package size={28} />
              إدارة الطلبات
            </h1>

            <p>راجع جميع طلبات المستخدمين وقم بتحديث حالتها.</p>
          </div>

          <div className="admin-orders-header-count">
            <span>إجمالي الطلبات</span>

            <strong>{statistics.all}</strong>

            <small>طلب مسجل</small>
          </div>
        </div>

        {/* STATISTICS */}

        <div className="admin-orders-stats">
          <button
            type="button"
            className={`admin-orders-stat total ${
              activeFilter === "all" ? "active" : ""
            }`}
            onClick={() => setActiveFilter("all")}
          >
            <div className="admin-orders-stat-icon">
              <Package size={21} />
            </div>

            <div>
              <span>إجمالي الطلبات</span>
              <strong>{statistics.all}</strong>
            </div>
          </button>

          <button
            type="button"
            className={`admin-orders-stat pending ${
              activeFilter === "pending" ? "active" : ""
            }`}
            onClick={() => setActiveFilter("pending")}
          >
            <div className="admin-orders-stat-icon">
              <Clock3 size={21} />
            </div>

            <div>
              <span>قيد الانتظار</span>
              <strong>{statistics.pending}</strong>
            </div>
          </button>

          <button
            type="button"
            className={`admin-orders-stat confirmed ${
              activeFilter === "confirmed" ? "active" : ""
            }`}
            onClick={() => setActiveFilter("confirmed")}
          >
            <div className="admin-orders-stat-icon">
              <BadgeCheck size={21} />
            </div>

            <div>
              <span>تم التأكيد</span>
              <strong>{statistics.confirmed}</strong>
            </div>
          </button>

          <button
            type="button"
            className={`admin-orders-stat preparing ${
              activeFilter === "preparing" ? "active" : ""
            }`}
            onClick={() => setActiveFilter("preparing")}
          >
            <div className="admin-orders-stat-icon">
              <Boxes size={21} />
            </div>

            <div>
              <span>قيد التجهيز</span>
              <strong>{statistics.preparing}</strong>
            </div>
          </button>

          <button
            type="button"
            className={`admin-orders-stat completed ${
              activeFilter === "completed" ? "active" : ""
            }`}
            onClick={() => setActiveFilter("completed")}
          >
            <div className="admin-orders-stat-icon">
              <CheckCircle2 size={21} />
            </div>

            <div>
              <span>مكتملة</span>
              <strong>{statistics.completed}</strong>
            </div>
          </button>

          <button
            type="button"
            className={`admin-orders-stat cancelled ${
              activeFilter === "cancelled" ? "active" : ""
            }`}
            onClick={() => setActiveFilter("cancelled")}
          >
            <div className="admin-orders-stat-icon">
              <XCircle size={21} />
            </div>

            <div>
              <span>ملغية</span>
              <strong>{statistics.cancelled}</strong>
            </div>
          </button>
        </div>

        {/* TOOLS */}

        <div className="admin-orders-tools">
          <label className="admin-orders-search">
            <Search size={17} />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ابحث برقم الطلب، الاسم، الهاتف، المنطقة أو العنوان..."
              aria-label="البحث في الطلبات"
            />
          </label>

          <div className="admin-orders-filters" aria-label="تصفية الطلبات">
            <button
              type="button"
              className={activeFilter === "all" ? "active" : ""}
              onClick={() => setActiveFilter("all")}
            >
              الكل
              <span className="admin-orders-filter-count">
                {statistics.all}
              </span>
            </button>

            <button
              type="button"
              className={activeFilter === "pending" ? "active" : ""}
              onClick={() => setActiveFilter("pending")}
            >
              الانتظار
              <span className="admin-orders-filter-count">
                {statistics.pending}
              </span>
            </button>

            <button
              type="button"
              className={activeFilter === "confirmed" ? "active" : ""}
              onClick={() => setActiveFilter("confirmed")}
            >
              المؤكدة
              <span className="admin-orders-filter-count">
                {statistics.confirmed}
              </span>
            </button>

            <button
              type="button"
              className={activeFilter === "preparing" ? "active" : ""}
              onClick={() => setActiveFilter("preparing")}
            >
              التجهيز
              <span className="admin-orders-filter-count">
                {statistics.preparing}
              </span>
            </button>

            <button
              type="button"
              className={activeFilter === "completed" ? "active" : ""}
              onClick={() => setActiveFilter("completed")}
            >
              المكتملة
              <span className="admin-orders-filter-count">
                {statistics.completed}
              </span>
            </button>

            <button
              type="button"
              className={activeFilter === "cancelled" ? "active" : ""}
              onClick={() => setActiveFilter("cancelled")}
            >
              الملغية
              <span className="admin-orders-filter-count">
                {statistics.cancelled}
              </span>
            </button>
          </div>
        </div>

        {/* RESULTS */}

        <div className="admin-orders-results">
          عرض <strong>{filteredOrders.length}</strong> من{" "}
          <strong>{statistics.all}</strong> طلب
        </div>

        {/* ORDERS */}

        {filteredOrders.length > 0 ? (
          <div className="admin-orders-list">
            {filteredOrders.map((order) => {
              const status = getOrderStatus(order);
              const products = getOrderProducts(order);
              const total = getOrderTotal(order);
              const orderId = String(order.id);

              const availableStatuses = getAvailableStatuses(status);

              return (
                <article className="admin-order-card" key={orderId}>
                  <div className="admin-order-card-header">
                    <div>
                      <span className="admin-order-number">طلب #{orderId}</span>

                      <div className="admin-order-date">
                        <CalendarDays size={14} />
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                    </div>

                    <div className={`admin-order-status ${status}`}>
                      {getStatusText(status)}
                    </div>
                  </div>

                  <div className="admin-order-body">
                    <div className="admin-order-customer">
                      <div className="admin-order-customer-icon">
                        <UserRound size={20} />
                      </div>

                      <div>
                        <span>العميل</span>

                        <strong>
                          {order.customer?.name || "مستخدم غير معروف"}
                        </strong>

                        <small>
                          {order.customer?.phone || "لا يوجد رقم هاتف"}
                        </small>
                      </div>
                    </div>

                    <div className="admin-order-location">
                      <MapPin size={17} />

                      <div>
                        <span>العنوان</span>

                        <strong>
                          {order.customer?.location || "غير محدد"}
                        </strong>

                        <small>
                          {order.customer?.address || "لا يوجد عنوان تفصيلي"}
                        </small>
                      </div>
                    </div>

                    <div className="admin-order-total">
                      <span>إجمالي الطلب</span>

                      <div>
                        <strong>{total.toLocaleString()}</strong>

                        <span>₪</span>
                      </div>
                    </div>
                  </div>

                  {/* PRODUCTS */}

                  <div className="admin-order-products">
                    {products.length > 0 ? (
                      products.map((product, index) => {
                        const productImage = getProductImage(product);

                        const productPrice = Number(product?.price);

                        const safePrice =
                          Number.isFinite(productPrice) && productPrice >= 0
                            ? productPrice
                            : 0;

                        return (
                          <div
                            className="admin-order-product"
                            key={
                              product?.id !== undefined && product?.id !== null
                                ? `${String(product.id)}-${index}`
                                : `product-${index}`
                            }
                          >
                            <div className="admin-order-product-image">
                              {productImage ? (
                                <>
                                  <img
                                    src={productImage}
                                    alt={product?.name || "صورة المنتج"}
                                    onError={(event) => {
                                      event.currentTarget.style.display =
                                        "none";

                                      const fallback =
                                        event.currentTarget.nextElementSibling;

                                      if (fallback) {
                                        fallback.style.display = "flex";
                                      }
                                    }}
                                  />

                                  <div
                                    className="admin-order-product-fallback"
                                    style={{
                                      display: "none",
                                    }}
                                  >
                                    <ImageOff size={21} strokeWidth={1.5} />
                                  </div>
                                </>
                              ) : (
                                <div className="admin-order-product-fallback">
                                  <ImageOff size={21} strokeWidth={1.5} />
                                </div>
                              )}
                            </div>

                            <div className="admin-order-product-info">
                              <strong>
                                {product?.name || "منتج بدون اسم"}
                              </strong>

                              <span>{product?.category || "أخرى"}</span>
                            </div>

                            <div className="admin-order-product-price">
                              <strong>{safePrice.toLocaleString()}</strong>

                              <span>₪</span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="admin-order-products-empty">
                        لا توجد منتجات محفوظة لهذا الطلب.
                      </div>
                    )}
                  </div>

                  {/* FOOTER */}

                  <div className="admin-order-card-footer">
                    <div className="admin-order-status-control">
                      <span>حالة الطلب</span>

                      <div className="admin-order-status-select">
                        <select
                          value={status}
                          disabled={
                            status === "completed" || status === "cancelled"
                          }
                          onChange={(event) =>
                            updateOrderStatus(order.id, event.target.value)
                          }
                          aria-label={`تغيير حالة الطلب ${orderId}`}
                        >
                          {availableStatuses.map((availableStatus) => (
                            <option
                              value={availableStatus}
                              key={availableStatus}
                            >
                              {getStatusText(availableStatus)}
                            </option>
                          ))}
                        </select>

                        <ChevronDown size={15} />
                      </div>
                    </div>

                    <div className="admin-order-products-count">
                      <Package size={15} />

                      <span>
                        {products.length === 1
                          ? "1 منتج"
                          : `${products.length} منتجات`}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="admin-orders-empty">
            <Package size={38} strokeWidth={1.5} />

            <h2>لا توجد طلبات</h2>

            <p>
              {search || activeFilter !== "all"
                ? "لا توجد طلبات مطابقة للبحث أو الفلتر الحالي."
                : "لم يتم تسجيل أي طلبات حتى الآن."}
            </p>

            {(search || activeFilter !== "all") && (
              <button type="button" onClick={resetFilters}>
                عرض جميع الطلبات
              </button>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminOrders;
