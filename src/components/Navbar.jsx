import "./Navbar.css";
import benaLogo from "../assets/bena-logo.png";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Bell,
  UserRound,
  Plus,
  TriangleAlert,
  Trash2,
  X,
} from "lucide-react";

import Toast from "../components/Toast";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showNotifications, setShowNotifications] = useState(false);

  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const [showClearModal, setShowClearModal] = useState(false);

  const notificationRef = useRef(null);
  const accountRef = useRef(null);

  const [notifications, setNotifications] = useState(() => {
    return JSON.parse(localStorage.getItem("benaNotifications")) || [];
  });

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  const unreadMessagesCount = notifications.filter(
    (notification) => notification.type === "message" && !notification.read,
  ).length;

  const showToast = (message, type = "success") => {
    setToast({
      show: true,
      message,
      type,
    });

    setTimeout(() => {
      setToast((current) => ({
        ...current,
        show: false,
      }));
    }, 2200);
  };

  useEffect(() => {
    const savedNotifications =
      JSON.parse(localStorage.getItem("benaNotifications")) || [];

    setNotifications(savedNotifications);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setShowAccountMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const openNotification = (notification) => {
    const updatedNotifications = notifications.map((item) =>
      item.id === notification.id
        ? {
            ...item,
            read: true,
          }
        : item,
    );

    setNotifications(updatedNotifications);

    localStorage.setItem(
      "benaNotifications",
      JSON.stringify(updatedNotifications),
    );

    setShowNotifications(false);

    if (notification.link) {
      navigate(notification.link);
    }
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map((notification) => ({
      ...notification,
      read: true,
    }));

    setNotifications(updatedNotifications);

    localStorage.setItem(
      "benaNotifications",
      JSON.stringify(updatedNotifications),
    );

    showToast("تم تحديد جميع الإشعارات كمقروءة ✓", "success");
  };

  const deleteNotification = (e, notificationId) => {
    e.stopPropagation();

    const updatedNotifications = notifications.filter(
      (notification) => notification.id !== notificationId,
    );

    setNotifications(updatedNotifications);

    localStorage.setItem(
      "benaNotifications",
      JSON.stringify(updatedNotifications),
    );

    showToast("تم حذف الإشعار", "info");
  };

  const openClearModal = () => {
    setShowNotifications(false);
    setShowClearModal(true);
  };

  const closeClearModal = () => {
    setShowClearModal(false);
  };

  const clearAllNotifications = () => {
    setNotifications([]);

    localStorage.setItem("benaNotifications", JSON.stringify([]));

    closeClearModal();

    showToast("تم مسح جميع الإشعارات ✓", "success");
  };

  const goToSection = (sectionId) => {
    if (location.pathname !== "/") {
      navigate("/");

      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);

      return;
    }

    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const getNotificationTime = (createdAt) => {
    if (!createdAt) return "";

    const now = new Date();

    const notificationDate = new Date(createdAt);

    const difference = Math.floor((now - notificationDate) / 1000);

    if (difference < 60) {
      return "الآن";
    }

    if (difference < 3600) {
      const minutes = Math.floor(difference / 60);

      return `منذ ${minutes} ${minutes === 1 ? "دقيقة" : "دقائق"}`;
    }

    if (difference < 86400) {
      const hours = Math.floor(difference / 3600);

      return `منذ ${hours} ${hours === 1 ? "ساعة" : "ساعات"}`;
    }

    const days = Math.floor(difference / 86400);

    return `منذ ${days} ${days === 1 ? "يوم" : "أيام"}`;
  };

  return (
    <>
      <Toast show={toast.show} message={toast.message} type={toast.type} />

      <header className="navbar">
        <div className="navbar-container">
          {/* LOGO */}

          <Link to="/" className="navbar-brand">
            <img src={benaLogo} alt="بينا" className="navbar-logo" />
          </Link>

          {/* NAVIGATION */}

          <nav className="nav-links">
            <Link to="/">الرئيسية</Link>

            <button type="button" onClick={() => goToSection("categories")}>
              التصنيفات
            </button>

            <button
              type="button"
              onClick={() => goToSection("latest-products")}
            >
              أحدث المنتجات
            </button>

            <button type="button" onClick={() => goToSection("how-it-works")}>
              كيف يعمل؟
            </button>

            <button type="button" onClick={() => goToSection("about")}>
              عن بينا
            </button>
          </nav>

          {/* ACTIONS */}

          <div className="nav-actions">
            <button
              type="button"
              className="sell-button"
              onClick={() => navigate("/sell")}
            >
              <Plus size={19} strokeWidth={2.2} />

              <span>بيع منتج</span>
            </button>

            <button
              type="button"
              className="nav-icon"
              aria-label="المفضلة"
              onClick={() => navigate("/favorites")}
            >
              <Heart size={22} strokeWidth={1.8} />
            </button>

            <button
              type="button"
              className="nav-icon message-icon"
              aria-label="الرسائل"
              onClick={() => navigate("/messages")}
            >
              <MessageCircle size={22} strokeWidth={1.8} />

              {unreadMessagesCount > 0 && (
                <span className="message-count">{unreadMessagesCount}</span>
              )}
            </button>

            {/* NOTIFICATIONS */}

            <div className="notification-wrapper" ref={notificationRef}>
              <button
                type="button"
                className="nav-icon notification"
                aria-label="الإشعارات"
                onClick={() => {
                  setShowNotifications(!showNotifications);

                  setShowAccountMenu(false);
                }}
              >
                <Bell size={22} strokeWidth={1.8} />

                {unreadCount > 0 && (
                  <span className="notification-count">{unreadCount}</span>
                )}
              </button>

              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="notification-dropdown__header">
                    <div>
                      <strong>الإشعارات</strong>

                      <span className="notifications-number">
                        {unreadCount > 0
                          ? `${unreadCount} جديدة`
                          : "لا يوجد جديد"}
                      </span>
                    </div>

                    <div className="notification-header-actions">
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          className="mark-all-read"
                          onClick={markAllAsRead}
                        >
                          تحديد الكل كمقروء
                        </button>
                      )}

                      {notifications.length > 0 && (
                        <button
                          type="button"
                          className="clear-notifications"
                          onClick={openClearModal}
                        >
                          مسح الكل
                        </button>
                      )}
                    </div>
                  </div>

                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <button
                        type="button"
                        key={notification.id}
                        className={`notification-item ${
                          !notification.read ? "unread" : ""
                        }`}
                        onClick={() => openNotification(notification)}
                      >
                        {!notification.read && (
                          <div className="notification-dot"></div>
                        )}

                        <div className="notification-content">
                          <strong>{notification.title}</strong>

                          <p>{notification.text}</p>

                          <span>
                            {getNotificationTime(notification.createdAt)}
                          </span>
                        </div>

                        <span
                          className="delete-notification"
                          onClick={(e) =>
                            deleteNotification(e, notification.id)
                          }
                          title="حذف الإشعار"
                        >
                          ×
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="notifications-empty">
                      <Bell size={30} strokeWidth={1.5} />

                      <strong>لا توجد إشعارات</strong>

                      <p>أي إشعار جديد رح يظهر هون.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ACCOUNT */}

            <div className="account-wrapper" ref={accountRef}>
              <button
                type="button"
                className="nav-icon"
                aria-label="الحساب"
                onClick={() => {
                  setShowAccountMenu(!showAccountMenu);

                  setShowNotifications(false);
                }}
              >
                <UserRound size={22} strokeWidth={1.8} />
              </button>

              {showAccountMenu && (
                <div className="account-dropdown">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAccountMenu(false);

                      navigate("/profile");
                    }}
                  >
                    حسابي
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowAccountMenu(false);

                      navigate("/my-products");
                    }}
                  >
                    منتجاتي
                  </button>

                  <button type="button" className="logout-button">
                    تسجيل الخروج
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* CLEAR NOTIFICATIONS MODAL */}

      {showClearModal && (
        <div className="clear-notifications-overlay" onClick={closeClearModal}>
          <div
            className="clear-notifications-modal"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <button
              type="button"
              className="clear-notifications-close"
              onClick={closeClearModal}
              aria-label="إغلاق"
            >
              <X size={18} />
            </button>

            <div className="clear-notifications-icon">
              <TriangleAlert size={30} />
            </div>

            <h2>مسح الإشعارات؟</h2>

            <p>
              هل أنت متأكد من مسح جميع الإشعارات؟
              <br />
              لن تتمكن من استرجاعها بعد المسح.
            </p>

            <div className="clear-notifications-actions">
              <button
                type="button"
                className="clear-notifications-cancel"
                onClick={closeClearModal}
              >
                إلغاء
              </button>

              <button
                type="button"
                className="clear-notifications-confirm"
                onClick={clearAllNotifications}
              >
                <Trash2 size={16} />
                مسح الإشعارات
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
