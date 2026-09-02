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

function Categories() {
  const navigate = useNavigate();

  const categories = [
    {
      title: "إلكترونيات",
      icon: <Headphones size={28} strokeWidth={1.8} />,
      color: "purple",
    },
    {
      title: "ملابس",
      icon: <Shirt size={28} strokeWidth={1.8} />,
      color: "orange",
    },
    {
      title: "أثاث",
      icon: <Sofa size={28} strokeWidth={1.8} />,
      color: "purple",
    },
    {
      title: "سيارات وقطع غيار",
      icon: <Car size={28} strokeWidth={1.8} />,
      color: "orange",
    },
    {
      title: "أطفال ورضع",
      icon: <Baby size={28} strokeWidth={1.8} />,
      color: "orange",
    },
    {
      title: "رياضة ولياقة",
      icon: <Dumbbell size={28} strokeWidth={1.8} />,
      color: "purple",
    },
    {
      title: "عناية شخصية وتجميل",
      icon: <SprayCan size={28} strokeWidth={1.8} />,
      color: "orange",
    },
    {
      title: "أخرى",
      icon: <Grid2X2 size={28} strokeWidth={1.8} />,
      color: "purple",
    },
  ];

  const handleCategoryClick = (title) => {
    navigate(`/products?category=${encodeURIComponent(title)}`);
  };

  return (
    <section id="categories" className="categories">
      <div className="categories__header">
        <h2>
          <span></span>
          التصنيفات
        </h2>

        <button type="button" onClick={() => navigate("/products")}>
          عرض كل التصنيفات
        </button>
      </div>

      <div className="categories__grid">
        {categories.map((category) => (
          <button
            type="button"
            className="category-card"
            key={category.title}
            onClick={() => handleCategoryClick(category.title)}
          >
            <div className={`category-icon ${category.color}`}>
              {category.icon}
            </div>

            <span>{category.title}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default Categories;
