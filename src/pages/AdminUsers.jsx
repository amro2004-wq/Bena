import "./AdminUsers.css";

import { useMemo, useState } from "react";

import { Users, Trash2, ShieldCheck, UserRound, Package } from "lucide-react";

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

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

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
    return users.map((user) => {
      const productsCount = products.filter(
        (product) => Number(product.sellerId) === Number(user.id),
      ).length;

      return {
        ...user,
        productsCount,
      };
    });
  }, [users, products]);

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
    if (Number(user.id) === Number(currentUser?.id)) {
      showToast("لا يمكنك حذف حساب الأدمن الحالي", "error");

      return;
    }

    if (user.role === "admin") {
      showToast("لا يمكنك حذف حساب أدمن آخر من هنا", "error");

      return;
    }

    const userId = Number(user.id);

    /* USER PRODUCTS */

    const allProducts = readStorage("benaProducts", []);

    const deletedProductIds = allProducts
      .filter((product) => Number(product.sellerId) === userId)
      .map((product) => Number(product.id));

    const updatedProducts = allProducts.filter(
      (product) => Number(product.sellerId) !== userId,
    );

    localStorage.setItem("benaProducts", JSON.stringify(updatedProducts));

    /* USERS */

    const updatedUsers = users.filter((item) => Number(item.id) !== userId);

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
        if (Number(favoriteUserId) === userId) {
          return;
        }

        updatedFavorites[favoriteUserId] = Array.isArray(ids)
          ? ids.filter(
              (productId) => !deletedProductIds.includes(Number(productId)),
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
        if (Number(cartUserId) === userId) {
          return;
        }

        updatedCart[cartUserId] = Array.isArray(ids)
          ? ids.filter(
              (productId) => !deletedProductIds.includes(Number(productId)),
            )
          : [];
      });

      localStorage.setItem("benaCart", JSON.stringify(updatedCart));

      window.dispatchEvent(new CustomEvent("bena-cart-updated"));
    }

    /* MESSAGES */

    const messages = readStorage("benaMessages", {});

    const updatedMessages = {};

    Object.entries(messages).forEach(([conversationId, conversation]) => {
      const idParts = conversationId.split("_");

      const idProductId = Number(idParts[0]);

      const idBuyerId = Number(idParts[1]);

      let buyerId = null;
      let sellerId = null;
      let productId = null;

      if (Array.isArray(conversation)) {
        const firstMessage = conversation[0];

        buyerId = Number(firstMessage?.buyerId ?? idBuyerId);

        sellerId = Number(firstMessage?.sellerId);

        productId = Number(firstMessage?.productId ?? idProductId);
      } else {
        buyerId = Number(conversation?.buyerId ?? idBuyerId);

        sellerId = Number(conversation?.sellerId);

        productId = Number(conversation?.productId ?? idProductId);
      }

      const involvesUser = buyerId === userId || sellerId === userId;

      const deletedProduct = deletedProductIds.includes(productId);

      if (!involvesUser && !deletedProduct) {
        updatedMessages[conversationId] = conversation;
      }
    });

    localStorage.setItem("benaMessages", JSON.stringify(updatedMessages));

    /* NOTIFICATIONS */

    const notifications = readStorage("benaNotifications", []);

    const updatedNotifications = Array.isArray(notifications)
      ? notifications.filter((notification) => {
          const belongsToUser =
            Number(notification.userId) === userId ||
            Number(notification.fromUserId) === userId ||
            Number(notification.senderId) === userId;

          const notificationProductId = Number(notification.productId);

          const deletedProduct = deletedProductIds.some((productId) => {
            const productLink = `/products/${productId}`;

            const messageLink = `/messages/${productId}`;

            return (
              notificationProductId === productId ||
              notification.link === productLink ||
              notification.link?.startsWith(messageLink) ||
              notification.conversationId
                ?.toString()
                .startsWith(`${productId}_`)
            );
          });

          return !belongsToUser && !deletedProduct;
        })
      : [];

    localStorage.setItem(
      "benaNotifications",
      JSON.stringify(updatedNotifications),
    );

    /* PROFILES */

    const profiles = readStorage("benaProfiles", {});

    if (profiles && typeof profiles === "object" && !Array.isArray(profiles)) {
      const updatedProfiles = {
        ...profiles,
      };

      delete updatedProfiles[String(user.id)];

      localStorage.setItem("benaProfiles", JSON.stringify(updatedProfiles));
    }

    /* UPDATE UI */

    setUsers(updatedUsers);

    setProducts(updatedProducts);

    showToast("تم حذف المستخدم وبياناته بنجاح ✓", "success");
  };

  return (
    <div className="admin-layout" dir="rtl">
      <AdminSidebar />

      <main className="admin-users-page">
        <Toast show={toast.show} message={toast.message} type={toast.type} />

        <div className="admin-users-container">
          <div className="admin-users-heading">
            <div>
              <span>إدارة المستخدمين</span>

              <h1>المستخدمون</h1>

              <p>تابع الحسابات المسجلة على منصة بينا.</p>
            </div>

            <div className="admin-users-count">
              <Users size={20} />

              <strong>{usersWithProducts.length}</strong>

              <span>مستخدم</span>
            </div>
          </div>

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
                {usersWithProducts.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="admin-user-cell">
                        <div className="admin-user-avatar">
                          <UserRound size={18} />
                        </div>

                        <div>
                          <strong>{user.name || "بدون اسم"}</strong>

                          {Number(user.id) === Number(currentUser?.id) && (
                            <span>أنت</span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>{user.email || "غير معروف"}</td>

                    <td>
                      <span
                        className={`admin-role-badge ${
                          user.role === "admin" ? "admin" : "user"
                        }`}
                      >
                        {user.role === "admin" ? (
                          <>
                            <ShieldCheck size={14} />
                            أدمن
                          </>
                        ) : (
                          <>
                            <UserRound size={14} />
                            مستخدم
                          </>
                        )}
                      </span>
                    </td>

                    <td>
                      <span className="admin-products-count">
                        <Package size={15} />

                        {user.productsCount}
                      </span>
                    </td>

                    <td>{formatDate(user.createdAt)}</td>

                    <td>
                      <button
                        type="button"
                        className="admin-delete-user"
                        disabled={user.role === "admin"}
                        onClick={() => setSelectedUser(user)}
                      >
                        <Trash2 size={16} />
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {usersWithProducts.length === 0 && (
              <div className="admin-users-empty">لا يوجد مستخدمون حاليًا.</div>
            )}
          </div>
        </div>
        <ConfirmModal
          open={Boolean(selectedUser)}
          title="حذف المستخدم"
          message={
            selectedUser
              ? `هل أنت متأكد من حذف ${selectedUser.name || "هذا المستخدم"}؟ سيتم حذف منتجاته وبياناته المرتبطة أيضًا.`
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

            setSelectedUser(null);
          }}
        />
      </main>
    </div>
  );
}

export default AdminUsers;
