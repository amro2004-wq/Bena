import "./AdminUsers.css";

import { useMemo, useState } from "react";

import {
  Users,
  Trash2,
  ShieldCheck,
  UserRound,
  Package,
  Search,
  CalendarDays,
  UserCheck,
  ChevronDown,
} from "lucide-react";

import AdminSidebar from "../components/AdminSidebar";
import Toast from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";

function AdminUsers() {
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

  const [users, setUsers] = useState(() => readStorage("benaUsers", []));

  const [products, setProducts] = useState(() =>
    readStorage("benaProducts", []),
  );

  /* SEARCH */

  const [search, setSearch] = useState("");

  /* FILTER */

  const [roleFilter, setRoleFilter] = useState("all");

  /* TOAST */

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  /* MODAL */

  const [selectedUser, setSelectedUser] = useState(null);

  /* TOAST */

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

  /* USERS WITH PRODUCTS */

  const usersWithProducts = useMemo(() => {
    if (!Array.isArray(users)) {
      return [];
    }

    return users.map((user) => {
      const productsCount = Array.isArray(products)
        ? products.filter(
            (product) => Number(product.sellerId) === Number(user.id),
          ).length
        : 0;

      return {
        ...user,
        productsCount,
      };
    });
  }, [users, products]);

  /* STATISTICS */

  const statistics = useMemo(() => {
    return {
      all: usersWithProducts.length,

      users: usersWithProducts.filter((user) => user.role !== "admin").length,

      admins: usersWithProducts.filter((user) => user.role === "admin").length,

      sellers: usersWithProducts.filter((user) => user.productsCount > 0)
        .length,
    };
  }, [usersWithProducts]);

  /* FILTERED USERS */

  const filteredUsers = useMemo(() => {
    const value = search.trim().toLowerCase();

    return [...usersWithProducts]
      .filter((user) => {
        const matchesRole =
          roleFilter === "all" ||
          (roleFilter === "admin" && user.role === "admin") ||
          (roleFilter === "user" && user.role !== "admin") ||
          (roleFilter === "seller" && user.productsCount > 0);

        if (!matchesRole) {
          return false;
        }

        if (!value) {
          return true;
        }

        const name = String(user.name || "").toLowerCase();

        const email = String(user.email || "").toLowerCase();

        const id = String(user.id || "").toLowerCase();

        return (
          name.includes(value) || email.includes(value) || id.includes(value)
        );
      })
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [usersWithProducts, search, roleFilter]);

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

  /* DELETE USER */

  const deleteUser = (user) => {
    if (!user) {
      return;
    }

    if (String(user.id) === String(currentUser?.id)) {
      showToast("لا يمكنك حذف حساب الأدمن الحالي", "error");

      return;
    }

    if (user.role === "admin") {
      showToast("لا يمكنك حذف حساب أدمن آخر من هنا", "error");

      return;
    }

    const userId = String(user.id);

    /* USER PRODUCTS */

    const allProducts = readStorage("benaProducts", []);

    const safeProducts = Array.isArray(allProducts) ? allProducts : [];

    const deletedProductIds = safeProducts
      .filter((product) => String(product.sellerId) === userId)
      .map((product) => String(product.id));

    const updatedProducts = safeProducts.filter(
      (product) => String(product.sellerId) !== userId,
    );

    localStorage.setItem("benaProducts", JSON.stringify(updatedProducts));

    /* USERS */

    const safeUsers = Array.isArray(users) ? users : [];

    const updatedUsers = safeUsers.filter((item) => String(item.id) !== userId);

    localStorage.setItem("benaUsers", JSON.stringify(updatedUsers));

    /* FAVORITES */

    const favoritesData = readStorage("benaFavorites", {});

    if (
      favoritesData &&
      typeof favoritesData === "object" &&
      !Array.isArray(favoritesData)
    ) {
      const updatedFavorites = {};

      Object.entries(favoritesData).forEach(([favoriteUserId, ids]) => {
        if (String(favoriteUserId) === userId) {
          return;
        }

        updatedFavorites[favoriteUserId] = Array.isArray(ids)
          ? ids.filter(
              (productId) => !deletedProductIds.includes(String(productId)),
            )
          : [];
      });

      localStorage.setItem("benaFavorites", JSON.stringify(updatedFavorites));
    }

    /* CART */

    const cartData = readStorage("benaCart", {});

    if (cartData && typeof cartData === "object" && !Array.isArray(cartData)) {
      const updatedCart = {};

      Object.entries(cartData).forEach(([cartUserId, ids]) => {
        if (String(cartUserId) === userId) {
          return;
        }

        updatedCart[cartUserId] = Array.isArray(ids)
          ? ids.filter(
              (productId) => !deletedProductIds.includes(String(productId)),
            )
          : [];
      });

      localStorage.setItem("benaCart", JSON.stringify(updatedCart));

      window.dispatchEvent(new CustomEvent("bena-cart-updated"));
    }

    /* MESSAGES */

    const messagesData = readStorage("benaMessages", {});

    const updatedMessages = {};

    if (
      messagesData &&
      typeof messagesData === "object" &&
      !Array.isArray(messagesData)
    ) {
      Object.entries(messagesData).forEach(([conversationId, conversation]) => {
        const idParts = conversationId.split("_");

        const idProductId = idParts[0];

        const idBuyerId = idParts[1];

        let buyerId = "";
        let sellerId = "";
        let productId = "";

        if (Array.isArray(conversation)) {
          const firstMessage = conversation[0];

          buyerId = String(firstMessage?.buyerId ?? idBuyerId ?? "");

          sellerId = String(firstMessage?.sellerId ?? "");

          productId = String(firstMessage?.productId ?? idProductId ?? "");
        } else {
          buyerId = String(conversation?.buyerId ?? idBuyerId ?? "");

          sellerId = String(conversation?.sellerId ?? "");

          productId = String(conversation?.productId ?? idProductId ?? "");
        }

        const involvesUser = buyerId === userId || sellerId === userId;

        const deletedProduct = deletedProductIds.includes(productId);

        if (!involvesUser && !deletedProduct) {
          updatedMessages[conversationId] = conversation;
        }
      });
    }

    localStorage.setItem("benaMessages", JSON.stringify(updatedMessages));

    window.dispatchEvent(new CustomEvent("bena-messages-updated"));

    /* NOTIFICATIONS */

    const notifications = readStorage("benaNotifications", []);

    const updatedNotifications = Array.isArray(notifications)
      ? notifications.filter((notification) => {
          const belongsToUser =
            String(notification.userId ?? "") === userId ||
            String(notification.fromUserId ?? "") === userId ||
            String(notification.senderId ?? "") === userId;

          const notificationProductId = String(notification.productId ?? "");

          const deletedProduct = deletedProductIds.some((productId) => {
            const productLink = `/products/${productId}`;

            const messageLink = `/messages/${productId}`;

            const conversationId = String(notification.conversationId ?? "");

            const link = String(notification.link ?? "");

            return (
              notificationProductId === productId ||
              link === productLink ||
              link.startsWith(messageLink) ||
              conversationId.startsWith(`${productId}_`)
            );
          });

          return !belongsToUser && !deletedProduct;
        })
      : [];

    localStorage.setItem(
      "benaNotifications",
      JSON.stringify(updatedNotifications),
    );

    window.dispatchEvent(new CustomEvent("bena-notifications-updated"));

    /* PROFILES */

    const profiles = readStorage("benaProfiles", {});

    if (profiles && typeof profiles === "object" && !Array.isArray(profiles)) {
      const updatedProfiles = {
        ...profiles,
      };

      delete updatedProfiles[userId];

      localStorage.setItem("benaProfiles", JSON.stringify(updatedProfiles));
    }

    /* UPDATE EVENTS */

    window.dispatchEvent(new CustomEvent("bena-users-updated"));

    window.dispatchEvent(new CustomEvent("bena-products-updated"));

    /* UPDATE UI */

    setUsers(updatedUsers);

    setProducts(updatedProducts);

    setSelectedUser(null);

    showToast("تم حذف المستخدم وبياناته بنجاح ✓", "success");
  };

  return (
    <div className="admin-users-layout" dir="rtl">
      <AdminSidebar />

      <main className="admin-users-page">
        <Toast show={toast.show} message={toast.message} type={toast.type} />

        <div className="admin-users-container">
          {/* HEADER */}

          <header className="admin-users-heading">
            <div>
              <div className="admin-users-eyebrow">
                <Users size={14} />

                <span>إدارة المستخدمين</span>
              </div>

              <h1>المستخدمون</h1>

              <p>تابع حسابات منصة بينا والمستخدمين النشطين والبائعين.</p>
            </div>

            <div className="admin-users-heading-count">
              <span>إجمالي الحسابات</span>

              <strong>{statistics.all}</strong>

              <small>حساب مسجل</small>
            </div>
          </header>

          {/* STATISTICS */}

          <section className="admin-users-stats">
            <button
              type="button"
              className={`admin-users-stat total ${
                roleFilter === "all" ? "active" : ""
              }`}
              onClick={() => setRoleFilter("all")}
            >
              <span className="admin-users-stat-icon">
                <Users size={20} />
              </span>

              <div>
                <span>جميع الحسابات</span>

                <strong>{statistics.all}</strong>
              </div>
            </button>

            <button
              type="button"
              className={`admin-users-stat users ${
                roleFilter === "user" ? "active" : ""
              }`}
              onClick={() => setRoleFilter("user")}
            >
              <span className="admin-users-stat-icon">
                <UserRound size={20} />
              </span>

              <div>
                <span>المستخدمون</span>

                <strong>{statistics.users}</strong>
              </div>
            </button>

            <button
              type="button"
              className={`admin-users-stat admins ${
                roleFilter === "admin" ? "active" : ""
              }`}
              onClick={() => setRoleFilter("admin")}
            >
              <span className="admin-users-stat-icon">
                <ShieldCheck size={20} />
              </span>

              <div>
                <span>المدراء</span>

                <strong>{statistics.admins}</strong>
              </div>
            </button>

            <button
              type="button"
              className={`admin-users-stat sellers ${
                roleFilter === "seller" ? "active" : ""
              }`}
              onClick={() => setRoleFilter("seller")}
            >
              <span className="admin-users-stat-icon">
                <Package size={20} />
              </span>

              <div>
                <span>البائعون</span>

                <strong>{statistics.sellers}</strong>
              </div>
            </button>
          </section>

          {/* TOOLS */}

          <section className="admin-users-tools">
            <div className="admin-users-search">
              <Search size={17} />

              <input
                type="text"
                value={search}
                placeholder="ابحث بالاسم أو البريد الإلكتروني أو رقم المستخدم..."
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="admin-users-filter">
              <ChevronDown size={15} />

              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
              >
                <option value="all">جميع الحسابات</option>

                <option value="user">المستخدمون</option>

                <option value="admin">المدراء</option>

                <option value="seller">البائعون</option>
              </select>
            </div>
          </section>

          {/* RESULTS */}

          <div className="admin-users-results">
            <span>
              عرض <strong>{filteredUsers.length}</strong> من{" "}
              <strong>{statistics.all}</strong> حساب
            </span>
          </div>

          {/* TABLE */}

          <section className="admin-users-table-card">
            <div className="admin-users-table-heading">
              <div>
                <h2>قائمة المستخدمين</h2>

                <p>جميع الحسابات المسجلة ومعلوماتها الأساسية</p>
              </div>

              <span>{filteredUsers.length} نتيجة</span>
            </div>

            {filteredUsers.length > 0 ? (
              <div className="admin-users-table-wrapper">
                <table className="admin-users-table">
                  <thead>
                    <tr>
                      <th>المستخدم</th>

                      <th>البريد الإلكتروني</th>

                      <th>الدور</th>

                      <th>المنتجات</th>

                      <th>تاريخ التسجيل</th>

                      <th>الإجراءات</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <div className="admin-user-cell">
                            <div className="admin-user-avatar">
                              {user.role === "admin" ? (
                                <ShieldCheck size={18} />
                              ) : (
                                <UserRound size={18} />
                              )}
                            </div>

                            <div>
                              <strong>{user.name || "بدون اسم"}</strong>

                              <div className="admin-user-id">
                                <span>#{user.id}</span>

                                {String(user.id) ===
                                  String(currentUser?.id) && <small>أنت</small>}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="admin-user-email">
                            {user.email || "غير معروف"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`admin-role-badge ${
                              user.role === "admin" ? "admin" : "user"
                            }`}
                          >
                            {user.role === "admin" ? (
                              <>
                                <ShieldCheck size={13} />
                                أدمن
                              </>
                            ) : (
                              <>
                                <UserRound size={13} />
                                مستخدم
                              </>
                            )}
                          </span>
                        </td>

                        <td>
                          <span className="admin-users-products-count">
                            <Package size={14} />

                            {user.productsCount}
                          </span>
                        </td>

                        <td>
                          <span className="admin-user-date">
                            <CalendarDays size={14} />

                            {formatDate(user.createdAt)}
                          </span>
                        </td>

                        <td>
                          {user.role === "admin" ? (
                            <span className="admin-user-protected">
                              <ShieldCheck size={14} />
                              محمي
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="admin-delete-user"
                              onClick={() => setSelectedUser(user)}
                            >
                              <Trash2 size={15} />
                              حذف
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="admin-users-empty">
                <span className="admin-users-empty-icon">
                  <UserCheck size={29} />
                </span>

                <h2>لا توجد نتائج</h2>

                <p>لم يتم العثور على مستخدمين مطابقين للبحث أو الفلتر.</p>

                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setRoleFilter("all");
                  }}
                >
                  عرض جميع المستخدمين
                </button>
              </div>
            )}
          </section>
        </div>

        <ConfirmModal
          open={Boolean(selectedUser)}
          title="حذف المستخدم"
          message={
            selectedUser
              ? `هل أنت متأكد من حذف ${
                  selectedUser.name || "هذا المستخدم"
                }؟ سيتم حذف منتجاته وبياناته المرتبطة أيضًا.`
              : ""
          }
          confirmText="حذف المستخدم"
          cancelText="إلغاء"
          onCancel={() => setSelectedUser(null)}
          onConfirm={() => {
            if (!selectedUser) {
              return;
            }

            deleteUser(selectedUser);
          }}
        />
      </main>
    </div>
  );
}

export default AdminUsers;
