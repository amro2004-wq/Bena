import "./Navbar.css";

import benaLogo from "../assets/bena-logo.png";

import { useCallback, useEffect, useRef, useState } from "react";
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
  LogIn,
  LogOut,
  Package,
  PackageCheck,
  User,
  ShoppingCart,
  LayoutDashboard,
  ClipboardList,
  Menu,
  Home,
  Grid2X2,
  Clock3,
  Info,
} from "lucide-react";

import Toast from "../components/Toast";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const notificationRef = useRef(null);
  const accountRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const toastTimerRef = useRef(null);
  const navigationTimerRef = useRef(null);
  const sectionTimerRef = useRef(null);

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

  /* NOTIFICATIONS */

  const getAllNotifications = useCallback(() => {
    const notifications = readStorage("benaNotifications", []);

    return Array.isArray(notifications)
      ? notifications.filter(
          (notification) =>
            notification &&
            typeof notification === "object" &&
            !Array.isArray(notification),
        )
      : [];
  }, [readStorage]);

  /* STATE */

  const [currentUser, setCurrentUser] = useState(getCurrentUser);

  const [allNotifications, setAllNotifications] = useState(getAllNotifications);

  const [cartCount, setCartCount] = useState(0);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  /* USER DATA */

  const userId =
    currentUser?.id !== undefined && currentUser?.id !== null
      ? String(currentUser.id)
      : null;

  const userRole = String(currentUser?.role || "")
    .trim()
    .toLowerCase();

  const isAdmin = userRole === "admin";

  /* USER NOTIFICATIONS */

  const notifications = userId
    ? allNotifications.filter(
        (notification) =>
          notification && String(notification.userId) === userId,
      )
    : [];

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  const unreadMessagesCount = notifications.filter(
    (notification) => notification.type === "message" && !notification.read,
  ).length;

  const sellerOrdersCount = notifications.filter((notification) => {
    if (!notification || notification.read) {
      return false;
    }

    const link = String(notification.link || "");

    return link === "/seller-orders" || link.startsWith("/seller-orders/");
  }).length;

  /* TOAST */

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

  /* CLEAN TIMERS */

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }

      if (navigationTimerRef.current) {
        clearTimeout(navigationTimerRef.current);
      }

      if (sectionTimerRef.current) {
        clearTimeout(sectionTimerRef.current);
      }
    };
  }, []);

  /* REFRESH USER */

  const refreshUser = useCallback(() => {
    setCurrentUser(getCurrentUser());
  }, [getCurrentUser]);

  /* REFRESH NOTIFICATIONS */

  const refreshNotifications = useCallback(() => {
    setAllNotifications(getAllNotifications());
  }, [getAllNotifications]);

  /* REFRESH CART */

  const refreshCart = useCallback(() => {
    const savedUser = getCurrentUser();

    if (!savedUser || savedUser.id === undefined || savedUser.id === null) {
      setCartCount(0);
      return;
    }

    const savedCart = readStorage("benaCart", {});

    if (
      !savedCart ||
      typeof savedCart !== "object" ||
      Array.isArray(savedCart)
    ) {
      setCartCount(0);
      return;
    }

    const savedUserId = String(savedUser.id);

    const userCart = savedCart[savedUserId] ?? savedCart[savedUser.id];

    setCartCount(Array.isArray(userCart) ? userCart.length : 0);
  }, [getCurrentUser, readStorage]);

  /* REFRESH ALL */

  const refreshNavbar = useCallback(() => {
    refreshUser();
    refreshNotifications();
    refreshCart();
  }, [refreshUser, refreshNotifications, refreshCart]);

  /* ROUTE REFRESH */

  useEffect(() => {
    refreshNavbar();

    setShowNotifications(false);
    setShowAccountMenu(false);
    setShowMobileMenu(false);
    setShowClearModal(false);
  }, [location.pathname, location.search, location.hash, refreshNavbar]);

  /* EVENTS */

  useEffect(() => {
    const handleStorage = (event) => {
      if (
        !event.key ||
        event.key === "benaCurrentUser" ||
        event.key === "benaNotifications" ||
        event.key === "benaCart" ||
        event.key === "benaUsers"
      ) {
        refreshNavbar();
      }
    };

    const handleCartUpdated = () => {
      refreshCart();
    };

    const handleNotificationsUpdated = () => {
      refreshNotifications();
    };

    const handleUsersUpdated = () => {
      refreshUser();
    };

    window.addEventListener("storage", handleStorage);

    window.addEventListener("bena-cart-updated", handleCartUpdated);

    window.addEventListener(
      "bena-notifications-updated",
      handleNotificationsUpdated,
    );

    window.addEventListener("bena-users-updated", handleUsersUpdated);

    return () => {
      window.removeEventListener("storage", handleStorage);

      window.removeEventListener("bena-cart-updated", handleCartUpdated);

      window.removeEventListener(
        "bena-notifications-updated",
        handleNotificationsUpdated,
      );

      window.removeEventListener("bena-users-updated", handleUsersUpdated);
    };
  }, [refreshNavbar, refreshCart, refreshNotifications, refreshUser]);

  /* OUTSIDE CLICK */

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }

      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setShowAccountMenu(false);
      }

      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  /* ESCAPE */

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key !== "Escape") {
        return;
      }

      setShowNotifications(false);
      setShowAccountMenu(false);
      setShowMobileMenu(false);
      setShowClearModal(false);
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  /* CLOSE MENUS */

  const closeMenus = () => {
    setShowNotifications(false);
    setShowAccountMenu(false);
    setShowMobileMenu(false);
  };

  /* SAFE INTERNAL PATH */

  const getSafeInternalPath = (path) => {
    if (typeof path !== "string") {
      return null;
    }

    const safePath = path.trim();

    if (!safePath || !safePath.startsWith("/") || safePath.startsWith("//")) {
      return null;
    }

    return safePath;
  };

  /* REQUIRE LOGIN */

  const requireLogin = (path) => {
    closeMenus();

    const safePath = getSafeInternalPath(path) || "/";

    if (!currentUser) {
      showToast("سجل دخولك أولاً للمتابعة", "info");

      if (navigationTimerRef.current) {
        clearTimeout(navigationTimerRef.current);
      }

      navigationTimerRef.current = setTimeout(() => {
        navigate("/login", {
          state: {
            from: safePath,
          },
        });

        navigationTimerRef.current = null;
      }, 650);

      return;
    }

    navigate(safePath);
  };

  /* LOGOUT */

  const handleLogout = () => {
    if (navigationTimerRef.current) {
      clearTimeout(navigationTimerRef.current);
    }

    localStorage.removeItem("benaCurrentUser");

    setCurrentUser(null);
    setAllNotifications([]);
    setCartCount(0);

    closeMenus();

    setShowClearModal(false);

    window.dispatchEvent(new Event("bena-users-updated"));

    window.dispatchEvent(new Event("bena-cart-updated"));

    window.dispatchEvent(new Event("bena-notifications-updated"));

    showToast("تم تسجيل الخروج بنجاح", "success");

    navigationTimerRef.current = setTimeout(() => {
      navigate("/");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      navigationTimerRef.current = null;
    }, 700);
  };

  /* SAVE NOTIFICATIONS */

  const saveNotifications = (updatedNotifications) => {
    const safeNotifications = Array.isArray(updatedNotifications)
      ? updatedNotifications.filter(
          (notification) =>
            notification &&
            typeof notification === "object" &&
            !Array.isArray(notification),
        )
      : [];

    try {
      localStorage.setItem(
        "benaNotifications",
        JSON.stringify(safeNotifications),
      );

      setAllNotifications(safeNotifications);

      window.dispatchEvent(new Event("bena-notifications-updated"));

      return true;
    } catch {
      showToast("تعذر تحديث الإشعارات", "error");

      return false;
    }
  };

  /* OPEN NOTIFICATION */

  const openNotification = (notification) => {
    if (
      !currentUser ||
      !userId ||
      !notification ||
      typeof notification !== "object"
    ) {
      return;
    }

    if (String(notification.userId) !== userId) {
      return;
    }

    const latestNotifications = getAllNotifications();

    const updatedNotifications = latestNotifications.map((item) => {
      if (
        item &&
        String(item.id) === String(notification.id) &&
        String(item.userId) === userId
      ) {
        return {
          ...item,
          read: true,
        };
      }

      return item;
    });

    saveNotifications(updatedNotifications);

    closeMenus();

    const safeLink = getSafeInternalPath(notification.link);

    if (safeLink) {
      navigate(safeLink);
    }
  };

  /* MARK ALL READ */

  const markAllAsRead = () => {
    if (!userId) {
      return;
    }

    const latestNotifications = getAllNotifications();

    const updatedNotifications = latestNotifications.map((notification) => {
      if (notification && String(notification.userId) === userId) {
        return {
          ...notification,
          read: true,
        };
      }

      return notification;
    });

    const saved = saveNotifications(updatedNotifications);

    if (saved) {
      showToast("تم تحديد جميع الإشعارات كمقروءة ✓", "success");
    }
  };

  /* DELETE NOTIFICATION */

  const deleteNotification = (event, notificationId) => {
    event.preventDefault();
    event.stopPropagation();

    if (!userId) {
      return;
    }

    const latestNotifications = getAllNotifications();

    const updatedNotifications = latestNotifications.filter((notification) => {
      if (!notification) {
        return false;
      }

      const isTarget =
        String(notification.id) === String(notificationId) &&
        String(notification.userId) === userId;

      return !isTarget;
    });

    const saved = saveNotifications(updatedNotifications);

    if (saved) {
      showToast("تم حذف الإشعار", "info");
    }
  };

  /* CLEAR MODAL */

  const openClearModal = () => {
    setShowNotifications(false);
    setShowMobileMenu(false);
    setShowAccountMenu(false);
    setShowClearModal(true);
  };

  const closeClearModal = () => {
    setShowClearModal(false);
  };

  /* CLEAR NOTIFICATIONS */

  const clearAllNotifications = () => {
    if (!userId) {
      return;
    }

    const latestNotifications = getAllNotifications();

    const updatedNotifications = latestNotifications.filter(
      (notification) => notification && String(notification.userId) !== userId,
    );

    const saved = saveNotifications(updatedNotifications);

    if (!saved) {
      return;
    }

    closeClearModal();

    showToast("تم مسح جميع الإشعارات ✓", "success");
  };

  /* HOME */

  const goToHome = () => {
    closeMenus();

    if (sectionTimerRef.current) {
      clearTimeout(sectionTimerRef.current);
      sectionTimerRef.current = null;
    }

    if (location.pathname !== "/") {
      navigate("/");

      sectionTimerRef.current = setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        sectionTimerRef.current = null;
      }, 150);

      return;
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* HOME SECTIONS */

  const scrollToSection = (sectionId) => {
    requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const goToSection = (sectionId) => {
    closeMenus();

    if (sectionTimerRef.current) {
      clearTimeout(sectionTimerRef.current);
    }

    if (location.pathname !== "/") {
      navigate("/");

      sectionTimerRef.current = setTimeout(() => {
        scrollToSection(sectionId);

        sectionTimerRef.current = null;
      }, 150);

      return;
    }

    scrollToSection(sectionId);
  };

  /* NOTIFICATION TIME */

  const getNotificationTime = (createdAt) => {
    if (!createdAt) {
      return "";
    }

    const notificationDate = new Date(createdAt);

    if (Number.isNaN(notificationDate.getTime())) {
      return "";
    }

    const difference = Math.max(
      0,
      Math.floor((Date.now() - notificationDate.getTime()) / 1000),
    );

    if (difference < 60) {
      return "الآن";
    }

    if (difference < 3600) {
      const minutes = Math.floor(difference / 60);

      if (minutes === 1) {
        return "منذ دقيقة";
      }

      if (minutes >= 3 && minutes <= 10) {
        return `منذ ${minutes} دقائق`;
      }

      return `منذ ${minutes} دقيقة`;
    }

    if (difference < 86400) {
      const hours = Math.floor(difference / 3600);

      if (hours === 1) {
        return "منذ ساعة";
      }

      if (hours >= 3 && hours <= 10) {
        return `منذ ${hours} ساعات`;
      }

      return `منذ ${hours} ساعة`;
    }

    const days = Math.floor(difference / 86400);

    if (days === 1) {
      return "منذ يوم";
    }

    if (days >= 3 && days <= 10) {
      return `منذ ${days} أيام`;
    }

    return `منذ ${days} يوم`;
  };

  /* FIRST NAME */

  const getFirstName = () => {
    const name = String(currentUser?.name || "").trim();

    if (!name) {
      return "حسابي";
    }

    return name.split(/\s+/)[0];
  };

  /* MOBILE NAVIGATE */

  const mobileNavigate = (path) => {
    closeMenus();

    const safePath = getSafeInternalPath(path);

    if (safePath) {
      navigate(safePath);
    }
  };

  /* NOTIFICATION ITEM */

  const renderNotificationItem = (notification, index, mobile = false) => {
    const itemClass = mobile ? "mobile-notification-item" : "notification-item";

    const dotClass = mobile ? "mobile-notification-dot" : "notification-dot";

    const deleteClass = mobile
      ? "mobile-delete-notification"
      : "delete-notification";

    return (
      <div
        key={
          notification?.id ??
          `${notification?.createdAt || "notification"}-${index}`
        }
        className={`${itemClass} ${!notification?.read ? "unread" : ""}`}
      >
        <button
          type="button"
          className="notification-main-button"
          onClick={() => openNotification(notification)}
          aria-label={notification?.title || "فتح الإشعار"}
        >
          {!notification?.read && <span className={dotClass} />}

          <div
            className={
              mobile ? "mobile-notification-content" : "notification-content"
            }
          >
            <strong>{notification?.title || "إشعار جديد"}</strong>

            <p>{notification?.text || notification?.message || ""}</p>

            <span>{getNotificationTime(notification?.createdAt)}</span>
          </div>
        </button>

        <button
          type="button"
          className={deleteClass}
          aria-label="حذف الإشعار"
          title="حذف الإشعار"
          onClick={(event) => deleteNotification(event, notification?.id)}
        >
          ×
        </button>
      </div>
    );
  };

  return (
    <>
      <Toast show={toast.show} message={toast.message} type={toast.type} />

      <header className="navbar">
        <div className="navbar-container">
          {/* LOGO */}

          <Link
            to="/"
            className="navbar-brand"
            aria-label="الذهاب إلى الرئيسية"
            onClick={(event) => {
              event.preventDefault();
              goToHome();
            }}
          >
            <img src={benaLogo} alt="بينا" className="navbar-logo" />
          </Link>

          {/* NAVIGATION */}

          <nav className="nav-links" aria-label="التنقل الرئيسي">
            <button type="button" onClick={goToHome}>
              الرئيسية
            </button>

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
            {/* SELL */}

            <button
              type="button"
              className="sell-button"
              onClick={() => requireLogin("/sell")}
            >
              <Plus size={19} strokeWidth={2.2} />

              <span>بيع منتج</span>
            </button>

            {/* FAVORITES */}

            <button
              type="button"
              className="nav-icon desktop-extra-action"
              aria-label="المفضلة"
              onClick={() => requireLogin("/favorites")}
            >
              <Heart size={22} strokeWidth={1.8} />
            </button>

            {/* CART */}

            <button
              id="bena-cart-target"
              type="button"
              className="nav-icon cart-nav-icon"
              aria-label={
                cartCount > 0 ? `سلة التسوق، ${cartCount} عناصر` : "سلة التسوق"
              }
              onClick={() => requireLogin("/cart")}
            >
              <ShoppingCart size={22} strokeWidth={1.8} />

              {currentUser && cartCount > 0 && (
                <span className="cart-count">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>

            {/* MESSAGES */}

            <button
              type="button"
              className="nav-icon message-icon"
              aria-label={
                unreadMessagesCount > 0
                  ? `الرسائل، ${unreadMessagesCount} غير مقروءة`
                  : "الرسائل"
              }
              onClick={() => requireLogin("/messages")}
            >
              <MessageCircle size={22} strokeWidth={1.8} />

              {currentUser && unreadMessagesCount > 0 && (
                <span className="message-count">
                  {unreadMessagesCount > 99 ? "99+" : unreadMessagesCount}
                </span>
              )}
            </button>

            {/* NOTIFICATIONS */}

            {currentUser && (
              <div
                className="notification-wrapper desktop-extra-action"
                ref={notificationRef}
              >
                <button
                  type="button"
                  className="nav-icon notification"
                  aria-label={
                    unreadCount > 0
                      ? `الإشعارات، ${unreadCount} غير مقروءة`
                      : "الإشعارات"
                  }
                  aria-haspopup="true"
                  aria-expanded={showNotifications}
                  onClick={() => {
                    setShowNotifications((current) => !current);

                    setShowAccountMenu(false);
                    setShowMobileMenu(false);
                  }}
                >
                  <Bell size={22} strokeWidth={1.8} />

                  {unreadCount > 0 && (
                    <span className="notification-count">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
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

                    <div className="notification-list">
                      {notifications.length > 0 ? (
                        notifications.map((notification, index) =>
                          renderNotificationItem(notification, index),
                        )
                      ) : (
                        <div className="notifications-empty">
                          <Bell size={30} strokeWidth={1.5} />

                          <strong>لا توجد إشعارات</strong>

                          <p>أي إشعار جديد رح يظهر هون.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ACCOUNT */}

            <div className="account-wrapper desktop-account" ref={accountRef}>
              {currentUser ? (
                <>
                  <button
                    type="button"
                    className="user-menu-button"
                    aria-label="الحساب"
                    aria-haspopup="true"
                    aria-expanded={showAccountMenu}
                    onClick={() => {
                      setShowAccountMenu((current) => !current);

                      setShowNotifications(false);

                      setShowMobileMenu(false);
                    }}
                  >
                    <span className="user-menu-avatar">
                      <UserRound size={18} strokeWidth={1.9} />
                    </span>

                    <span className="user-menu-name">{getFirstName()}</span>
                  </button>

                  {showAccountMenu && (
                    <div className="account-dropdown">
                      <div className="account-user-info">
                        <div className="account-user-avatar">
                          <UserRound size={21} strokeWidth={1.8} />
                        </div>

                        <div>
                          <strong>{currentUser.name || "مستخدم بينا"}</strong>

                          <span>{currentUser.email || ""}</span>
                        </div>
                      </div>

                      <div className="account-menu-divider" />

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowAccountMenu(false);

                            navigate("/admin");
                          }}
                        >
                          <LayoutDashboard size={16} />
                          لوحة الإدارة
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setShowAccountMenu(false);

                          navigate("/profile");
                        }}
                      >
                        <User size={16} />
                        حسابي
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowAccountMenu(false);

                          navigate("/my-products");
                        }}
                      >
                        <Package size={16} />
                        منتجاتي
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowAccountMenu(false);

                          navigate("/orders");
                        }}
                      >
                        <ClipboardList size={16} />
                        طلباتي
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowAccountMenu(false);

                          navigate("/seller-orders");
                        }}
                      >
                        <PackageCheck size={16} />

                        <span>الطلبات الواردة</span>

                        {sellerOrdersCount > 0 && (
                          <span className="account-menu-count">
                            {sellerOrdersCount > 99 ? "99+" : sellerOrdersCount}
                          </span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowAccountMenu(false);

                          navigate("/messages");
                        }}
                      >
                        <MessageCircle size={16} />
                        الرسائل
                      </button>

                      <button
                        type="button"
                        className="logout-button"
                        onClick={handleLogout}
                      >
                        <LogOut size={16} />
                        تسجيل الخروج
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  className="login-nav-button"
                  onClick={() => navigate("/login")}
                >
                  <LogIn size={17} />

                  <span>تسجيل الدخول</span>
                </button>
              )}
            </div>

            {/* MOBILE MENU */}

            <div className="mobile-menu-wrapper" ref={mobileMenuRef}>
              <button
                type="button"
                className={`mobile-menu-button ${
                  showMobileMenu ? "active" : ""
                }`}
                aria-label={showMobileMenu ? "إغلاق القائمة" : "فتح القائمة"}
                aria-haspopup="true"
                aria-expanded={showMobileMenu}
                onClick={() => {
                  setShowMobileMenu((current) => !current);

                  setShowNotifications(false);
                  setShowAccountMenu(false);
                }}
              >
                {showMobileMenu ? <X size={21} /> : <Menu size={22} />}

                {currentUser && unreadCount > 0 && (
                  <span className="mobile-menu-alert" />
                )}
              </button>

              {showMobileMenu && (
                <div className="mobile-menu-dropdown">
                  {currentUser && (
                    <div className="mobile-menu-user">
                      <div className="mobile-menu-avatar">
                        <UserRound size={20} />
                      </div>

                      <div>
                        <strong>{currentUser.name || "مستخدم بينا"}</strong>

                        <span>{currentUser.email || ""}</span>
                      </div>
                    </div>
                  )}

                  {/* HOME LINKS */}

                  <div className="mobile-menu-section">
                    <button type="button" onClick={goToHome}>
                      <Home size={17} />
                      الرئيسية
                    </button>

                    <button
                      type="button"
                      onClick={() => goToSection("categories")}
                    >
                      <Grid2X2 size={17} />
                      التصنيفات
                    </button>

                    <button
                      type="button"
                      onClick={() => goToSection("latest-products")}
                    >
                      <Clock3 size={17} />
                      أحدث المنتجات
                    </button>

                    <button
                      type="button"
                      onClick={() => goToSection("how-it-works")}
                    >
                      <Info size={17} />
                      كيف يعمل؟
                    </button>

                    <button type="button" onClick={() => goToSection("about")}>
                      <Info size={17} />
                      عن بينا
                    </button>
                  </div>

                  <div className="mobile-menu-divider" />

                  {/* USER LINKS */}

                  <div className="mobile-menu-section">
                    <button
                      type="button"
                      onClick={() => requireLogin("/favorites")}
                    >
                      <Heart size={17} />
                      المفضلة
                    </button>

                    <button type="button" onClick={() => requireLogin("/cart")}>
                      <ShoppingCart size={17} />
                      سلة التسوق
                      {currentUser && cartCount > 0 && (
                        <span className="mobile-menu-count">
                          {cartCount > 99 ? "99+" : cartCount}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => requireLogin("/messages")}
                    >
                      <MessageCircle size={17} />
                      الرسائل
                      {currentUser && unreadMessagesCount > 0 && (
                        <span className="mobile-menu-count">
                          {unreadMessagesCount > 99
                            ? "99+"
                            : unreadMessagesCount}
                        </span>
                      )}
                    </button>

                    {currentUser && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowMobileMenu(false);

                          setShowAccountMenu(false);

                          setShowNotifications(true);
                        }}
                      >
                        <Bell size={17} />
                        الإشعارات
                        {unreadCount > 0 && (
                          <span className="mobile-menu-count">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        )}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => requireLogin("/orders")}
                    >
                      <ClipboardList size={17} />
                      طلباتي
                    </button>

                    <button
                      type="button"
                      onClick={() => requireLogin("/seller-orders")}
                    >
                      <PackageCheck size={17} />

                      <span>الطلبات الواردة</span>

                      {currentUser && sellerOrdersCount > 0 && (
                        <span className="mobile-menu-count">
                          {sellerOrdersCount > 99 ? "99+" : sellerOrdersCount}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => requireLogin("/my-products")}
                    >
                      <Package size={17} />
                      منتجاتي
                    </button>
                  </div>

                  <div className="mobile-menu-divider" />

                  {/* ACCOUNT LINKS */}

                  {currentUser ? (
                    <div className="mobile-menu-section">
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => mobileNavigate("/admin")}
                        >
                          <LayoutDashboard size={17} />
                          لوحة الإدارة
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => mobileNavigate("/profile")}
                      >
                        <User size={17} />
                        حسابي
                      </button>

                      <button
                        type="button"
                        className="mobile-logout-button"
                        onClick={handleLogout}
                      >
                        <LogOut size={17} />
                        تسجيل الخروج
                      </button>
                    </div>
                  ) : (
                    <div className="mobile-menu-section">
                      <button
                        type="button"
                        className="mobile-login-button"
                        onClick={() => mobileNavigate("/login")}
                      >
                        <LogIn size={17} />
                        تسجيل الدخول
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE NOTIFICATIONS */}

      {currentUser && showNotifications && (
        <div
          className="mobile-notification-layer"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowNotifications(false);
            }
          }}
        >
          <div className="mobile-notification-panel">
            <div className="mobile-notification-panel-header">
              <div>
                <strong>الإشعارات</strong>

                <span>
                  {unreadCount > 0 ? `${unreadCount} جديدة` : "لا يوجد جديد"}
                </span>
              </div>

              <button
                type="button"
                aria-label="إغلاق الإشعارات"
                onClick={() => setShowNotifications(false)}
              >
                <X size={19} />
              </button>
            </div>

            <div className="mobile-notification-actions">
              {unreadCount > 0 && (
                <button type="button" onClick={markAllAsRead}>
                  تحديد الكل كمقروء
                </button>
              )}

              {notifications.length > 0 && (
                <button type="button" onClick={openClearModal}>
                  مسح الكل
                </button>
              )}
            </div>

            <div className="mobile-notification-list">
              {notifications.length > 0 ? (
                notifications.map((notification, index) =>
                  renderNotificationItem(notification, index, true),
                )
              ) : (
                <div className="notifications-empty">
                  <Bell size={30} strokeWidth={1.5} />

                  <strong>لا توجد إشعارات</strong>

                  <p>أي إشعار جديد رح يظهر هون.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CLEAR MODAL */}

      {showClearModal && (
        <div
          className="clear-notifications-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeClearModal();
            }
          }}
        >
          <div
            className="clear-notifications-modal"
            dir="rtl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="clear-notifications-title"
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

            <h2 id="clear-notifications-title">مسح الإشعارات؟</h2>

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
