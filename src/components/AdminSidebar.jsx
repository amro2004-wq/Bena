import {
  LayoutDashboard,
  Users,
  Package,
  MessageCircle,
  LogOut,
  Home,
  ShoppingBag,
  Menu,
  X,
  ShieldCheck,
  ChevronLeft,
} from "lucide-react";

import { useCallback, useEffect, useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import benaLogo from "../assets/bena-logo.png";

import "./AdminSidebar.css";

function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  /* STORAGE */

  const readStorage = useCallback((key, fallback) => {
    try {
      const value = localStorage.getItem(key);

      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }, []);

  /* MOBILE */

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  /* CURRENT USER */

  const [currentUser, setCurrentUser] = useState(() =>
    readStorage("benaCurrentUser", null),
  );

  /* REFRESH */

  const refreshSidebarData = useCallback(() => {
    setCurrentUser(readStorage("benaCurrentUser", null));
  }, [readStorage]);

  /* ACTIVE LINK */

  const isActive = (path) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }

    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  /* NAVIGATE */

  const handleNavigate = (path) => {
    setIsMobileOpen(false);

    navigate(path);
  };

  /* LOGOUT */

  const handleLogout = () => {
    localStorage.removeItem("benaCurrentUser");

    setCurrentUser(null);
    setIsMobileOpen(false);

    navigate("/login", {
      replace: true,
    });
  };

  /* ROUTE CHANGE */

  useEffect(() => {
    setIsMobileOpen(false);

    refreshSidebarData();
  }, [location.pathname, refreshSidebarData]);

  /* STORAGE EVENTS */

  useEffect(() => {
    const handleStorage = (event) => {
      if (!event.key || event.key === "benaCurrentUser") {
        refreshSidebarData();
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, [refreshSidebarData]);

  /* LOCK BODY */

  useEffect(() => {
    if (isMobileOpen && window.innerWidth <= 700) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  /* ESCAPE */

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileOpen]);

  return (
    <>
      {/* MOBILE HEADER */}

      <header className="admin-mobile-header" dir="rtl">
        <button
          type="button"
          className="admin-mobile-menu"
          onClick={() => setIsMobileOpen(true)}
          aria-label="فتح القائمة"
          aria-expanded={isMobileOpen}
        >
          <Menu size={22} />
        </button>

        <button
          type="button"
          className="admin-mobile-brand"
          onClick={() => handleNavigate("/admin")}
        >
          <img src={benaLogo} alt="بينا" />

          <div>
            <strong>بينا</strong>

            <span>لوحة الإدارة</span>
          </div>
        </button>

        <div className="admin-mobile-admin" aria-hidden="true">
          <ShieldCheck size={19} />
        </div>
      </header>

      {/* OVERLAY */}

      <button
        type="button"
        className={`admin-sidebar-overlay ${isMobileOpen ? "show" : ""}`}
        onClick={() => setIsMobileOpen(false)}
        aria-label="إغلاق القائمة"
        tabIndex={isMobileOpen ? 0 : -1}
      />

      {/* SIDEBAR */}

      <aside
        className={`admin-sidebar ${isMobileOpen ? "mobile-open" : ""}`}
        dir="rtl"
      >
        <div className="admin-sidebar__top">
          {/* BRAND */}

          <div className="admin-sidebar__header">
            <button
              type="button"
              className="admin-sidebar__brand"
              onClick={() => handleNavigate("/admin")}
            >
              <div className="admin-sidebar__logo">
                <img src={benaLogo} alt="شعار بينا" />
              </div>

              <div className="admin-sidebar__brand-text">
                <strong>بينا</strong>

                <span>لوحة الإدارة</span>
              </div>
            </button>

            <button
              type="button"
              className="admin-sidebar__close"
              onClick={() => setIsMobileOpen(false)}
              aria-label="إغلاق القائمة"
            >
              <X size={20} />
            </button>
          </div>

          {/* ADMIN */}

          <div className="admin-sidebar__admin">
            <div className="admin-sidebar__admin-avatar">
              <ShieldCheck size={20} />
            </div>

            <div className="admin-sidebar__admin-info">
              <strong>{currentUser?.name || "مدير بينا"}</strong>

              <span>مدير المنصة</span>
            </div>

            <span className="admin-sidebar__admin-status" title="متصل" />
          </div>

          {/* NAVIGATION */}

          <div className="admin-sidebar__section">
            <span className="admin-sidebar__section-title">
              القائمة الرئيسية
            </span>

            <nav className="admin-sidebar__nav">
              {/* DASHBOARD */}

              <button
                type="button"
                className={isActive("/admin") ? "active" : ""}
                aria-current={isActive("/admin") ? "page" : undefined}
                onClick={() => handleNavigate("/admin")}
              >
                <span className="admin-sidebar__nav-icon">
                  <LayoutDashboard size={19} />
                </span>

                <span className="admin-sidebar__nav-label">الرئيسية</span>

                <ChevronLeft className="admin-sidebar__nav-arrow" size={15} />
              </button>

              {/* USERS */}

              <button
                type="button"
                className={isActive("/admin/users") ? "active" : ""}
                aria-current={isActive("/admin/users") ? "page" : undefined}
                onClick={() => handleNavigate("/admin/users")}
              >
                <span className="admin-sidebar__nav-icon">
                  <Users size={19} />
                </span>

                <span className="admin-sidebar__nav-label">المستخدمون</span>

                <ChevronLeft className="admin-sidebar__nav-arrow" size={15} />
              </button>

              {/* PRODUCTS */}

              <button
                type="button"
                className={isActive("/admin/products") ? "active" : ""}
                aria-current={isActive("/admin/products") ? "page" : undefined}
                onClick={() => handleNavigate("/admin/products")}
              >
                <span className="admin-sidebar__nav-icon">
                  <Package size={19} />
                </span>

                <span className="admin-sidebar__nav-label">المنتجات</span>

                <ChevronLeft className="admin-sidebar__nav-arrow" size={15} />
              </button>

              {/* ORDERS */}

              <button
                type="button"
                className={isActive("/admin/orders") ? "active" : ""}
                aria-current={isActive("/admin/orders") ? "page" : undefined}
                onClick={() => handleNavigate("/admin/orders")}
              >
                <span className="admin-sidebar__nav-icon">
                  <ShoppingBag size={19} />
                </span>

                <span className="admin-sidebar__nav-label">الطلبات</span>

                <ChevronLeft className="admin-sidebar__nav-arrow" size={15} />
              </button>

              {/* MESSAGES */}

              <button
                type="button"
                className={isActive("/admin/messages") ? "active" : ""}
                aria-current={isActive("/admin/messages") ? "page" : undefined}
                onClick={() => handleNavigate("/admin/messages")}
              >
                <span className="admin-sidebar__nav-icon">
                  <MessageCircle size={19} />
                </span>

                <span className="admin-sidebar__nav-label">الرسائل</span>

                <ChevronLeft className="admin-sidebar__nav-arrow" size={15} />
              </button>
            </nav>
          </div>
        </div>

        {/* BOTTOM */}

        <div className="admin-sidebar__bottom">
          <div className="admin-sidebar__divider" />

          {/* WEBSITE */}

          <button
            type="button"
            className="admin-sidebar__website"
            onClick={() => handleNavigate("/")}
          >
            <span className="admin-sidebar__bottom-icon">
              <Home size={18} />
            </span>

            <div>
              <strong>العودة للموقع</strong>

              <span>عرض منصة بينا</span>
            </div>

            <ChevronLeft size={15} />
          </button>

          {/* LOGOUT */}

          <button
            type="button"
            className="admin-sidebar__logout"
            onClick={handleLogout}
          >
            <span className="admin-sidebar__bottom-icon">
              <LogOut size={18} />
            </span>

            <div>
              <strong>تسجيل الخروج</strong>

              <span>الخروج من لوحة الإدارة</span>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
