import "./AdminProducts.css";

import { useMemo, useState } from "react";

import {
  Package,
  Trash2,
  Eye,
  Search,
  MapPin,
  UserRound,
  Boxes,
  Sparkles,
  RefreshCcw,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";

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

  const [products, setProducts] = useState(() => {
    const savedProducts = readStorage("benaProducts", []);

    return Array.isArray(savedProducts) ? savedProducts : [];
  });

  const usersData = readStorage("benaUsers", []);

  const users = Array.isArray(usersData) ? usersData : [];

  /* SEARCH */

  const [search, setSearch] = useState("");

  /* FILTERS */

  const [conditionFilter, setConditionFilter] = useState("all");

  const [sortBy, setSortBy] = useState("newest");

  /* TOAST */

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  /* MODAL */

  const [selectedProduct, setSelectedProduct] = useState(null);

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
    return users.find((user) => String(user.id) === String(sellerId));
  };

  /* CONDITION */

  const normalizeCondition = (condition) => {
    return String(condition || "")
      .trim()
      .toLowerCase();
  };

  const getCondition = (condition) => {
    if (!condition) {
      return "غير محدد";
    }

    return condition;
  };

  const getConditionClass = (condition) => {
    const value = normalizeCondition(condition);

    if (value === "جديد" || value === "new") {
      return "new";
    }

    if (value === "ممتاز" || value === "excellent") {
      return "excellent";
    }

    if (value === "مستخدم" || value === "used") {
      return "used";
    }

    return "default";
  };

  /* IMAGE */

  const getProductImage = (product) => {
    if (product?.image) {
      return product.image;
    }

    if (Array.isArray(product?.images) && product.images.length > 0) {
      return product.images[0];
    }

    return null;
  };

  /* STATISTICS */

  const statistics = useMemo(() => {
    const safeProducts = Array.isArray(products) ? products : [];

    return {
      all: safeProducts.length,

      new: safeProducts.filter(
        (product) => getConditionClass(product.condition) === "new",
      ).length,

      excellent: safeProducts.filter(
        (product) => getConditionClass(product.condition) === "excellent",
      ).length,

      used: safeProducts.filter(
        (product) => getConditionClass(product.condition) === "used",
      ).length,
    };
  }, [products]);

  /* FILTERED PRODUCTS */

  const filteredProducts = useMemo(() => {
    const value = search.trim().toLowerCase();

    const safeProducts = Array.isArray(products) ? [...products] : [];

    const result = safeProducts.filter((product) => {
      const seller = getSeller(product.sellerId);

      const productName = String(
        product.name || product.title || "",
      ).toLowerCase();

      const location = String(product.location || "").toLowerCase();

      const sellerName = String(
        seller?.name || product.sellerName || "",
      ).toLowerCase();

      const productId = String(product.id || "").toLowerCase();

      const matchesSearch =
        !value ||
        productName.includes(value) ||
        location.includes(value) ||
        sellerName.includes(value) ||
        productId.includes(value);

      const conditionClass = getConditionClass(product.condition);

      const matchesCondition =
        conditionFilter === "all" || conditionClass === conditionFilter;

      return matchesSearch && matchesCondition;
    });

    return result.sort((a, b) => {
      if (sortBy === "price-high") {
        return Number(b.price || 0) - Number(a.price || 0);
      }

      if (sortBy === "price-low") {
        return Number(a.price || 0) - Number(b.price || 0);
      }

      if (sortBy === "oldest") {
        return (
          new Date(a.createdAt || a.date || 0) -
          new Date(b.createdAt || b.date || 0)
        );
      }

      return (
        new Date(b.createdAt || b.date || 0) -
        new Date(a.createdAt || a.date || 0)
      );
    });
  }, [search, products, users, conditionFilter, sortBy]);

  /* DELETE PRODUCT */

  const deleteProduct = (productId) => {
    const id = String(productId);

    const safeProducts = Array.isArray(products) ? products : [];

    const updatedProducts = safeProducts.filter(
      (product) => String(product.id) !== id,
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
          ? ids.filter((favoriteProductId) => String(favoriteProductId) !== id)
          : [];
      });

      localStorage.setItem("benaFavorites", JSON.stringify(updatedFavorites));

      window.dispatchEvent(new CustomEvent("bena-favorites-updated"));
    }

    /* CART */

    const cartData = readStorage("benaCart", {});

    if (cartData && typeof cartData === "object" && !Array.isArray(cartData)) {
      const updatedCart = {};

      Object.entries(cartData).forEach(([userId, ids]) => {
        updatedCart[userId] = Array.isArray(ids)
          ? ids.filter((cartProductId) => String(cartProductId) !== id)
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

        const idFromConversation = String(idParts[0] || "");

        let conversationProductId = "";

        if (Array.isArray(conversation)) {
          conversationProductId = String(
            conversation[0]?.productId ?? idFromConversation,
          );
        } else {
          conversationProductId = String(
            conversation?.productId ?? idFromConversation,
          );
        }

        if (conversationProductId !== id) {
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
          const notificationProductId = String(notification.productId ?? "");

          const productLink = `/products/${id}`;

          const oldProductLink = `/product/${id}`;

          const messageLink = `/messages/${id}`;

          const link = String(notification.link || "");

          const conversationId = String(notification.conversationId || "");

          return !(
            notificationProductId === id ||
            link === productLink ||
            link === oldProductLink ||
            link.startsWith(messageLink) ||
            conversationId.startsWith(`${id}_`)
          );
        })
      : [];

    localStorage.setItem(
      "benaNotifications",
      JSON.stringify(updatedNotifications),
    );

    window.dispatchEvent(new CustomEvent("bena-notifications-updated"));

    /* UPDATE UI */

    setProducts(updatedProducts);

    setSelectedProduct(null);

    window.dispatchEvent(new CustomEvent("bena-products-updated"));

    showToast("تم حذف المنتج وبياناته المرتبطة ✓", "success");
  };

  /* RESET */

  const resetFilters = () => {
    setSearch("");
    setConditionFilter("all");
    setSortBy("newest");
  };

  return (
    <div className="admin-products-layout" dir="rtl">
      <AdminSidebar />

      <main className="admin-products-page">
        <Toast show={toast.show} message={toast.message} type={toast.type} />

        <div className="admin-products-container">
          {/* HEADER */}

          <header className="admin-products-heading">
            <div>
              <div className="admin-products-eyebrow">
                <Package size={14} />

                <span>إدارة المنتجات</span>
              </div>

              <h1>المنتجات</h1>

              <p>تابع المنتجات المنشورة على منصة بينا وأدر محتوى السوق.</p>
            </div>

            <div className="admin-products-heading-count">
              <span>إجمالي المنتجات</span>

              <strong>{statistics.all}</strong>

              <small>منتج منشور</small>
            </div>
          </header>

          {/* STATISTICS */}

          <section className="admin-products-stats">
            <button
              type="button"
              className={`admin-products-stat total ${
                conditionFilter === "all" ? "active" : ""
              }`}
              onClick={() => setConditionFilter("all")}
            >
              <span className="admin-products-stat-icon">
                <Boxes size={20} />
              </span>

              <div>
                <span>جميع المنتجات</span>

                <strong>{statistics.all}</strong>
              </div>
            </button>

            <button
              type="button"
              className={`admin-products-stat new ${
                conditionFilter === "new" ? "active" : ""
              }`}
              onClick={() => setConditionFilter("new")}
            >
              <span className="admin-products-stat-icon">
                <Sparkles size={20} />
              </span>

              <div>
                <span>جديد</span>

                <strong>{statistics.new}</strong>
              </div>
            </button>

            <button
              type="button"
              className={`admin-products-stat excellent ${
                conditionFilter === "excellent" ? "active" : ""
              }`}
              onClick={() => setConditionFilter("excellent")}
            >
              <span className="admin-products-stat-icon">
                <Package size={20} />
              </span>

              <div>
                <span>حالة ممتازة</span>

                <strong>{statistics.excellent}</strong>
              </div>
            </button>

            <button
              type="button"
              className={`admin-products-stat used ${
                conditionFilter === "used" ? "active" : ""
              }`}
              onClick={() => setConditionFilter("used")}
            >
              <span className="admin-products-stat-icon">
                <RefreshCcw size={20} />
              </span>

              <div>
                <span>مستخدم</span>

                <strong>{statistics.used}</strong>
              </div>
            </button>
          </section>

          {/* TOOLBAR */}

          <section className="admin-products-toolbar">
            <div className="admin-products-search">
              <Search size={17} />

              <input
                type="text"
                value={search}
                placeholder="ابحث باسم المنتج أو البائع أو الموقع أو رقم المنتج..."
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="admin-products-toolbar-options">
              <div className="admin-products-select">
                <SlidersHorizontal size={15} />

                <select
                  value={conditionFilter}
                  onChange={(event) => setConditionFilter(event.target.value)}
                >
                  <option value="all">جميع الحالات</option>

                  <option value="new">جديد</option>

                  <option value="excellent">ممتاز</option>

                  <option value="used">مستخدم</option>
                </select>

                <ChevronDown
                  className="admin-products-select-arrow"
                  size={14}
                />
              </div>

              <div className="admin-products-select">
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                >
                  <option value="newest">الأحدث أولًا</option>

                  <option value="oldest">الأقدم أولًا</option>

                  <option value="price-high">السعر: الأعلى</option>

                  <option value="price-low">السعر: الأقل</option>
                </select>

                <ChevronDown
                  className="admin-products-select-arrow"
                  size={14}
                />
              </div>
            </div>
          </section>

          {/* RESULTS */}

          <div className="admin-products-results">
            <span>
              عرض <strong>{filteredProducts.length}</strong> من{" "}
              <strong>{statistics.all}</strong> منتج
            </span>
          </div>

          {/* TABLE */}

          <section className="admin-products-table-card">
            <div className="admin-products-table-heading">
              <div>
                <h2>قائمة المنتجات</h2>

                <p>جميع المنتجات المنشورة ومعلومات البائع والسعر والحالة</p>
              </div>

              <span>{filteredProducts.length} نتيجة</span>
            </div>

            {filteredProducts.length > 0 ? (
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

                      const productImage = getProductImage(product);

                      return (
                        <tr key={product.id}>
                          <td>
                            <div className="admin-product-cell">
                              <div className="admin-product-image">
                                {productImage ? (
                                  <img
                                    src={productImage}
                                    alt={
                                      product.name || product.title || "منتج"
                                    }
                                    loading="lazy"
                                  />
                                ) : (
                                  <Package size={20} />
                                )}
                              </div>

                              <div>
                                <strong>
                                  {product.name || product.title || "بدون اسم"}
                                </strong>

                                <span>#{product.id}</span>
                              </div>
                            </div>
                          </td>

                          <td>
                            <div className="admin-product-seller">
                              <span className="admin-product-seller-icon">
                                <UserRound size={14} />
                              </span>

                              <span>
                                {seller?.name ||
                                  product.sellerName ||
                                  "غير معروف"}
                              </span>
                            </div>
                          </td>

                          <td>
                            <div className="admin-product-price">
                              <strong>
                                {Number(product.price || 0).toLocaleString(
                                  "en-US",
                                )}
                              </strong>

                              <span>₪</span>
                            </div>
                          </td>

                          <td>
                            <span className="admin-product-location">
                              <MapPin size={13} />

                              {product.location || "غير محدد"}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`admin-product-condition ${getConditionClass(
                                product.condition,
                              )}`}
                            >
                              {getCondition(product.condition)}
                            </span>
                          </td>

                          <td>
                            <div className="admin-product-actions">
                              <button
                                type="button"
                                className="admin-view-product"
                                onClick={() =>
                                  navigate(`/products/${product.id}`)
                                }
                              >
                                <Eye size={14} />
                                عرض
                              </button>

                              <button
                                type="button"
                                className="admin-delete-product"
                                onClick={() => setSelectedProduct(product)}
                              >
                                <Trash2 size={14} />
                                حذف
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="admin-products-empty">
                <span className="admin-products-empty-icon">
                  <Package size={29} />
                </span>

                <h2>لا توجد نتائج</h2>

                <p>لم يتم العثور على منتجات مطابقة للبحث أو الفلاتر.</p>

                <button type="button" onClick={resetFilters}>
                  عرض جميع المنتجات
                </button>
              </div>
            )}
          </section>
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
          }}
        />
      </main>
    </div>
  );
}

export default AdminProducts;
