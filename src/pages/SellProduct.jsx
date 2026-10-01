import "./SellProduct.css";

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Toast from "../components/Toast";

import {
  ArrowRight,
  Upload,
  ImagePlus,
  MapPin,
  CircleDollarSign,
  Tag,
  PackageCheck,
} from "lucide-react";

const CATEGORIES = [
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

const CONDITIONS = ["جديد", "ممتاز", "مستخدم"];

const LOCATIONS = ["غزة", "شمال غزة", "دير البلح", "خان يونس", "رفح"];

function SellProduct() {
  const navigate = useNavigate();

  const toastTimerRef = useRef(null);
  const redirectTimersRef = useRef([]);

  /* STORAGE */

  const readStorage = (key, fallback) => {
    try {
      const value = localStorage.getItem(key);

      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  };

  /* USER */

  const [currentUser] = useState(() => {
    const savedCurrentUser = readStorage("benaCurrentUser", null);

    if (
      !savedCurrentUser ||
      typeof savedCurrentUser !== "object" ||
      Array.isArray(savedCurrentUser)
    ) {
      return null;
    }

    return savedCurrentUser;
  });

  const userId =
    currentUser?.id !== undefined && currentUser?.id !== null
      ? String(currentUser.id)
      : null;

  /* FORM */

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    condition: "",
    price: "",
    location: "",
    description: "",
  });

  const [imagePreview, setImagePreview] = useState("");
  const [imageError, setImageError] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  /* TOAST */

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
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
  };

  /* TIMERS */

  const addRedirectTimer = (callback, delay) => {
    const timerId = setTimeout(() => {
      redirectTimersRef.current = redirectTimersRef.current.filter(
        (currentTimerId) => currentTimerId !== timerId,
      );

      callback();
    }, delay);

    redirectTimersRef.current.push(timerId);
  };

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

  /* CHANGE */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  /* IMAGE */

  const handleImage = (event) => {
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
      showToast("حجم الصورة كبير، اختر صورة أقل من 1.5MB", "error");

      event.target.value = "";

      return;
    }

    setImageError(false);

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImagePreview(reader.result);
        setImageError(false);
      }
    };

    reader.onerror = () => {
      setImagePreview("");
      setImageError(false);

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

    /* CHECK USER */

    if (!userId || !currentUser) {
      showToast("سجل دخولك أولاً لنشر منتج", "error");

      addRedirectTimer(() => {
        navigate("/login", {
          state: {
            from: "/sell",
          },
        });
      }, 650);

      return;
    }

    const { name, category, condition, price, location, description } =
      formData;

    const cleanName = name.trim();
    const cleanDescription = description.trim();

    /* REQUIRED FIELDS */

    if (
      !cleanName ||
      !category ||
      !condition ||
      !price ||
      !location ||
      !cleanDescription ||
      !imagePreview ||
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

    /* CATEGORY */

    if (!CATEGORIES.includes(category)) {
      showToast("يرجى اختيار تصنيف صحيح", "error");

      return;
    }

    /* CONDITION */

    if (!CONDITIONS.includes(condition)) {
      showToast("يرجى اختيار حالة صحيحة للمنتج", "error");

      return;
    }

    /* LOCATION */

    if (!LOCATIONS.includes(location)) {
      showToast("يرجى اختيار منطقة صحيحة", "error");

      return;
    }

    /* PRICE */

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      showToast("يرجى إدخال سعر صحيح للمنتج", "error");

      return;
    }

    /* PRODUCTS */

    const storedProducts = readStorage("benaProducts", []);

    const savedProducts = Array.isArray(storedProducts) ? storedProducts : [];

    const now = new Date().toISOString();

    const productId = Date.now();

    const newProduct = {
      id: productId,
      sellerId: currentUser.id,
      sellerName: currentUser.name || "مستخدم بينا",
      name: cleanName,
      category,
      condition,
      conditionClass:
        condition === "جديد"
          ? "new"
          : condition === "ممتاز"
            ? "excellent"
            : "used",
      price: numericPrice,
      location,
      description: cleanDescription,
      image: imagePreview,
      createdAt: now,
    };

    setIsSubmitting(true);

    try {
      /* SAVE PRODUCT */

      localStorage.setItem(
        "benaProducts",
        JSON.stringify([newProduct, ...savedProducts]),
      );

      window.dispatchEvent(new Event("bena-products-updated"));

      /* NOTIFICATION */

      const storedNotifications = readStorage("benaNotifications", []);

      const savedNotifications = Array.isArray(storedNotifications)
        ? storedNotifications
        : [];

      const notificationText = `تم نشر منتج "${newProduct.name}" بنجاح على بينا.`;

      const newNotification = {
        id: `${productId}_published`,
        userId: currentUser.id,
        type: "product",
        title: "تم نشر المنتج",
        text: notificationText,
        message: notificationText,
        createdAt: now,
        read: false,
        link: `/products/${newProduct.id}`,
        productId: newProduct.id,
      };

      localStorage.setItem(
        "benaNotifications",
        JSON.stringify([newNotification, ...savedNotifications]),
      );

      window.dispatchEvent(new Event("bena-notifications-updated"));

      showToast("تم نشر المنتج بنجاح ✓", "success");

      addRedirectTimer(() => {
        navigate("/products", {
          replace: true,
        });
      }, 900);
    } catch {
      setIsSubmitting(false);

      showToast("تعذر نشر المنتج، حاول مرة أخرى", "error");
    }
  };

  return (
    <main className="sell-page" dir="rtl">
      <Toast show={toast.show} message={toast.message} type={toast.type} />

      <div className="sell-container">
        <button
          type="button"
          className="sell-back"
          onClick={() => navigate("/")}
          disabled={isSubmitting}
        >
          <ArrowRight size={19} />

          <span>العودة للرئيسية</span>
        </button>

        <div className="sell-heading">
          <span>ابدأ البيع على بينا</span>

          <h1>أضف منتجك</h1>

          <p>أضف معلومات واضحة وصورة جيدة حتى يظهر منتجك بشكل أفضل للمشترين.</p>
        </div>

        <form className="sell-form" onSubmit={handleSubmit} noValidate>
          <div className="sell-form-grid">
            <div className="sell-form-main">
              {/* IMAGE */}

              <div className="sell-card">
                <div className="sell-card-title">
                  <ImagePlus size={19} aria-hidden="true" />

                  <h3>صورة المنتج</h3>
                </div>

                <label
                  className={`image-upload ${isSubmitting ? "disabled" : ""}`}
                >
                  {imagePreview && !imageError ? (
                    <img
                      src={imagePreview}
                      alt="معاينة المنتج"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="image-upload-placeholder">
                      <Upload size={30} aria-hidden="true" />

                      <strong>
                        {imageError
                          ? "تعذر عرض الصورة، اختر صورة أخرى"
                          : "اضغط لإضافة صورة"}
                      </strong>

                      <span>PNG أو JPG أو WEBP - بحد أقصى 1.5MB</span>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImage}
                    disabled={isSubmitting}
                    aria-label="اختيار صورة المنتج"
                  />
                </label>
              </div>

              {/* PRODUCT INFO */}

              <div className="sell-card">
                <div className="sell-card-title">
                  <Tag size={19} aria-hidden="true" />

                  <h3>معلومات المنتج</h3>
                </div>

                <div className="form-group">
                  <label htmlFor="product-name">اسم المنتج</label>

                  <input
                    id="product-name"
                    type="text"
                    name="name"
                    placeholder="مثال: سماعات لاسلكية"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    maxLength={100}
                    autoComplete="off"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="product-category">التصنيف</label>

                    <select
                      id="product-category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    >
                      <option value="">اختر التصنيف</option>

                      {CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="product-condition">حالة المنتج</label>

                    <select
                      id="product-condition"
                      name="condition"
                      value={formData.condition}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    >
                      <option value="">اختر الحالة</option>

                      {CONDITIONS.map((condition) => (
                        <option key={condition} value={condition}>
                          {condition}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="product-description">وصف المنتج</label>

                  <textarea
                    id="product-description"
                    name="description"
                    placeholder="اكتب وصفًا واضحًا للمنتج..."
                    value={formData.description}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    maxLength={1000}
                  />
                </div>
              </div>
            </div>

            {/* SIDE */}

            <aside className="sell-form-side">
              <div className="sell-card">
                <div className="sell-card-title">
                  <CircleDollarSign size={19} aria-hidden="true" />

                  <h3>السعر والموقع</h3>
                </div>

                <div className="form-group">
                  <label htmlFor="product-price">السعر</label>

                  <div className="price-input">
                    <input
                      id="product-price"
                      type="number"
                      name="price"
                      min="1"
                      step="1"
                      inputMode="numeric"
                      placeholder="0"
                      value={formData.price}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />

                    <span>₪</span>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="product-location">
                    <MapPin size={14} aria-hidden="true" />
                    المنطقة
                  </label>

                  <select
                    id="product-location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  >
                    <option value="">اختر المنطقة</option>

                    {LOCATIONS.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* TIP */}

              <div className="sell-help-card">
                <PackageCheck size={22} aria-hidden="true" />

                <div>
                  <strong>نصيحة للبيع أسرع</strong>

                  <p>استخدم صورة واضحة، عنوان مختصر، ووصف دقيق لحالة المنتج.</p>
                </div>
              </div>

              <button
                type="submit"
                className="publish-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "جاري نشر المنتج..." : "نشر المنتج"}
              </button>
            </aside>
          </div>
        </form>
      </div>
    </main>
  );
}

export default SellProduct;
