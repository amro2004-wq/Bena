import "./AdminDashboard.css";

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import {
  Users,
  Package,
  MessageCircle,
  Bell,
  ArrowLeft,
  UserRound,
  MapPin,
  ShieldCheck,
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

  const notifications = readStorage("benaNotifications", []);

  /* STATS */

  const conversationsCount =
    messages && typeof messages === "object" && !Array.isArray(messages)
      ? Object.keys(messages).length
      : 0;

  const notificationsCount = Array.isArray(notifications)
    ? notifications.length
    : 0;

  /* LATEST USERS */

  const latestUsers = useMemo(() => {
    if (!Array.isArray(users)) {
      return [];
    }

    return [...users]
      .sort((a, b) => {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      })
      .slice(0, 4);
  }, [users]);

  /* LATEST PRODUCTS */

  const latestProducts = useMemo(() => {
    if (!Array.isArray(products)) {
      return [];
    }

    return [...products]
      .sort((a, b) => {
        return (
          new Date(b.createdAt || b.date || 0) -
          new Date(a.createdAt || a.date || 0)
        );
      })
      .slice(0, 4);
  }, [products]);

  /* SELLER */

  const getSellerName = (product) => {
    if (!Array.isArray(users)) {
      return product.sellerName || "غير معروف";
    }

    const seller = users.find(
      (user) => Number(user.id) === Number(product.sellerId),
    );

    return seller?.name || product.sellerName || "غير معروف";
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

  return (
    <div className="admin-layout" dir="rtl">
      <AdminSidebar />

      <main className="admin-page">
        <div className="admin-container">
          {/* HEADING */}

          <div className="admin-dashboard-header">
            <div className="admin-heading">
              <span>لوحة الإدارة</span>

              <h1>مرحبًا {currentUser?.name || "أدمن"}</h1>

              <p>
                تابع نشاط منصة بينا وإدارة المستخدمين والمنتجات والمحادثات من
                مكان واحد.
              </p>
            </div>

            <div className="admin-current-user">
              <div className="admin-current-user__icon">
                <ShieldCheck size={22} />
              </div>

              <div>
                <strong>{currentUser?.name || "Admin"}</strong>

                <span>مدير المنصة</span>
              </div>
            </div>
          </div>

          {/* STATS */}

          <div className="admin-stats">
            <button
              type="button"
              className="admin-stat-card"
              onClick={() => navigate("/admin/users")}
            >
              <div className="admin-stat-icon">
                <Users size={24} />
              </div>

              <div>
                <span>المستخدمون</span>

                <strong>{Array.isArray(users) ? users.length : 0}</strong>
              </div>
            </button>

            <button
              type="button"
              className="admin-stat-card"
              onClick={() => navigate("/admin/products")}
            >
              <div className="admin-stat-icon">
                <Package size={24} />
              </div>

              <div>
                <span>المنتجات المنشورة</span>

                <strong>{Array.isArray(products) ? products.length : 0}</strong>
              </div>
            </button>

            <button
              type="button"
              className="admin-stat-card"
              onClick={() => navigate("/admin/messages")}
            >
              <div className="admin-stat-icon">
                <MessageCircle size={24} />
              </div>

              <div>
                <span>المحادثات</span>

                <strong>{conversationsCount}</strong>
              </div>
            </button>

            <div className="admin-stat-card">
              <div className="admin-stat-icon">
                <Bell size={24} />
              </div>

              <div>
                <span>الإشعارات</span>

                <strong>{notificationsCount}</strong>
              </div>
            </div>
          </div>

          {/* CONTENT */}

          <div className="admin-dashboard-grid">
            {/* USERS */}

            <section className="admin-dashboard-section">
              <div className="admin-section-heading">
                <div>
                  <h2>أحدث المستخدمين</h2>

                  <p>آخر الحسابات المسجلة على بينا</p>
                </div>

                <button type="button" onClick={() => navigate("/admin/users")}>
                  عرض الكل
                  <ArrowLeft size={16} />
                </button>
              </div>

              <div className="admin-latest-list">
                {latestUsers.map((user) => (
                  <div className="admin-latest-user" key={user.id}>
                    <div className="admin-latest-user__avatar">
                      <UserRound size={18} />
                    </div>

                    <div className="admin-latest-user__info">
                      <strong>{user.name || "بدون اسم"}</strong>

                      <span>{user.email || "بدون بريد"}</span>
                    </div>

                    <div className="admin-latest-user__meta">
                      {user.role === "admin" ? (
                        <span className="admin-mini-role admin">أدمن</span>
                      ) : (
                        <span className="admin-mini-role">مستخدم</span>
                      )}

                      <small>{formatDate(user.createdAt)}</small>
                    </div>
                  </div>
                ))}

                {latestUsers.length === 0 && (
                  <div className="admin-dashboard-empty">
                    لا يوجد مستخدمون حتى الآن.
                  </div>
                )}
              </div>
            </section>

            {/* PRODUCTS */}

            <section className="admin-dashboard-section">
              <div className="admin-section-heading">
                <div>
                  <h2>أحدث المنتجات</h2>

                  <p>آخر المنتجات المنشورة على المنصة</p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/admin/products")}
                >
                  عرض الكل
                  <ArrowLeft size={16} />
                </button>
              </div>

              <div className="admin-latest-list">
                {latestProducts.map((product) => (
                  <div className="admin-latest-product" key={product.id}>
                    <div className="admin-latest-product__image">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name || product.title || "منتج"}
                        />
                      ) : (
                        <Package size={20} />
                      )}
                    </div>

                    <div className="admin-latest-product__info">
                      <strong>
                        {product.name || product.title || "بدون اسم"}
                      </strong>

                      <span>{getSellerName(product)}</span>
                    </div>

                    <div className="admin-latest-product__meta">
                      <strong>{product.price ?? 0} ₪</strong>

                      <span>
                        <MapPin size={12} />

                        {product.location || "غير محدد"}
                      </span>
                    </div>
                  </div>
                ))}

                {latestProducts.length === 0 && (
                  <div className="admin-dashboard-empty">
                    لا توجد منتجات منشورة حتى الآن.
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* QUICK ACTIONS */}

          <section className="admin-quick-section">
            <div className="admin-section-heading">
              <div>
                <h2>الوصول السريع</h2>

                <p>انتقل مباشرة إلى أقسام الإدارة</p>
              </div>
            </div>

            <div className="admin-quick-actions">
              <button type="button" onClick={() => navigate("/admin/users")}>
                <Users size={21} />

                <div>
                  <strong>إدارة المستخدمين</strong>

                  <span>عرض وإدارة الحسابات</span>
                </div>

                <ArrowLeft size={18} />
              </button>

              <button type="button" onClick={() => navigate("/admin/products")}>
                <Package size={21} />

                <div>
                  <strong>إدارة المنتجات</strong>

                  <span>متابعة المنتجات المنشورة</span>
                </div>

                <ArrowLeft size={18} />
              </button>

              <button type="button" onClick={() => navigate("/admin/messages")}>
                <MessageCircle size={21} />

                <div>
                  <strong>نشاط المحادثات</strong>

                  <span>متابعة نشاط الرسائل</span>
                </div>

                <ArrowLeft size={18} />
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
