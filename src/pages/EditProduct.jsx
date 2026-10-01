import "./EditProduct.css";

import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ArrowRight, Save, ShieldAlert, ImageOff } from "lucide-react";

import Toast from "../components/Toast";

const categories = [
  "إلكترونيات",
  "موبايلات",
  "كمبيوتر ولابتوب",
  "ألعاب وإكسسوارات",
  "أجهزة منزلية",
  "أثاث",
  "ملابس",
  "أحذية",
  "حقائب وإكسسوارات",
  "ساعات ومجوهرات",
  "عناية شخصية وتجميل",
  "أطفال ورضع",
  "ألعاب أطفال",
  "كتب وقرطاسية",
  "رياضة ولياقة",
  "سيارات وقطع غيار",
  "دراجات",
  "أدوات ومعدات",
  "مستلزمات منزلية",
  "حديقة وزراعة",
  "حيوانات ومستلزماتها",
  "مأكولات ومنتجات منزلية",
  "هوايات ومقتنيات",
  "أخرى",
];

const locations = ["غزة", "شمال غزة", "دير البلح", "خان يونس", "رفح"];

const conditions = ["جديد", "ممتاز", "مستخدم"];

function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();

  const toastTimerRef = useRef(null);
  const redirectTimersRef = useRef([]);
  const loadedProductIdRef = useRef(null);

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

  const getSavedProducts = useCallback(() => {
    const products = readStorage("benaProducts", []);

    return Array.isArray(products) ? products : [];
  }, [readStorage]);

  const [savedProducts, setSavedProducts] = useState(() => getSavedProducts());

  const product =
    savedProducts.find((item) => String(item?.id) === String(id)) || null;

  /* OWNER */

  const isOwner =
    Boolean(product) &&
    Boolean(userId) &&
    product?.sellerId !== undefined &&
    product?.sellerId !== null &&
    String(product.sellerId) === userId;

  /* IMAGE */

  const getProductImage = useCallback((currentProduct) => {
    if (currentProduct?.image) {
      return currentProduct.image;
    }

    if (
      Array.isArray(currentProduct?.images) &&
      currentProduct.images.length > 0
    ) {
      return currentProduct.images[0] || "";
    }

    return "";
  }, []);

  const [imageError, setImageError] = useState(false);

  /* FORM */

  const createFormData = useCallback(
    (currentProduct) => ({
      name: currentProduct?.name || "",
      price: currentProduct?.price ?? "",
      category: currentProduct?.category || "",
      condition: currentProduct?.condition || "",
      location: currentProduct?.location || "",
      description: currentProduct?.description || "",
      image: getProductImage(currentProduct),
    }),
    [getProductImage],
  );

  const [formData, setFormData] = useState(() => createFormData(product));

  const [isSubmitting, setIsSubmitting] = useState(false);

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

  /* REDIRECT */

  const addRedirectTimer = (callback, delay) => {
    const timerId = setTimeout(() => {
      redirectTimersRef.current = redirectTimersRef.current.filter(
        (currentTimerId) => currentTimerId !== timerId,
      );

      callback();
    }, delay);

    redirectTimersRef.current.push(timerId);
  };

  /* CLEANUP */

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }

      redirectTimersRef.current.forEach((timerId) => {
        clearTimeout(timerId);
      });

      redirectTimersRef.current = [];
    };
  }, []);

  /* REFRESH */

  const refreshProducts = useCallback(() => {
    setSavedProducts(getSavedProducts());
  }, [getSavedProducts]);

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

  /* SYNC FORM */

  useEffect(() => {
    if (!product) {
      loadedProductIdRef.current = null;
      setImageError(false);

      return;
    }

    const productId = String(product.id);

    if (loadedProductIdRef.current === productId) {
      return;
    }

    setFormData(createFormData(product));
    setImageError(false);

    loadedProductIdRef.current = productId;
  }, [product, createFormData]);

  /* CHANGE */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  /* IMAGE CHANGE */

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      showToast("صيغة الصورة غير مدعومة، استخدم PNG أو JPG أو WEBP", "error");

      event.target.value = "";

      return;
    }

    const maxImageSize = 1.5 * 1024 * 1024;

    if (file.size > maxImageSize) {
      showToast("حجم الصورة كبير، اختار صورة أقل من 1.5MB", "error");

      event.target.value = "";

      return;
    }

    setImageError(false);

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        showToast("تعذر قراءة الصورة", "error");

        event.target.value = "";

        return;
      }

      setFormData((current) => ({
        ...current,
        image: reader.result,
      }));

      setImageError(false);
    };

    reader.onerror = () => {
      showToast("حدث خطأ أثناء قراءة الصورة", "error");

      event.target.value = "";
    };

    reader.readAsDataURL(file);
  };

  /* SUBMIT */

  const handleSubmit = (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const latestUser = getCurrentUser();

    /* USER CHECK */

    if (!latestUser || latestUser.id === undefined || latestUser.id === null) {
      showToast("سجل دخولك أولاً للمتابعة", "info");

      addRedirectTimer(() => {
        navigate("/login", {
          state: {
            from: `/edit-product/${encodeURIComponent(String(id))}`,
          },
        });
      }, 650);

      return;
    }

    /* LATEST PRODUCT */

    const latestProducts = getSavedProducts();

    const latestProduct =
      latestProducts.find((item) => String(item?.id) === String(id)) || null;

    if (!latestProduct) {
      showToast("المنتج غير موجود أو تم حذفه", "error");

      setSavedProducts(latestProducts);

      return;
    }

    /* OWNERSHIP */

    const ownsLatestProduct =
      latestProduct.sellerId !== undefined &&
      latestProduct.sellerId !== null &&
      String(latestProduct.sellerId) === String(latestUser.id);

    if (!ownsLatestProduct) {
      showToast("لا يمكنك تعديل منتج لا تملكه", "error");

      return;
    }

    const { name, price, category, condition, location, description, image } =
      formData;

    const cleanName = name.trim();
    const cleanDescription = description.trim();

    /* REQUIRED */

    if (
      !cleanName ||
      price === "" ||
      !category ||
      !condition ||
      !location ||
      !cleanDescription ||
      !image ||
      imageError
    ) {
      showToast("يرجى تعبئة جميع الحقول وإضافة صورة للمنتج", "error");

      return;
    }

    /* NAME */

    if (cleanName.length < 2) {
      showToast("اسم المنتج قصير جدًا", "error");

      return;
    }

    /* PRICE */

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      showToast("يرجى إدخال سعر صحيح للمنتج", "error");

      return;
    }

    /* CATEGORY */

    if (!categories.includes(category)) {
      showToast("يرجى اختيار تصنيف صحيح", "error");

      return;
    }

    /* CONDITION */

    if (!conditions.includes(condition)) {
      showToast("يرجى اختيار حالة صحيحة للمنتج", "error");

      return;
    }

    /* LOCATION */

    if (!locations.includes(location)) {
      showToast("يرجى اختيار منطقة صحيحة", "error");

      return;
    }

    setIsSubmitting(true);

    try {
      const updatedAt = new Date().toISOString();

      const updatedProducts = latestProducts.map((item) => {
        if (String(item?.id) !== String(id)) {
          return item;
        }

        if (
          item?.sellerId === undefined ||
          item?.sellerId === null ||
          String(item.sellerId) !== String(latestUser.id)
        ) {
          return item;
        }

        return {
          ...item,

          name: cleanName,

          price: numericPrice,

          category,

          condition,

          conditionClass:
            condition === "جديد"
              ? "new"
              : condition === "ممتاز"
                ? "excellent"
                : "used",

          location,

          description: cleanDescription,

          image,

          updatedAt,
        };
      });

      localStorage.setItem("benaProducts", JSON.stringify(updatedProducts));

      setSavedProducts(updatedProducts);

      window.dispatchEvent(new Event("bena-products-updated"));

      showToast("تم تحديث المنتج بنجاح ✓", "success");

      addRedirectTimer(() => {
        navigate(`/products/${encodeURIComponent(String(latestProduct.id))}`, {
          replace: true,
        });
      }, 900);
    } catch {
      setIsSubmitting(false);

      showToast("تعذر حفظ التعديلات، حاول مرة أخرى", "error");
    }
  };

  /* NOT FOUND */

  if (!product) {
    return (
      <main className="edit-product-page" dir="rtl">
        <div className="edit-product-not-found">
          <ImageOff size={40} />

          <h2>المنتج غير موجود</h2>

          <p>قد يكون المنتج قد تم حذفه أو لم يعد متوفرًا.</p>

          <button type="button" onClick={() => navigate("/my-products")}>
            العودة لمنتجاتي
          </button>
        </div>
      </main>
    );
  }

  /* NOT OWNER */

  if (!isOwner) {
    return (
      <main className="edit-product-page" dir="rtl">
        <div className="edit-product-not-found">
          <ShieldAlert size={40} />

          <h2>لا يمكنك تعديل هذا المنتج</h2>

          <p>هذا المنتج تابع لمستخدم آخر.</p>

          <button type="button" onClick={() => navigate("/my-products")}>
            العودة لمنتجاتي
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="edit-product-page" dir="rtl">
      <Toast show={toast.show} message={toast.message} type={toast.type} />

      <div className="edit-product-container">
        <button
          type="button"
          className="edit-product-back"
          onClick={() => navigate("/my-products")}
          disabled={isSubmitting}
        >
          <ArrowRight size={18} />

          <span>العودة لمنتجاتي</span>
        </button>

        <div className="edit-product-heading">
          <span>إدارة منتجاتك</span>

          <h1>تعديل المنتج</h1>

          <p>عدّل معلومات المنتج واحفظ التغييرات.</p>
        </div>

        <form className="edit-product-form" onSubmit={handleSubmit} noValidate>
          {/* IMAGE */}

          <div className="edit-current-image">
            {formData.image && !imageError ? (
              <img
                src={formData.image}
                alt={formData.name || "صورة المنتج"}
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="edit-image-fallback">
                <ImageOff size={30} />
              </div>
            )}

            <div className="edit-image-info">
              <strong>صورة المنتج</strong>

              <span>
                {imageError
                  ? "تعذر عرض الصورة، اختار صورة جديدة."
                  : "تقدر تغيّر صورة المنتج من هنا."}
              </span>

              <label
                className={`change-image-button ${
                  isSubmitting ? "disabled" : ""
                }`}
              >
                تغيير الصورة
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                  aria-label="تغيير صورة المنتج"
                />
              </label>
            </div>
          </div>

          {/* NAME */}

          <div className="edit-form-group">
            <label htmlFor="name">اسم المنتج</label>

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="اسم المنتج"
              maxLength={100}
              autoComplete="off"
              disabled={isSubmitting}
            />
          </div>

          {/* PRICE AND LOCATION */}

          <div className="edit-form-row">
            <div className="edit-form-group">
              <label htmlFor="price">السعر</label>

              <input
                id="price"
                name="price"
                type="number"
                min="1"
                step="1"
                value={formData.price}
                onChange={handleChange}
                placeholder="السعر"
                inputMode="numeric"
                disabled={isSubmitting}
              />
            </div>

            <div className="edit-form-group">
              <label htmlFor="location">الموقع</label>

              <select
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="">اختر الموقع</option>

                {locations.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* CATEGORY AND CONDITION */}

          <div className="edit-form-row">
            <div className="edit-form-group">
              <label htmlFor="category">التصنيف</label>

              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="">اختر التصنيف</option>

                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="edit-form-group">
              <label htmlFor="condition">حالة المنتج</label>

              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="">اختر الحالة</option>

                {conditions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* DESCRIPTION */}

          <div className="edit-form-group">
            <label htmlFor="description">وصف المنتج</label>

            <textarea
              id="description"
              name="description"
              rows="5"
              value={formData.description}
              onChange={handleChange}
              placeholder="اكتب وصف المنتج..."
              maxLength={1000}
              disabled={isSubmitting}
            />
          </div>

          {/* SAVE */}

          <button
            type="submit"
            className="save-product-button"
            disabled={isSubmitting}
          >
            <Save size={17} />

            {isSubmitting ? "جاري حفظ التعديلات..." : "حفظ التعديلات"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default EditProduct;
