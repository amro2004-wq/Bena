import "./Categories.css";

import { useNavigate } from "react-router-dom";

import {
  Headphones,
  Shirt,
  Sofa,
  Car,
  Baby,
  Dumbbell,
  SprayCan,
  Grid2X2,
} from "lucide-react";

const categories = [
  {
    title: "إلكترونيات",
    icon: Headphones,
    color: "purple",
  },
  {
    title: "ملابس",
    icon: Shirt,
    color: "orange",
  },
  {
    title: "أثاث",
    icon: Sofa,
    color: "purple",
  },
  {
    title: "سيارات وقطع غيار",
    icon: Car,
    color: "orange",
  },
  {
    title: "أطفال ورضع",
    icon: Baby,
    color: "orange",
  },
  {
    title: "رياضة ولياقة",
    icon: Dumbbell,
    color: "purple",
  },
  {
    title: "عناية شخصية وتجميل",
    icon: SprayCan,
    color: "orange",
  },
  {
    title: "أخرى",
    icon: Grid2X2,
    color: "purple",
  },
];

function Categories() {
  const navigate = useNavigate();

  /* CATEGORY */

  const handleCategoryClick = (title) => {
    const params = new URLSearchParams();

    params.set("category", title);

    navigate(`/products?${params.toString()}`);
  };

  /* ALL CATEGORIES */

  const handleShowAll = () => {
    navigate("/products");
  };

  return (
    <section
      id="categories"
      className="categories"
      aria-labelledby="categories-title"
    >
      {/* HEADER */}

      <div className="categories__header">
        <h2 id="categories-title">
          <span aria-hidden="true" />
          التصنيفات
        </h2>

        <button type="button" onClick={handleShowAll}>
          عرض كل التصنيفات
        </button>
      </div>

      {/* GRID */}

      <div className="categories__grid">
        {categories.map((category) => {
          const Icon = category.icon;

          return (
            <button
              type="button"
              className="category-card"
              key={category.title}
              aria-label={`عرض منتجات ${category.title}`}
              onClick={() => handleCategoryClick(category.title)}
            >
              <div
                className={`category-icon ${category.color}`}
                aria-hidden="true"
              >
                <Icon size={28} strokeWidth={1.8} />
              </div>

              <span>{category.title}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default Categories;
