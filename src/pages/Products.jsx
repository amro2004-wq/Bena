import "./Products.css";
import { defaultProducts } from "../data/products";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Toast from "../components/Toast";

import {
  Search,
  MapPin,
  Heart,
  SlidersHorizontal,
  ArrowRight,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";

const categories = [
  "الكل",
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

function Products() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialSearch = searchParams.get("search") || "";

  const initialCategory = searchParams.get("category") || "الكل";

  const [savedProducts, setSavedProducts] = useState(() => {
    return JSON.parse(localStorage.getItem("benaProducts")) || [];
  });

  const products = [...savedProducts, ...defaultProducts];

  const [search, setSearch] = useState(initialSearch);

  const [category, setCategory] = useState(initialCategory);

  const [condition, setCondition] = useState("الكل");

  const [location, setLocation] = useState("الكل");

  const [sort, setSort] = useState("latest");

  const [favorites, setFavorites] = useState(() => {
    return JSON.parse(localStorage.getItem("benaFavorites")) || [];
  });

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
    setProductToDelete(product);
  };

  const closeDeleteModal = () => {
    setProductToDelete(null);
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    /* SEARCH */

    if (search.trim()) {
      const searchValue = search.trim().toLowerCase();

      result = result.filter((product) => {
        const name = product.name?.toLowerCase() || "";

        const description = product.description?.toLowerCase() || "";

        const productCategory = product.category?.toLowerCase() || "";

        return (
          name.includes(searchValue) ||
          description.includes(searchValue) ||
          productCategory.includes(searchValue)
        );
      });
    }

    /* CATEGORY */

    if (category !== "الكل") {
      result = result.filter((product) => product.category === category);
    }

    /* CONDITION */

    if (condition !== "الكل") {
      result = result.filter((product) => product.condition === condition);
    }

    /* LOCATION */

    if (location !== "الكل") {
      result = result.filter((product) => product.location === location);
    }

    /* SORT */

    if (sort === "latest") {
      result.sort((a, b) => Number(b.id) - Number(a.id));
    }

    if (sort === "low") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    }

    if (sort === "high") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    }

    return result;
  }, [products, search, category, condition, location, sort]);

  const isFavorite = (id) => {
    return favorites.some((item) => Number(item) === Number(id));
  };

  const toggleFavorite = (id) => {
    setFavorites((current) => {
      const exists = current.some((item) => Number(item) === Number(id));

      const updated = exists
        ? current.filter((item) => Number(item) !== Number(id))
        : [...current, id];

      localStorage.setItem("benaFavorites", JSON.stringify(updated));

      return updated;
    });
  };

  const deleteProduct = () => {
    if (!productToDelete) return;

    const productId = productToDelete.id;

    /* DELETE PRODUCT */

    const updatedProducts = savedProducts.filter(
      (item) => Number(item.id) !== Number(productId),
    );

    setSavedProducts(updatedProducts);

    localStorage.setItem("benaProducts", JSON.stringify(updatedProducts));

    /* DELETE FAVORITE */

    const updatedFavorites = favorites.filter(
      (id) => Number(id) !== Number(productId),
    );

    setFavorites(updatedFavorites);

    localStorage.setItem("benaFavorites", JSON.stringify(updatedFavorites));

    /* DELETE CHAT */

    const chats = JSON.parse(localStorage.getItem("benaMessages")) || {};

    delete chats[productId];

    localStorage.setItem("benaMessages", JSON.stringify(chats));

    /* DELETE NOTIFICATIONS */

    const notifications =
      JSON.parse(localStorage.getItem("benaNotifications")) || [];

    const updatedNotifications = notifications.filter(
      (notification) =>
        notification.link !== `/products/${productId}` &&
        notification.link !== `/messages/${productId}`,
    );

    localStorage.setItem(
      "benaNotifications",
      JSON.stringify(updatedNotifications),
    );

    closeDeleteModal();

    showToast("تم حذف المنتج بنجاح ✓", "success");
  };

  return (
    <main className="products-page" dir="rtl">
      <Toast show={toast.show} message={toast.message} type={toast.type} />

      <div className="products-page__container">
        <button
          type="button"
          className="products__back"
          onClick={() => navigate("/")}
        >
          <ArrowRight size={18} />

          <span>العودة للرئيسية</span>
        </button>

        <div className="products-page__heading">
          <div>
            <span>تسوّق بسهولة</span>

            <h1>كل المنتجات</h1>

            <p>اكتشف المنتجات المعروضة من مستخدمي بينا داخل قطاع غزة.</p>
          </div>

          <button
            type="button"
            className="products-sell-btn"
            onClick={() => navigate("/sell")}
          >
            بيع منتج
          </button>
        </div>

        {/* SEARCH */}

        <div className="products-search">
          <Search size={20} />

          <input
            type="text"
            placeholder="ابحث عن منتج..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* CATEGORIES */}

        <div className="products-categories">
          {categories.map((item) => (
            <button
              type="button"
              key={item}
              className={category === item ? "active" : ""}
              onClick={() => {
                setCategory(item);

                const params = new URLSearchParams();

                if (search.trim()) {
                  params.set("search", search.trim());
                }

                if (item !== "الكل") {
                  params.set("category", item);
                }

                const query = params.toString();

                navigate(query ? `/products?${query}` : "/products");
              }}
            >
              {item === "الكل" ? "كل التصنيفات" : item}
            </button>
          ))}
        </div>

        <div className="products-layout">
          {/* FILTERS */}

          <aside className="products-filters">
            <div className="filters-title">
              <SlidersHorizontal size={18} />

              <h3>تصفية النتائج</h3>
            </div>

            <div className="filter-group">
              <label>الحالة</label>

              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              >
                <option value="الكل">كل الحالات</option>

                <option value="جديد">جديد</option>

                <option value="ممتاز">ممتاز</option>

                <option value="مستخدم">مستخدم</option>
              </select>
            </div>

            <div className="filter-group">
              <label>الموقع</label>

              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="الكل">كل المناطق</option>

                <option value="غزة">غزة</option>

                <option value="شمال غزة">شمال غزة</option>

                <option value="دير البلح">دير البلح</option>

                <option value="خان يونس">خان يونس</option>

                <option value="رفح">رفح</option>
              </select>
            </div>

            <button
              type="button"
              className="reset-filters"
              onClick={() => {
                setSearch("");
                setCategory("الكل");
                setCondition("الكل");
                setLocation("الكل");
                setSort("latest");

                navigate("/products");
              }}
            >
              مسح الفلاتر
            </button>
          </aside>

          {/* RESULTS */}

          <section className="products-results">
            <div className="products-results__top">
              <p>
                <strong>{filteredProducts.length}</strong> منتجات
              </p>

              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="latest">الأحدث</option>

                <option value="low">السعر: الأقل أولاً</option>

                <option value="high">السعر: الأعلى أولاً</option>
              </select>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="all-products-grid">
                {filteredProducts.map((product) => (
                  <article
                    key={product.id}
                    className="all-product-card"
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    <div className="all-product-image">
                      <img src={product.image} alt={product.name} />

                      <button
                        type="button"
                        className={`all-product-heart ${
                          isFavorite(product.id) ? "active" : ""
                        }`}
                        aria-label="المفضلة"
                        onClick={(e) => {
                          e.stopPropagation();

                          toggleFavorite(product.id);
                        }}
                      >
                        <Heart
                          size={19}
                          fill={
                            isFavorite(product.id) ? "currentColor" : "none"
                          }
                        />
                      </button>

                      <span
                        className={`all-product-condition ${product.conditionClass}`}
                      >
                        {product.condition}
                      </span>
                    </div>

                    <div className="all-product-content">
                      <span className="all-product-category">
                        {product.category || "أخرى"}
                      </span>

                      <h3>{product.name}</h3>

                      <div className="all-product-location">
                        <MapPin size={13} />

                        {product.location}
                      </div>

                      <div className="all-product-price">
                        <strong>
                          {Number(product.price).toLocaleString()}
                        </strong>

                        <span>₪</span>
                      </div>

                      {savedProducts.some(
                        (item) => Number(item.id) === Number(product.id),
                      ) && (
                        <div className="all-product-manage">
                          <button
                            type="button"
                            className="all-product-edit"
                            onClick={(e) => {
                              e.stopPropagation();

                              navigate(`/edit-product/${product.id}`);
                            }}
                          >
                            تعديل
                          </button>

                          <button
                            type="button"
                            className="all-product-delete"
                            onClick={(e) => {
                              e.stopPropagation();

                              openDeleteModal(product);
                            }}
                          >
                            حذف
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="no-products">
                <Search size={35} />

                <h3>ما لقينا منتجات</h3>

                <p>جرّب تغيّر البحث أو الفلاتر.</p>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* DELETE MODAL */}

      {productToDelete && (
        <div className="delete-modal-overlay" onClick={closeDeleteModal}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="delete-modal-close"
              onClick={closeDeleteModal}
              aria-label="إغلاق"
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

export default Products;
