import "./AdminDashboard.css";

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import {
  Users,
  Package,
  MessageCircle,
  ShoppingBag,
  Banknote,
  Clock3,
  ArrowLeft,
  UserRound,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  CalendarDays,
  ChevronLeft,
  Activity,
} from "lucide-react";

import AdminSidebar from "../components/AdminSidebar";

function AdminDashboard() {
  const navigate = useNavigate();

  /* STORAGE */

  const readStorage = (key, fallback) => {
    try {
      const value = localStorage.getItem(key);

      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  };

  const currentUser = readStorage("benaCurrentUser", null);

  const users = readStorage("benaUsers", []);

  const products = readStorage("benaProducts", []);

  const messages = readStorage("benaMessages", {});

  const orders = readStorage("benaOrders", []);

  /* STATISTICS */

  const conversationsCount =
    messages && typeof messages === "object" && !Array.isArray(messages)
      ? Object.keys(messages).length
      : 0;

  const ordersCount = Array.isArray(orders) ? orders.length : 0;

  const activeOrdersCount = Array.isArray(orders)
    ? orders.filter((order) =>
        ["pending", "confirmed", "preparing"].includes(
          order.status || "pending",
        ),
      ).length
    : 0;

  const completedOrdersCount = Array.isArray(orders)
    ? orders.filter((order) => order.status === "completed").length
    : 0;

  const totalSales = Array.isArray(orders)
    ? orders
        .filter((order) => order.status !== "cancelled")
        .reduce((total, order) => total + Number(order.total || 0), 0)
    : 0;

  /* LATEST ORDERS */

  const latestOrders = useMemo(() => {
    if (!Array.isArray(orders)) {
      return [];
    }

    return [...orders]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5);
  }, [orders]);

  /* LATEST USERS */

  const latestUsers = useMemo(() => {
    if (!Array.isArray(users)) {
      return [];
    }

    return [...users]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 4);
  }, [users]);

  /* LATEST PRODUCTS */

  const latestProducts = useMemo(() => {
    if (!Array.isArray(products)) {
      return [];
    }

    return [...products]
      .sort(
        (a, b) =>
          new Date(b.createdAt || b.date || 0) -
          new Date(a.createdAt || a.date || 0),
      )
      .slice(0, 4);
  }, [products]);

  /* SELLER */

  const getSeller = (sellerId) => {
    if (!Array.isArray(users)) {
      return undefined;
    }

    return users.find((user) => Number(user.id) === Number(sellerId));
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
      month: "short",
      day: "numeric",
    });
  };

  /* STATUS */

  const getStatus = (status) => {
    return status || "pending";
  };

  const getStatusText = (status) => {
    const statuses = {
      pending: "قيد الانتظار",
      confirmed: "تم التأكيد",
      preparing: "قيد التجهيز",
      completed: "مكتمل",
      cancelled: "ملغي",
    };

    return statuses[getStatus(status)] || "قيد الانتظار";
  };

  /* DASHBOARD STATS */

  const dashboardStats = [
    {
      title: "المستخدمون",
      value: Array.isArray(users) ? users.length : 0,
      text: "حساب مسجل",
      icon: Users,
      className: "users",
      path: "/admin/users",
    },
    {
      title: "المنتجات",
      value: Array.isArray(products) ? products.length : 0,
      text: "منتج منشور",
      icon: Package,
      className: "products",
      path: "/admin/products",
    },
    {
      title: "الطلبات",
      value: ordersCount,
      text: "طلب على المنصة",
      icon: ShoppingBag,
      className: "orders",
      path: "/admin/orders",
    },
    {
      title: "المحادثات",
      value: conversationsCount,
      text: "محادثة نشطة",
      icon: MessageCircle,
      className: "messages",
      path: "/admin/messages",
    },
  ];

  /* QUICK ACTIONS */

  const quickActions = [
    {
      title: "إدارة المستخدمين",
      text: "عرض الحسابات وإدارتها",
      icon: Users,
      path: "/admin/users",
      className: "users",
    },
    {
      title: "إدارة المنتجات",
      text: "متابعة المنتجات المنشورة",
      icon: Package,
      path: "/admin/products",
      className: "products",
    },
    {
      title: "إدارة الطلبات",
      text: "متابعة حالات الطلبات",
      icon: ShoppingBag,
      path: "/admin/orders",
      className: "orders",
    },
    {
      title: "نشاط المحادثات",
      text: "متابعة التواصل على المنصة",
      icon: MessageCircle,
      path: "/admin/messages",
      className: "messages",
    },
  ];

  return (
    <div className="admin-dashboard-layout" dir="rtl">
      <AdminSidebar />

      <main className="admin-dashboard-page">
        <div className="admin-dashboard-container">
          {/* HEADER */}

          <header className="admin-dashboard-header">
            <div className="admin-dashboard-header-content">
              <div className="admin-dashboard-eyebrow">
                <Activity size={14} />

                <span>لوحة الإدارة</span>
              </div>

              <h1>
                مرحبًا، <span>{currentUser?.name || "الأدمن"}</span>
              </h1>

              <p>
                تابع نشاط منصة بينا وإدارة المستخدمين والمنتجات والطلبات من مكان
                واحد.
              </p>
            </div>

            <div className="admin-dashboard-profile">
              <div className="admin-dashboard-profile-icon">
                <ShieldCheck size={19} />
              </div>

              <div>
                <strong>{currentUser?.name || "الأدمن"}</strong>

                <span>مدير النظام</span>
              </div>
            </div>
          </header>

          {/* OVERVIEW */}

          <div className="admin-dashboard-section-heading">
            <div>
              <span>نظرة عامة</span>

              <p>ملخص سريع لنشاط المنصة</p>
            </div>

            <div className="admin-dashboard-date">
              <CalendarDays size={14} />

              <span>
                {new Date().toLocaleDateString("ar-EG", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* MAIN STATS */}

          <section className="admin-dashboard-stats">
            {dashboardStats.map((stat) => {
              const Icon = stat.icon;

              return (
                <button
                  key={stat.title}
                  type="button"
                  className={`admin-dashboard-stat ${stat.className}`}
                  onClick={() => navigate(stat.path)}
                >
                  <div className="admin-dashboard-stat-top">
                    <span className="admin-dashboard-stat-icon">
                      <Icon size={20} />
                    </span>

                    <ChevronLeft
                      size={15}
                      className="admin-dashboard-stat-arrow"
                    />
                  </div>

                  <div className="admin-dashboard-stat-content">
                    <span>{stat.title}</span>

                    <strong>{stat.value}</strong>

                    <small>{stat.text}</small>
                  </div>
                </button>
              );
            })}
          </section>

          {/* ORDER SUMMARY */}

          <section className="admin-dashboard-order-summary">
            <div className="admin-dashboard-sales-card">
              <div className="admin-dashboard-sales-content">
                <span className="admin-dashboard-sales-label">
                  إجمالي قيمة الطلبات
                </span>

                <div className="admin-dashboard-sales-value">
                  <strong>{Number(totalSales).toLocaleString()}</strong>

                  <span>₪</span>
                </div>

                <p>إجمالي قيمة جميع الطلبات غير الملغية</p>
              </div>

              <div className="admin-dashboard-sales-icon">
                <Banknote size={25} />
              </div>
            </div>

            <button
              type="button"
              className="admin-dashboard-mini-stat pending"
              onClick={() => navigate("/admin/orders")}
            >
              <span className="admin-dashboard-mini-icon">
                <Clock3 size={21} />
              </span>

              <div>
                <span>تحتاج متابعة</span>

                <strong>{activeOrdersCount}</strong>

                <small>طلب نشط</small>
              </div>
            </button>

            <button
              type="button"
              className="admin-dashboard-mini-stat completed"
              onClick={() => navigate("/admin/orders")}
            >
              <span className="admin-dashboard-mini-icon">
                <CheckCircle2 size={21} />
              </span>

              <div>
                <span>طلبات مكتملة</span>

                <strong>{completedOrdersCount}</strong>

                <small>طلب مكتمل</small>
              </div>
            </button>
          </section>

          {/* MAIN GRID */}

          <section className="admin-dashboard-main-grid">
            {/* LATEST ORDERS */}

            <div className="admin-dashboard-card admin-dashboard-orders-card">
              <div className="admin-dashboard-card-header">
                <div>
                  <h2>أحدث الطلبات</h2>

                  <p>آخر الطلبات المسجلة على المنصة</p>
                </div>

                <button type="button" onClick={() => navigate("/admin/orders")}>
                  عرض الكل
                  <ArrowLeft size={13} />
                </button>
              </div>

              {latestOrders.length > 0 ? (
                <div className="admin-dashboard-orders-list">
                  {latestOrders.map((order) => (
                    <button
                      key={order.id}
                      type="button"
                      className="admin-dashboard-order-row"
                      onClick={() => navigate("/admin/orders")}
                    >
                      <div className="admin-dashboard-order-main">
                        <span className="admin-dashboard-order-icon">
                          <ShoppingBag size={16} />
                        </span>

                        <div>
                          <strong>طلب #{order.id}</strong>

                          <span>{order.customer?.name || "مستخدم"}</span>
                        </div>
                      </div>

                      <div className="admin-dashboard-order-date">
                        <Clock3 size={12} />

                        {formatDate(order.createdAt)}
                      </div>

                      <div className="admin-dashboard-order-products">
                        <Package size={12} />
                        {Array.isArray(order.products)
                          ? order.products.length
                          : 0}{" "}
                        منتج
                      </div>

                      <strong className="admin-dashboard-order-total">
                        {Number(order.total || 0).toLocaleString()} ₪
                      </strong>

                      <span
                        className={`admin-dashboard-order-status ${getStatus(
                          order.status,
                        )}`}
                      >
                        {getStatusText(order.status)}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="admin-dashboard-empty">
                  <ShoppingBag size={25} />

                  <strong>لا توجد طلبات</strong>

                  <span>ستظهر أحدث الطلبات هنا.</span>
                </div>
              )}
            </div>

            {/* QUICK ACTIONS */}

            <div className="admin-dashboard-card admin-dashboard-quick-card">
              <div className="admin-dashboard-card-header">
                <div>
                  <h2>إجراءات سريعة</h2>

                  <p>الوصول السريع لأقسام الإدارة</p>
                </div>
              </div>

              <div className="admin-dashboard-quick-list">
                {quickActions.map((action) => {
                  const Icon = action.icon;

                  return (
                    <button
                      key={action.title}
                      type="button"
                      className={`admin-dashboard-quick-action ${action.className}`}
                      onClick={() => navigate(action.path)}
                    >
                      <span className="admin-dashboard-quick-icon">
                        <Icon size={17} />
                      </span>

                      <div>
                        <strong>{action.title}</strong>

                        <span>{action.text}</span>
                      </div>

                      <ChevronLeft size={14} />
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* SECONDARY GRID */}

          <section className="admin-dashboard-secondary-grid">
            {/* USERS */}

            <div className="admin-dashboard-card">
              <div className="admin-dashboard-card-header">
                <div>
                  <h2>أحدث المستخدمين</h2>

                  <p>الحسابات المضافة مؤخرًا</p>
                </div>

                <button type="button" onClick={() => navigate("/admin/users")}>
                  عرض الكل
                  <ArrowLeft size={13} />
                </button>
              </div>

              {latestUsers.length > 0 ? (
                <div className="admin-dashboard-users-list">
                  {latestUsers.map((user) => (
                    <div className="admin-dashboard-user-row" key={user.id}>
                      <span className="admin-dashboard-user-avatar">
                        {user.role === "admin" ? (
                          <ShieldCheck size={16} />
                        ) : (
                          <UserRound size={16} />
                        )}
                      </span>

                      <div className="admin-dashboard-user-info">
                        <strong>{user.name || "بدون اسم"}</strong>

                        <span>{user.email || "بدون بريد"}</span>
                      </div>

                      <span
                        className={`admin-dashboard-role ${
                          user.role === "admin" ? "admin" : "user"
                        }`}
                      >
                        {user.role === "admin" ? "أدمن" : "مستخدم"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="admin-dashboard-empty small">
                  <Users size={23} />

                  <strong>لا يوجد مستخدمون</strong>
                </div>
              )}
            </div>

            {/* PRODUCTS */}

            <div className="admin-dashboard-card">
              <div className="admin-dashboard-card-header">
                <div>
                  <h2>أحدث المنتجات</h2>

                  <p>آخر المنتجات المنشورة</p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/admin/products")}
                >
                  عرض الكل
                  <ArrowLeft size={13} />
                </button>
              </div>

              {latestProducts.length > 0 ? (
                <div className="admin-dashboard-products-list">
                  {latestProducts.map((product) => {
                    const seller = getSeller(product.sellerId);

                    const productImage =
                      product.image ||
                      (Array.isArray(product.images)
                        ? product.images[0]
                        : null);

                    return (
                      <div
                        className="admin-dashboard-product-row"
                        key={product.id}
                      >
                        <div className="admin-dashboard-product-image">
                          {productImage ? (
                            <img
                              src={productImage}
                              alt={product.name || product.title || "منتج"}
                            />
                          ) : (
                            <Package size={17} />
                          )}
                        </div>

                        <div className="admin-dashboard-product-info">
                          <strong>
                            {product.name || product.title || "بدون اسم"}
                          </strong>

                          <span>
                            {seller?.name ||
                              product.sellerName ||
                              "بائع غير معروف"}
                          </span>
                        </div>

                        <div className="admin-dashboard-product-side">
                          <strong>
                            {Number(product.price || 0).toLocaleString()} ₪
                          </strong>

                          <span>
                            <MapPin size={10} />

                            {product.location || "غير محدد"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="admin-dashboard-empty small">
                  <Package size={23} />

                  <strong>لا توجد منتجات</strong>
                </div>
              )}
            </div>
          </section>

          {/* FOOTER */}

          <footer className="admin-dashboard-footer">
            <span>لوحة إدارة بينا</span>

            <span>من الناس... للناس</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
