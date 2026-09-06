import "./SellProduct.css";

import { useState } from "react";
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

function SellProduct() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("benaCurrentUser"));
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    condition: "",
    price: "",
    location: "",
    description: "",
  });

  const [imagePreview, setImagePreview] = useState("");

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (file.size > 1500000) {
      showToast("حجم الصورة كبير، اختار صورة أقل من 1.5MB", "error");

      e.target.value = "";

      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setImagePreview(reader.result);
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { name, category, condition, price, location, description } =
      formData;

    if (
      !name.trim() ||
      !category ||
      !condition ||
      !price ||
      !location ||
      !description.trim() ||
      !imagePreview
    ) {
      showToast("يرجى تعبئة جميع الحقول وإضافة صورة للمنتج", "error");

      return;
    }

    const savedProducts =
      JSON.parse(localStorage.getItem("benaProducts")) || [];

    const newProduct = {
      id: Date.now(),

      sellerId: currentUser.id,
      sellerName: currentUser.name,

      name: name.trim(),
      category,
      condition,

      conditionClass:
        condition === "جديد"
          ? "new"
          : condition === "ممتاز"
            ? "excellent"
            : "used",

      price: Number(price),
      location,
      description: description.trim(),
      image: imagePreview,

      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(
      "benaProducts",
      JSON.stringify([newProduct, ...savedProducts]),
    );

    const savedNotifications =
      JSON.parse(localStorage.getItem("benaNotifications")) || [];

    const newNotification = {
      id: Date.now() + 1,

      userId: Number(currentUser.id),

      type: "product",

      title: "تم نشر المنتج",

      text: `تم نشر منتج "${newProduct.name}" بنجاح على بينا.`,

      createdAt: new Date().toISOString(),

      read: false,

      link: `/products/${newProduct.id}`,
    };

    localStorage.setItem(
      "benaNotifications",
      JSON.stringify([newNotification, ...savedNotifications]),
    );

    showToast("تم نشر المنتج بنجاح ✓", "success");

    setTimeout(() => {
      navigate("/products");
    }, 900);
  };

  return (
    <main className="sell-page" dir="rtl">
      <Toast show={toast.show} message={toast.message} type={toast.type} />

      <div className="sell-container">
        <button
          type="button"
          className="sell-back"
          onClick={() => navigate(-1)}
        >
          <ArrowRight size={18} />
          العودة
        </button>

        <div className="sell-heading">
          <span>ابدأ البيع على بينا</span>

          <h1>أضف منتجك</h1>

          <p>أضف معلومات واضحة وصورة جيدة حتى يظهر منتجك بشكل أفضل للمشترين.</p>
        </div>

        <form className="sell-form" onSubmit={handleSubmit}>
          <div className="sell-form-grid">
            <div className="sell-form-main">
              <div className="sell-card">
                <div className="sell-card-title">
                  <ImagePlus size={19} />
                  <h3>صورة المنتج</h3>
                </div>

                <label className="image-upload">
                  {imagePreview ? (
                    <img src={imagePreview} alt="معاينة المنتج" />
                  ) : (
                    <div className="image-upload-placeholder">
                      <Upload size={30} />

                      <strong>اضغط لإضافة صورة</strong>

                      <span>PNG أو JPG - بحد أقصى 1.5MB</span>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleImage}
                  />
                </label>
              </div>

              <div className="sell-card">
                <div className="sell-card-title">
                  <Tag size={19} />
                  <h3>معلومات المنتج</h3>
                </div>

                <div className="form-group">
                  <label>اسم المنتج</label>

                  <input
                    type="text"
                    name="name"
                    placeholder="مثال: سماعات لاسلكية"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>التصنيف</label>

                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value="">اختر التصنيف</option>

                      <option value="إلكترونيات">إلكترونيات</option>

                      <option value="موبايلات">موبايلات</option>

                      <option value="كمبيوتر ولابتوب">كمبيوتر ولابتوب</option>

                      <option value="ألعاب وإكسسوارات">ألعاب وإكسسوارات</option>

                      <option value="أجهزة منزلية">أجهزة منزلية</option>

                      <option value="أثاث">أثاث</option>

                      <option value="ملابس">ملابس</option>

                      <option value="أحذية">أحذية</option>

                      <option value="حقائب وإكسسوارات">حقائب وإكسسوارات</option>

                      <option value="ساعات ومجوهرات">ساعات ومجوهرات</option>

                      <option value="عناية شخصية وتجميل">
                        عناية شخصية وتجميل
                      </option>

                      <option value="أطفال ورضع">أطفال ورضع</option>

                      <option value="ألعاب أطفال">ألعاب أطفال</option>

                      <option value="كتب وقرطاسية">كتب وقرطاسية</option>

                      <option value="رياضة ولياقة">رياضة ولياقة</option>

                      <option value="سيارات وقطع غيار">سيارات وقطع غيار</option>

                      <option value="دراجات">دراجات</option>

                      <option value="أدوات ومعدات">أدوات ومعدات</option>

                      <option value="مستلزمات منزلية">مستلزمات منزلية</option>

                      <option value="حديقة وزراعة">حديقة وزراعة</option>

                      <option value="حيوانات ومستلزماتها">
                        حيوانات ومستلزماتها
                      </option>

                      <option value="مأكولات ومنتجات منزلية">
                        مأكولات ومنتجات منزلية
                      </option>

                      <option value="هوايات ومقتنيات">هوايات ومقتنيات</option>

                      <option value="أخرى">أخرى</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>حالة المنتج</label>

                    <select
                      name="condition"
                      value={formData.condition}
                      onChange={handleChange}
                    >
                      <option value="">اختر الحالة</option>

                      <option value="جديد">جديد</option>

                      <option value="ممتاز">ممتاز</option>

                      <option value="مستخدم">مستخدم</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>وصف المنتج</label>

                  <textarea
                    name="description"
                    placeholder="اكتب وصفًا واضحًا للمنتج..."
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <aside className="sell-form-side">
              <div className="sell-card">
                <div className="sell-card-title">
                  <CircleDollarSign size={19} />
                  <h3>السعر والموقع</h3>
                </div>

                <div className="form-group">
                  <label>السعر</label>

                  <div className="price-input">
                    <input
                      type="number"
                      name="price"
                      min="1"
                      placeholder="0"
                      value={formData.price}
                      onChange={handleChange}
                    />

                    <span>₪</span>
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    <MapPin size={14} />
                    المنطقة
                  </label>

                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                  >
                    <option value="">اختر المنطقة</option>

                    <option value="غزة">غزة</option>

                    <option value="شمال غزة">شمال غزة</option>

                    <option value="دير البلح">دير البلح</option>

                    <option value="خان يونس">خان يونس</option>

                    <option value="رفح">رفح</option>
                  </select>
                </div>
              </div>

              <div className="sell-help-card">
                <PackageCheck size={22} />

                <div>
                  <strong>نصيحة للبيع أسرع</strong>

                  <p>استخدم صورة واضحة، عنوان مختصر، ووصف دقيق لحالة المنتج.</p>
                </div>
              </div>

              <button type="submit" className="publish-btn">
                نشر المنتج
              </button>
            </aside>
          </div>
        </form>
      </div>
    </main>
  );
}

export default SellProduct;
