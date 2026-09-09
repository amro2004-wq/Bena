import {
  LayoutDashboard,
  Users,
  Package,
  MessageCircle,
  LogOut,
  Home,
} from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";

import "./AdminSidebar.css";

function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  /* ACTIVE LINK */

  const isActive = (path) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }

    return (
      location.pathname.startsWith(`${path}/`) || location.pathname === path
    );
  };

  /* LOGOUT */

  const handleLogout = () => {
    localStorage.removeItem("benaCurrentUser");

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <aside className="admin-sidebar" dir="rtl">
      <div className="admin-sidebar__top">
        <div className="admin-sidebar__brand">
          <span>بينا</span>

          <small>لوحة الإدارة</small>
        </div>

        <nav className="admin-sidebar__nav">
          <button
            type="button"
            className={isActive("/admin") ? "active" : ""}
            aria-current={isActive("/admin") ? "page" : undefined}
            onClick={() => navigate("/admin")}
          >
            <LayoutDashboard size={19} />
            الرئيسية
          </button>

          <button
            type="button"
            className={isActive("/admin/users") ? "active" : ""}
            aria-current={isActive("/admin/users") ? "page" : undefined}
            onClick={() => navigate("/admin/users")}
          >
            <Users size={19} />
            المستخدمون
          </button>

          <button
            type="button"
            className={isActive("/admin/products") ? "active" : ""}
            aria-current={isActive("/admin/products") ? "page" : undefined}
            onClick={() => navigate("/admin/products")}
          >
            <Package size={19} />
            المنتجات
          </button>

          <button
            type="button"
            className={isActive("/admin/messages") ? "active" : ""}
            aria-current={isActive("/admin/messages") ? "page" : undefined}
            onClick={() => navigate("/admin/messages")}
          >
            <MessageCircle size={19} />
            الرسائل
          </button>
        </nav>
      </div>

      <div className="admin-sidebar__bottom">
        <button type="button" onClick={() => navigate("/")}>
          <Home size={18} />
          العودة للموقع
        </button>

        <button
          type="button"
          className="admin-sidebar__logout"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
