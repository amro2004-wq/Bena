import "./MyProducts.css";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  MapPin,
  Trash2,
  Eye,
  Pencil,
  TriangleAlert,
  X,
  ImageOff,
} from "lucide-react";

import Toast from "../components/Toast";

function MyProducts() {
  const navigate = useNavigate();

  const toastTimerRef = useRef(null);

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
    const savedUser = readStorage("benaCurrentUser", null);

    if (
      !savedUser ||
      typeof savedUser !== "object" ||
      Array.isArray(savedUser)
    ) {
      return null;
    }

    return savedUser;
  }, [readStorage]);

  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());

  const userId =
    currentUser?.id !== undefined && currentUser?.id !== null
      ? String(currentUser.id)
      : null;

  /* PRODUCTS */

  const getAllProducts = useCallback(() => {
    const savedProducts = readStorage("benaProducts", []);

    return Array.isArray(savedProducts) ? savedProducts : [];
  }, [readStorage]);

  const [allProducts, setAllProducts] = useState(() => getAllProducts());

  const products = useMemo(() => {
    if (!userId) {
      return [];
    }

    return allProducts
      .filter(
        (product) =>
          product &&
          typeof product === "object" &&
          product.sellerId !== undefined &&
          product.sellerId !== null &&
          String(product.sellerId) === userId,
      )
      .sort((a, b) => {
        const firstDate = new Date(a?.createdAt || 0).getTime();
        const secondDate = new Date(b?.createdAt || 0).getTime();

        const safeFirstDate = Number.isFinite(firstDate) ? firstDate : 0;
        const safeSecondDate = Number.isFinite(secondDate) ? secondDate : 0;

        return safeSecondDate - safeFirstDate;
      });
  }, [allProducts, userId]);

  /* IMAGE ERRORS */

  const [failedImageIds, setFailedImageIds] = useState(() => new Set());

  /* DELETE */

  const [productToDelete, setProductToDelete] = useState(null);

  /* TOAST */

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

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

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  /* REFRESH */

  const refreshProducts = useCallback(() => {
    setAllProducts(getAllProducts());
    setFailedImageIds(new Set());
  }, [getAllProducts]);

  const refreshUser = useCallback(() => {
    setCurrentUser(getCurrentUser());
  }, [getCurrentUser]);

  /* EVENTS */

  useEffect(() => {
    const handleStorage = (event) => {
      if (!event.key || event.key === "benaProducts") {
        refreshProducts();
      }

      if (!event.key || event.key === "benaCurrentUser") {
        refreshUser();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("bena-products-updated", refreshProducts);
    window.addEventListener("bena-users-updated", refreshUser);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("bena-products-updated", refreshProducts);
      window.removeEventListener("bena-users-updated", refreshUser);
    };
  }, [refreshProducts, refreshUser]);

  /* DELETE MODAL EFFECT */

  useEffect(() => {
    if (!productToDelete) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setProductToDelete(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [productToDelete]);

  /* IMAGE */

  const getProductImage = (product) => {
    if (product?.image) {
      return product.image;
    }

    if (Array.isArray(product?.images) && product.images.length > 0) {
      return product.images[0] || "";
    }

    return "";
  };

  const handleImageError = (productId) => {
    setFailedImageIds((current) => {
      const updated = new Set(current);

      updated.add(String(productId));

      return updated;
    });
  };

  /* PRICE */

  const getProductPrice = (product) => {
    const price = Number(product?.price);

    if (!Number.isFinite(price) || price < 0) {
      return 0;
    }

    return price;
  };

  /* OWNER */

  const isProductOwner = (product, targetUserId = userId) => {
    if (
      !product ||
      !targetUserId ||
      product.sellerId === undefined ||
      product.sellerId === null
    ) {
      return false;
    }

    return String(product.sellerId) === String(targetUserId);
  };

  /* OPEN DELETE */

  const openDeleteModal = (product) => {
    if (!isProductOwner(product)) {
      showToast("لا يمكنك حذف هذا المنتج", "error");

      return;
    }

    setProductToDelete(product);
  };

  /* CLOSE DELETE */

  const closeDeleteModal = () => {
    setProductToDelete(null);
  };

  /* DELETE FAVORITES */

  const removeFromFavorites = (productId) => {
    const savedFavorites = readStorage("benaFavorites", {});

    if (
      !savedFavorites ||
      typeof savedFavorites !== "object" ||
      Array.isArray(savedFavorites)
    ) {
      localStorage.setItem("benaFavorites", JSON.stringify({}));

      return;
    }

    const updatedFavorites = {};

    Object.entries(savedFavorites).forEach(([favoriteUserId, ids]) => {
      updatedFavorites[favoriteUserId] = Array.isArray(ids)
        ? ids.filter((favoriteId) => String(favoriteId) !== String(productId))
        : [];
    });

    localStorage.setItem("benaFavorites", JSON.stringify(updatedFavorites));
  };

  /* DELETE CART */

  const removeFromCart = (productId) => {
    const savedCart = readStorage("benaCart", {});

    if (
      !savedCart ||
      typeof savedCart !== "object" ||
      Array.isArray(savedCart)
    ) {
      localStorage.setItem("benaCart", JSON.stringify({}));

      return;
    }

    const updatedCart = {};

    Object.entries(savedCart).forEach(([cartUserId, ids]) => {
      updatedCart[cartUserId] = Array.isArray(ids)
        ? ids.filter(
            (cartProductId) => String(cartProductId) !== String(productId),
          )
        : [];
    });

    localStorage.setItem("benaCart", JSON.stringify(updatedCart));
  };

  /* DELETE MESSAGES */

  const removeProductMessages = (productId) => {
    const savedMessages = readStorage("benaMessages", {});

    if (
      !savedMessages ||
      typeof savedMessages !== "object" ||
      Array.isArray(savedMessages)
    ) {
      localStorage.setItem("benaMessages", JSON.stringify({}));

      return;
    }

    const updatedMessages = {};

    Object.entries(savedMessages).forEach(([conversationId, conversation]) => {
      let conversationProductId = null;

      if (
        conversation &&
        typeof conversation === "object" &&
        !Array.isArray(conversation)
      ) {
        conversationProductId =
          conversation.productId ??
          (Array.isArray(conversation.messages)
            ? conversation.messages[0]?.productId
            : null) ??
          null;
      }

      if (Array.isArray(conversation)) {
        conversationProductId = conversation[0]?.productId ?? null;
      }

      const belongsByData =
        conversationProductId !== null &&
        conversationProductId !== undefined &&
        String(conversationProductId) === String(productId);

      const belongsById = String(conversationId).startsWith(
        `${String(productId)}_`,
      );

      if (!belongsByData && !belongsById) {
        updatedMessages[conversationId] = conversation;
      }
    });

    localStorage.setItem("benaMessages", JSON.stringify(updatedMessages));
  };

  /* DELETE NOTIFICATIONS */

  const removeProductNotifications = (productId) => {
    const savedNotifications = readStorage("benaNotifications", []);

    const notifications = Array.isArray(savedNotifications)
      ? savedNotifications
      : [];

    const productIdString = String(productId);

    const productLinks = [
      `/products/${productIdString}`,
      `/product/${productIdString}`,
    ];

    const messageLink = `/messages/${productIdString}`;

    const updatedNotifications = notifications.filter((notification) => {
      if (
        !notification ||
        typeof notification !== "object" ||
        Array.isArray(notification)
      ) {
        return false;
      }

      const notificationProductId = notification.productId;

      const belongsByProductId =
        notificationProductId !== undefined &&
        notificationProductId !== null &&
        String(notificationProductId) === productIdString;

      const notificationLink = String(notification.link || "");

      const belongsByLink = productLinks.includes(notificationLink);

      const belongsByMessage =
        notificationLink === messageLink ||
        notificationLink.startsWith(`${messageLink}?`);

      const belongsByConversation = String(
        notification.conversationId || "",
      ).startsWith(`${productIdString}_`);

      return !(
        belongsByProductId ||
        belongsByLink ||
        belongsByMessage ||
        belongsByConversation
      );
    });

    localStorage.setItem(
      "benaNotifications",
      JSON.stringify(updatedNotifications),
    );
  };

  /* DELETE PRODUCT */

  const deleteProduct = () => {
    if (!productToDelete) {
      return;
    }

    const latestUser = getCurrentUser();

    const latestUserId =
      latestUser?.id !== undefined && latestUser?.id !== null
        ? String(latestUser.id)
        : null;

    if (!latestUserId) {
      closeDeleteModal();

      showToast("سجل دخولك أولاً للمتابعة", "info");

      return;
    }

    const productId = productToDelete.id;

    const latestProducts = getAllProducts();

    const latestProduct =
      latestProducts.find(
        (product) => String(product?.id) === String(productId),
      ) || null;

    if (!latestProduct) {
      closeDeleteModal();

      setAllProducts(latestProducts);

      showToast("المنتج غير موجود أو تم حذفه مسبقًا", "info");

      return;
    }

    if (!isProductOwner(latestProduct, latestUserId)) {
      closeDeleteModal();

      setCurrentUser(latestUser);
      setAllProducts(latestProducts);

      showToast("لا يمكنك حذف هذا المنتج", "error");

      return;
    }

    try {
      /* DELETE PRODUCT */

      const updatedProducts = latestProducts.filter(
        (product) => String(product?.id) !== String(productId),
      );

      localStorage.setItem("benaProducts", JSON.stringify(updatedProducts));

      /* CLEAN RELATED DATA */

      removeFromFavorites(productId);
      removeFromCart(productId);
      removeProductMessages(productId);
      removeProductNotifications(productId);

      /* UPDATE UI */

      setCurrentUser(latestUser);
      setAllProducts(updatedProducts);

      setFailedImageIds((current) => {
        const updated = new Set(current);

        updated.delete(String(productId));

        return updated;
      });

      closeDeleteModal();

      /* EVENTS */

      window.dispatchEvent(new Event("bena-products-updated"));
      window.dispatchEvent(new Event("bena-favorites-updated"));
      window.dispatchEvent(new Event("bena-cart-updated"));
      window.dispatchEvent(new Event("bena-messages-updated"));
      window.dispatchEvent(new Event("bena-notifications-updated"));

      showToast("تم حذف المنتج بنجاح ✓", "success");
    } catch {
      showToast("تعذر حذف المنتج، حاول مرة أخرى", "error");
    }
  };

  /* EDIT PRODUCT */

  const editProduct = (product) => {
    if (!isProductOwner(product)) {
      showToast("لا يمكنك تعديل هذا المنتج", "error");

      return;
    }

    navigate(`/edit-product/${encodeURIComponent(String(product.id))}`);
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
          <ArrowRight size={19} />

          <span>العودة للرئيسية</span>
        </button>

        <div className="my-products-heading">
          <span>إدارة منتجاتك</span>

          <h1>منتجاتي</h1>

          <p>كل المنتجات اللي نشرتها على بينا موجودة هون.</p>
        </div>

        {products.length > 0 ? (
          <div className="my-products-grid">
            {products.map((product) => {
              const productId = String(product.id);

              const productImage = getProductImage(product);

              const productPrice = getProductPrice(product);

              const imageFailed = failedImageIds.has(productId);

              return (
                <article className="my-product-card" key={productId}>
                  {productImage && !imageFailed ? (
                    <img
                      src={productImage}
                      alt={product.name || "صورة المنتج"}
                      className="my-product-image"
                      onError={() => handleImageError(productId)}
                    />
                  ) : (
                    <div className="my-product-image my-product-image-fallback">
                      <ImageOff size={34} aria-hidden="true" />

                      <span>لا توجد صورة</span>
                    </div>
                  )}

                  <div className="my-product-content">
                    <div className="my-product-top">
                      <span>{product.condition || "مستخدم"}</span>

                      <strong>
                        {productPrice.toLocaleString()}
                        {" ₪"}
                      </strong>
                    </div>

                    <h3 title={product.name || "منتج"}>
                      {product.name || "منتج"}
                    </h3>

                    <div className="my-product-location">
                      <MapPin size={14} aria-hidden="true" />

                      <span>{product.location || "غير محدد"}</span>
                    </div>

                    <div className="my-product-actions">
                      <button
                        type="button"
                        className="view-product-button"
                        onClick={() =>
                          navigate(`/products/${encodeURIComponent(productId)}`)
                        }
                        aria-label={`عرض ${product.name || "المنتج"}`}
                      >
                        <Eye size={16} />

                        <span>عرض المنتج</span>
                      </button>

                      <button
                        type="button"
                        className="edit-product-button"
                        onClick={() => editProduct(product)}
                        aria-label={`تعديل ${product.name || "المنتج"}`}
                      >
                        <Pencil size={16} />

                        <span>تعديل</span>
                      </button>

                      <button
                        type="button"
                        className="delete-product-button"
                        onClick={() => openDeleteModal(product)}
                        aria-label={`حذف ${product.name || "المنتج"}`}
                      >
                        <Trash2 size={16} />

                        <span>حذف</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
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

      {/* DELETE MODAL */}

      {productToDelete && (
        <div
          className="delete-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDeleteModal();
            }
          }}
        >
          <div
            className="delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-product-title"
            aria-describedby="delete-product-description"
          >
            <button
              type="button"
              className="delete-modal-close"
              aria-label="إغلاق نافذة حذف المنتج"
              onClick={closeDeleteModal}
            >
              <X size={18} />
            </button>

            <div className="delete-modal-icon" aria-hidden="true">
              <TriangleAlert size={30} />
            </div>

            <h2 id="delete-product-title">حذف المنتج؟</h2>

            <p id="delete-product-description">
              هل أنت متأكد من حذف
              <strong> {productToDelete.name || "هذا المنتج"}؟</strong>
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

                <span>حذف المنتج</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default MyProducts;
