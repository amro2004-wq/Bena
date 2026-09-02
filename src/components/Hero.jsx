import "./Hero.css";
import heroImage from "../assets/hero-bena.png";

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Search, MapPin, ChevronDown, Plus } from "lucide-react";

function Hero() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("الكل");
  const [showCategories, setShowCategories] = useState(false);

  const categoryRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setShowCategories(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (search.trim()) {
      params.set("search", search.trim());
    }

    if (category !== "الكل") {
      params.set("category", category);
    }

    const query = params.toString();

    navigate(query ? `/products?${query}` : "/products");
  };

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

  const handleCategorySelect = (item) => {
    setCategory(item);
    setShowCategories(false);

    const params = new URLSearchParams();

    if (search.trim()) {
      params.set("search", search.trim());
    }

    if (item !== "الكل") {
      params.set("category", item);
    }

    const query = params.toString();

    navigate(query ? `/products?${query}` : "/products");
  };

  return (
    <section className="hero">
      <div className="hero__content">
        <h1 className="hero__title">
          كل اللي بدك إياه
          <br />
          موجود <span>بينا</span>
          <b>.</b>
        </h1>

        <div className="hero__subtitle">
          <p>بيع واشتري بسهولة وأمان</p>

          <div className="hero__location">
            <MapPin size={17} />
            <span>داخل قطاع غزة</span>
          </div>
        </div>

        <div className="hero__search">
          <button
            type="button"
            className="hero__search-btn"
            onClick={handleSearch}
          >
            <Search size={22} />
          </button>

          <input
            type="text"
            placeholder="إبحث عن أي شيء..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />

          <div className="hero__category-wrapper" ref={categoryRef}>
            <button
              type="button"
              className="hero__category-btn"
              onClick={() => setShowCategories((current) => !current)}
            >
              <ChevronDown size={16} />

              <span>{category === "الكل" ? "كل التصنيفات" : category}</span>
            </button>

            {showCategories && (
              <div className="hero__category-menu">
                {categories.map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => handleCategorySelect(item)}
                  >
                    {item === "الكل" ? "كل التصنيفات" : item}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="hero__actions">
          <button
            type="button"
            className="hero__sell-btn"
            onClick={() => navigate("/sell")}
          >
            <Plus size={18} />
            <span>بيع منتج الآن</span>
          </button>
        </div>
      </div>

      <div className="hero__visual">
        <img src={heroImage} alt="منتجات بينا" />
      </div>
    </section>
  );
}

export default Hero;
