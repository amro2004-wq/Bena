import "./AdminProducts.css";

import { useMemo, useState } from "react";

import { Package, Trash2, Eye, Search, MapPin, UserRound } from "lucide-react";

import { useNavigate } from "react-router-dom";

import AdminSidebar from "../components/AdminSidebar";
import Toast from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";

function AdminProducts() {
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

  const [products, setProducts] = useState(() =>
    readStorage("benaProducts", []),
  );

  const [search, setSearch] = useState("");

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [selectedProduct, setSelectedProduct] = useState(null);

  const users = readStorage("benaUsers", []);

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

  /* SELLER */

  const getSeller = (sellerId) => {
    return users.find((user) => Number(user.id) === Number(sellerId));
  };

  /* FILTER */

  const filteredProducts = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return products;
    }

    return products.filter((product) => {
      const seller = getSeller(product.sellerId);

      const productName = product.name || product.title || "";

      const location = product.location || "";

      const sellerName = seller?.name || product.sellerName || "";

      return (
        productName.toLowerCase().includes(value) ||
        location.toLowerCase().includes(value) ||
        sellerName.toLowerCase().includes(value)
      );
    });
  }, [search, products, users]);

  /* DELETE PRODUCT */

  const deleteProduct = (productId) => {
    const id = Number(productId);

    const updatedProducts = products.filter(
      (product) => Number(product.id) !== id,
    );

    localStorage.setItem("benaProducts", JSON.stringify(updatedProducts));

    /* FAVORITES */

    const favoritesData = readStorage("benaFavorites", {});

    if (
      favoritesData &&
      typeof favoritesData === "object" &&
      !Array.isArray(favoritesData)
    ) {
      const updatedFavorites = {};

      Object.entries(favoritesData).forEach(([userId, ids]) => {
        updatedFavorites[userId] = Array.isArray(ids)
          ? ids.filter((favoriteProductId) => Number(favoriteProductId) !== id)
          : [];
      });

      localStorage.setItem("benaFavorites", JSON.stringify(updatedFavorites));
    }

    /* CART */

    const cartData = readStorage("benaCart", {});

    if (cartData && typeof cartData === "object" && !Array.isArray(cartData)) {
      const updatedCart = {};

      Object.entries(cartData).forEach(([userId, ids]) => {
        updatedCart[userId] = Array.isArray(ids)
          ? ids.filter((cartProductId) => Number(cartProductId) !== id)
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

      const idFromConversation = Number(idParts[0]);

      let conversationProductId = null;

      if (Array.isArray(conversation)) {
        conversationProductId = Number(
          conversation[0]?.productId ?? idFromConversation,
        );
      } else {
        conversationProductId = Number(
          conversation?.productId ?? idFromConversation,
        );
      }

      const belongsToProduct = conversationProductId === id;

      if (!belongsToProduct) {
        updatedMessages[conversationId] = conversation;
      }
    });

    localStorage.setItem("benaMessages", JSON.stringify(updatedMessages));

    /* NOTIFICATIONS */

    const notifications = readStorage("benaNotifications", []);

    const updatedNotifications = Array.isArray(notifications)
      ? notifications.filter((notification) => {
          const notificationProductId = Number(notification.productId);

          const productLink = `/products/${id}`;

          const oldProductLink = `/product/${id}`;

          const messageLink = `/messages/${id}`;

          return !(
            notificationProductId === id ||
            notification.link === productLink ||
            notification.link === oldProductLink ||
            notification.link?.startsWith(messageLink) ||
            notification.conversationId?.toString().startsWith(`${id}_`)
          );
        })
      : [];

    localStorage.setItem(
      "benaNotifications",
      JSON.stringify(updatedNotifications),
    );

    /* UPDATE UI */

    setProducts(updatedProducts);

    showToast("تم حذف المنتج وبياناته المرتبطة ✓", "success");
  };

  /* CONDITION */

  const getCondition = (condition) => {
    if (!condition) {
      return "غير محدد";
    }

    return condition;
  };

  return (
    <div className="admin-layout" dir="rtl">
      <AdminSidebar />

      <main className="admin-products-page">
        <Toast show={toast.show} message={toast.message} type={toast.type} />

        <div className="admin-products-container">
          <div className="admin-products-heading">
            <div>
              <span>إدارة المنتجات</span>

              <h1>المنتجات</h1>

              <p>تابع جميع المنتجات المنشورة على منصة بينا.</p>
            </div>

            <div className="admin-products-count">
              <Package size={20} />

              <strong>{products.length}</strong>

              <span>منتج</span>
            </div>
          </div>

          <div className="admin-products-toolbar">
            <div className="admin-products-search">
              <Search size={18} />

              <input
                type="text"
                value={search}
                placeholder="ابحث باسم المنتج أو البائع أو الموقع..."
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          <div className="admin-products-table-wrapper">
            <table className="admin-products-table">
              <thead>
                <tr>
                  <th>المنتج</th>

                  <th>البائع</th>

                  <th>السعر</th>

                  <th>الموقع</th>

                  <th>الحالة</th>

                  <th>الإجراءات</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => {
                  const seller = getSeller(product.sellerId);

                  return (
                    <tr key={product.id}>
                      <td>
                        <div className="admin-product-cell">
                          <div className="admin-product-image">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name || product.title || "منتج"}
                              />
                            ) : (
                              <Package size={20} />
                            )}
                          </div>

                          <div>
                            <strong>
                              {product.name || product.title || "بدون اسم"}
                            </strong>

                            <span>ID: {product.id}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="admin-product-seller">
                          <UserRound size={16} />

                          <span>
                            {seller?.name || product.sellerName || "غير معروف"}
                          </span>
                        </div>
                      </td>

                      <td>
                        <strong className="admin-product-price">
                          {product.price ?? 0} ₪
                        </strong>
                      </td>

                      <td>
                        <span className="admin-product-location">
                          <MapPin size={15} />

                          {product.location || "غير محدد"}
                        </span>
                      </td>

                      <td>
                        <span className="admin-product-condition">
                          {getCondition(product.condition)}
                        </span>
                      </td>

                      <td>
                        <div className="admin-product-actions">
                          <button
                            type="button"
                            className="admin-view-product"
                            onClick={() => navigate(`/products/${product.id}`)}
                          >
                            <Eye size={16} />
                            عرض
                          </button>

                          <button
                            type="button"
                            className="admin-delete-product"
                            onClick={() => setSelectedProduct(product)}
                          >
                            <Trash2 size={16} />
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredProducts.length === 0 && (
              <div className="admin-products-empty">
                {search
                  ? "لا توجد نتائج مطابقة للبحث."
                  : "لا توجد منتجات منشورة حاليًا."}
              </div>
            )}
          </div>
        </div>
        <ConfirmModal
          open={Boolean(selectedProduct)}
          title="حذف المنتج"
          message={
            selectedProduct
              ? `هل أنت متأكد من حذف ${
                  selectedProduct.name || selectedProduct.title || "هذا المنتج"
                }؟ سيتم حذف البيانات المرتبطة به أيضًا.`
              : ""
          }
          confirmText="حذف المنتج"
          cancelText="إلغاء"
          onCancel={() => setSelectedProduct(null)}
          onConfirm={() => {
            if (!selectedProduct) {
              return;
            }

            deleteProduct(selectedProduct.id);

            setSelectedProduct(null);
          }}
        />
      </main>
    </div>
  );
}

export default AdminProducts;
