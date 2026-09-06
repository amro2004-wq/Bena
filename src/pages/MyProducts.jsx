import { useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  MapPin,
  Trash2,
  Eye,
  Pencil,
  TriangleAlert,
  X,
} from "lucide-react";

import Toast from "../components/Toast";

import "./MyProducts.css";

function MyProducts() {
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("benaCurrentUser"));

  const getMyProducts = () => {
    const allProducts = JSON.parse(localStorage.getItem("benaProducts")) || [];

    return allProducts.filter(
      (product) => Number(product.sellerId) === Number(currentUser?.id),
    );
  };

  const [products, setProducts] = useState(getMyProducts);

  const [productToDelete, setProductToDelete] = useState(null);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

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

  const openDeleteModal = (product) => {
    if (Number(product.sellerId) !== Number(currentUser?.id)) {
      showToast("لا يمكنك حذف هذا المنتج", "error");

      return;
    }

    setProductToDelete(product);
  };

  const closeDeleteModal = () => {
    setProductToDelete(null);
  };

  const deleteProduct = () => {
    if (!productToDelete) {
      return;
    }

    if (Number(productToDelete.sellerId) !== Number(currentUser?.id)) {
      closeDeleteModal();

      showToast("لا يمكنك حذف هذا المنتج", "error");

      return;
    }

    const productId = productToDelete.id;

    const allProducts = JSON.parse(localStorage.getItem("benaProducts")) || [];

    /* DELETE PRODUCT */

    const updatedAllProducts = allProducts.filter(
      (product) => Number(product.id) !== Number(productId),
    );

    localStorage.setItem("benaProducts", JSON.stringify(updatedAllProducts));

    setProducts(
      updatedAllProducts.filter(
        (product) => Number(product.sellerId) === Number(currentUser?.id),
      ),
    );

    /* DELETE FAVORITES */

    const favoritesData =
      JSON.parse(localStorage.getItem("benaFavorites")) || {};

    if (Array.isArray(favoritesData)) {
      localStorage.setItem("benaFavorites", JSON.stringify({}));
    } else {
      const updatedFavorites = {};

      Object.entries(favoritesData).forEach(([favoriteUserId, ids]) => {
        updatedFavorites[favoriteUserId] = Array.isArray(ids)
          ? ids.filter((favoriteId) => Number(favoriteId) !== Number(productId))
          : [];
      });

      localStorage.setItem("benaFavorites", JSON.stringify(updatedFavorites));
    }

    /* DELETE CHATS */

    const chats = JSON.parse(localStorage.getItem("benaMessages")) || {};

    const updatedChats = {};

    Object.entries(chats).forEach(([conversationId, conversation]) => {
      if (Array.isArray(conversation)) {
        return;
      }

      if (Number(conversation?.productId) !== Number(productId)) {
        updatedChats[conversationId] = conversation;
      }
    });

    localStorage.setItem("benaMessages", JSON.stringify(updatedChats));

    /* DELETE NOTIFICATIONS */

    const notifications =
      JSON.parse(localStorage.getItem("benaNotifications")) || [];

    const updatedNotifications = notifications.filter((notification) => {
      const productLink = `/products/${productId}`;

      const messageLinkStart = `/messages/${productId}`;

      const isProductNotification = notification.link === productLink;

      const isMessageNotification =
        notification.link?.startsWith(messageLinkStart);

      const isConversationNotification = notification.conversationId
        ?.toString()
        .startsWith(`${productId}_`);

      return !(
        isProductNotification ||
        isMessageNotification ||
        isConversationNotification
      );
    });

    localStorage.setItem(
      "benaNotifications",
      JSON.stringify(updatedNotifications),
    );

    closeDeleteModal();

    showToast("تم حذف المنتج بنجاح ✓", "success");
  };

  const editProduct = (product) => {
    if (Number(product.sellerId) !== Number(currentUser?.id)) {
      showToast("لا يمكنك تعديل هذا المنتج", "error");

      return;
    }

    navigate(`/edit-product/${product.id}`);
  };

  return (
    <main className="my-products-page" dir="rtl">
      <Toast show={toast.show} message={toast.message} type={toast.type} />

      <div className="my-products-container">
        <button
          type="button"
          className="my-products-back"
          onClick={() => navigate("/")}
        >
          <ArrowRight size={18} />
          العودة للرئيسية
        </button>

        <div className="my-products-heading">
          <span>إدارة منتجاتك</span>

          <h1>منتجاتي</h1>

          <p>كل المنتجات اللي نشرتها على بينا موجودة هون.</p>
        </div>

        {products.length > 0 ? (
          <div className="my-products-grid">
            {products.map((product) => (
              <div className="my-product-card" key={product.id}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="my-product-image"
                />

                <div className="my-product-content">
                  <div className="my-product-top">
                    <span>{product.condition}</span>

                    <strong>{Number(product.price).toLocaleString()} ₪</strong>
                  </div>

                  <h3>{product.name}</h3>

                  <div className="my-product-location">
                    <MapPin size={14} />

                    {product.location}
                  </div>

                  <div className="my-product-actions">
                    <button
                      type="button"
                      className="view-product-button"
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      <Eye size={16} />
                      عرض المنتج
                    </button>

                    <button
                      type="button"
                      className="edit-product-button"
                      onClick={() => editProduct(product)}
                    >
                      <Pencil size={16} />
                      تعديل
                    </button>

                    <button
                      type="button"
                      className="delete-product-button"
                      onClick={() => openDeleteModal(product)}
                    >
                      <Trash2 size={16} />
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="my-products-empty">
            <h2>ما عندك منتجات لسه</h2>

            <p>ابدأ بنشر أول منتج إلك على بينا.</p>

            <button type="button" onClick={() => navigate("/sell")}>
              بيع منتج
            </button>
          </div>
        )}
      </div>

      {productToDelete && (
        <div className="delete-modal-overlay" onClick={closeDeleteModal}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="delete-modal-close"
              onClick={closeDeleteModal}
            >
              <X size={18} />
            </button>

            <div className="delete-modal-icon">
              <TriangleAlert size={30} />
            </div>

            <h2>حذف المنتج؟</h2>

            <p>
              هل أنت متأكد من حذف
              <strong> {productToDelete.name}؟</strong>
              <br />
              لن تتمكن من استرجاعه بعد الحذف.
            </p>

            <div className="delete-modal-actions">
              <button
                type="button"
                className="delete-modal-cancel"
                onClick={closeDeleteModal}
              >
                إلغاء
              </button>

              <button
                type="button"
                className="delete-modal-confirm"
                onClick={deleteProduct}
              >
                <Trash2 size={16} />
                حذف المنتج
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default MyProducts;
