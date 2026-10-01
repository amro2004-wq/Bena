import "./Hero.css";
import heroImage from "../assets/hero-bena.png";

import { useEffect, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import { Search, MapPin, ChevronDown, Plus } from "lucide-react";

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

function Hero() {
  const navigate = useNavigate();

  const categoryRef = useRef(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("الكل");

  const [showCategories, setShowCategories] = useState(false);

  /* CLOSE CATEGORY */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setShowCategories(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowCategories(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);

      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  /* BUILD SEARCH */

  const goToProducts = (selectedCategory = category) => {
    const params = new URLSearchParams();

    const searchValue = search.trim();

    if (searchValue) {
      params.set("search", searchValue);
    }

    if (selectedCategory && selectedCategory !== "الكل") {
      params.set("category", selectedCategory);
    }

    const query = params.toString();

    navigate(query ? `/products?${query}` : "/products");
  };

  /* SEARCH */

  const handleSearch = () => {
    setShowCategories(false);

    goToProducts();
  };

  /* CATEGORY */

  const handleCategorySelect = (item) => {
    setCategory(item);
    setShowCategories(false);

    goToProducts(item);
  };

  /* SELL */

  const handleSell = () => {
    navigate("/sell");
  };

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__content">
        {/* TITLE */}

        <h1 id="hero-title" className="hero__title">
          كل اللي بدك إياه
          <br />
          موجود <span>بينا</span>
          <b>.</b>
        </h1>

        {/* SUBTITLE */}

        <div className="hero__subtitle">
          <p>بيع واشتري بسهولة وأمان</p>

          <div className="hero__location">
            <MapPin size={17} aria-hidden="true" />

            <span>داخل قطاع غزة</span>
          </div>
        </div>

        {/* SEARCH */}

        <div className="hero__search" role="search">
          <button
            type="button"
            className="hero__search-btn"
            aria-label="بحث"
            onClick={handleSearch}
          >
            <Search size={22} aria-hidden="true" />
          </button>

          <input
            type="search"
            placeholder="إبحث عن أي شيء..."
            aria-label="البحث عن منتج"
            value={search}
            maxLength={100}
            autoComplete="off"
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSearch();
              }
            }}
          />

          {/* CATEGORY */}

          <div className="hero__category-wrapper" ref={categoryRef}>
            <button
              type="button"
              className={`hero__category-btn ${showCategories ? "active" : ""}`}
              aria-haspopup="listbox"
              aria-expanded={showCategories}
              onClick={() => setShowCategories((current) => !current)}
            >
              <ChevronDown size={16} aria-hidden="true" />

              <span>{category === "الكل" ? "كل التصنيفات" : category}</span>
            </button>

            {showCategories && (
              <div
                className="hero__category-menu"
                role="listbox"
                aria-label="التصنيفات"
              >
                {categories.map((item) => (
                  <button
                    type="button"
                    role="option"
                    aria-selected={category === item}
                    className={category === item ? "selected" : ""}
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

        {/* ACTIONS */}

        <div className="hero__actions">
          <button type="button" className="hero__sell-btn" onClick={handleSell}>
            <Plus size={18} aria-hidden="true" />

            <span>بيع منتج الآن</span>
          </button>
        </div>
      </div>

      {/* VISUAL */}

      <div className="hero__visual" aria-hidden="true">
        <img src={heroImage} alt="" loading="eager" fetchPriority="high" />
      </div>
    </section>
  );
}

export default Hero;
