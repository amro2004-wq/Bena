import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Save } from "lucide-react";

import Toast from "../components/Toast";

import "./EditProduct.css";

function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();

  const savedProducts = JSON.parse(localStorage.getItem("benaProducts")) || [];

  const product = savedProducts.find((item) => Number(item.id) === Number(id));

  const [formData, setFormData] = useState(() => ({
    name: product?.name || "",
    price: product?.price || "",
    category: product?.category || "",
    condition: product?.condition || "",
    location: product?.location || "",
    description: product?.description || "",
    image: product?.image || "",
  }));

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (file.size > 1500000) {
      showToast("حجم الصورة كبير، اختار صورة أقل من 1.5MB", "error");

      e.target.value = "";

      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setFormData((current) => ({
        ...current,
        image: reader.result,
      }));
    };

    reader.readAsDataURL(file);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.price ||
      !formData.category ||
      !formData.condition ||
      !formData.location
    ) {
      showToast("يرجى تعبئة جميع الحقول المطلوبة", "error");

      return;
    }

    const updatedProducts = savedProducts.map((item) =>
      Number(item.id) === Number(id)
        ? {
            ...item,
            ...formData,
            name: formData.name.trim(),
            price: Number(formData.price),
            description: formData.description.trim(),
            conditionClass:
              formData.condition === "جديد"
                ? "new"
                : formData.condition === "ممتاز"
                  ? "excellent"
                  : "used",
          }
        : item,
    );

    localStorage.setItem("benaProducts", JSON.stringify(updatedProducts));

    showToast("تم تحديث المنتج بنجاح ✓", "success");

    setTimeout(() => {
      navigate("/my-products");
    }, 900);
  };

  if (!product) {
    return (
      <main className="edit-product-page" dir="rtl">
        <div className="edit-product-not-found">
          <h2>المنتج غير موجود</h2>

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
        >
          <ArrowRight size={18} />
          العودة لمنتجاتي
        </button>

        <div className="edit-product-heading">
          <span>إدارة منتجاتك</span>

          <h1>تعديل المنتج</h1>

          <p>عدّل معلومات المنتج واحفظ التغييرات.</p>
        </div>

        <form className="edit-product-form" onSubmit={handleSubmit}>
          <div className="edit-current-image">
            <img src={formData.image} alt={formData.name} />

            <div className="edit-image-info">
              <strong>صورة المنتج</strong>

              <span>تقدر تغيّر صورة المنتج من هنا.</span>

              <label className="change-image-button">
                تغيير الصورة
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleImageChange}
                  hidden
                />
              </label>
            </div>
          </div>

          <div className="edit-form-group">
            <label htmlFor="name">اسم المنتج</label>

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="اسم المنتج"
            />
          </div>

          <div className="edit-form-row">
            <div className="edit-form-group">
              <label htmlFor="price">السعر</label>

              <input
                id="price"
                name="price"
                type="number"
                min="1"
                value={formData.price}
                onChange={handleChange}
                placeholder="السعر"
              />
            </div>

            <div className="edit-form-group">
              <label htmlFor="location">الموقع</label>

              <select
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
              >
                <option value="">اختر الموقع</option>

                <option value="غزة">غزة</option>

                <option value="شمال غزة">شمال غزة</option>

                <option value="دير البلح">دير البلح</option>

                <option value="خان يونس">خان يونس</option>

                <option value="رفح">رفح</option>
              </select>
            </div>
          </div>

          <div className="edit-form-row">
            <div className="edit-form-group">
              <label htmlFor="category">التصنيف</label>

              <select
                id="category"
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

                <option value="عناية شخصية وتجميل">عناية شخصية وتجميل</option>

                <option value="أطفال ورضع">أطفال ورضع</option>

                <option value="ألعاب أطفال">ألعاب أطفال</option>

                <option value="كتب وقرطاسية">كتب وقرطاسية</option>

                <option value="رياضة ولياقة">رياضة ولياقة</option>

                <option value="سيارات وقطع غيار">سيارات وقطع غيار</option>

                <option value="دراجات">دراجات</option>

                <option value="أدوات ومعدات">أدوات ومعدات</option>

                <option value="مستلزمات منزلية">مستلزمات منزلية</option>

                <option value="حديقة وزراعة">حديقة وزراعة</option>

                <option value="حيوانات ومستلزماتها">حيوانات ومستلزماتها</option>

                <option value="مأكولات ومنتجات منزلية">
                  مأكولات ومنتجات منزلية
                </option>

                <option value="هوايات ومقتنيات">هوايات ومقتنيات</option>

                <option value="أخرى">أخرى</option>
              </select>
            </div>

            <div className="edit-form-group">
              <label htmlFor="condition">حالة المنتج</label>

              <select
                id="condition"
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

          <div className="edit-form-group">
            <label htmlFor="description">وصف المنتج</label>

            <textarea
              id="description"
              name="description"
              rows="5"
              value={formData.description}
              onChange={handleChange}
              placeholder="اكتب وصف المنتج..."
            />
          </div>

          <button type="submit" className="save-product-button">
            <Save size={17} />
            حفظ التعديلات
          </button>
        </form>
      </div>
    </main>
  );
}

export default EditProduct;
