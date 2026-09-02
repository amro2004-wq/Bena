import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, MapPin, Trash2, Eye, Pencil } from "lucide-react";
import "./MyProducts.css";

function MyProducts() {
  const navigate = useNavigate();

  const [products, setProducts] = useState(() => {
    return JSON.parse(localStorage.getItem("benaProducts")) || [];
  });
  const deleteProduct = (productId) => {
    const confirmDelete = window.confirm("هل أنت متأكد من حذف هذا المنتج؟");

    if (!confirmDelete) return;

    // 1. حذف المنتج
    const updatedProducts = products.filter(
      (product) => Number(product.id) !== Number(productId),
    );

    setProducts(updatedProducts);

    localStorage.setItem("benaProducts", JSON.stringify(updatedProducts));

    // 2. حذفه من المفضلة
    const favorites = JSON.parse(localStorage.getItem("benaFavorites")) || [];

    const updatedFavorites = favorites.filter(
      (id) => Number(id) !== Number(productId),
    );

    localStorage.setItem("benaFavorites", JSON.stringify(updatedFavorites));

    // 3. حذف محادثة المنتج
    const chats = JSON.parse(localStorage.getItem("benaMessages")) || {};

    delete chats[productId];

    localStorage.setItem("benaMessages", JSON.stringify(chats));

    // 4. حذف إشعارات المنتج
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
  };

  return (
    <main className="my-products-page" dir="rtl">
      <div className="my-products-container">
        <button
          type="button"
          className="my-products-back"
          onClick={() => navigate("/")}
        >
          <ArrowRight size={18} />
          العودة للرئيسية
        </button>

        <div className="my-products-heading">
          <span>إدارة منتجاتك</span>
          <h1>منتجاتي</h1>
          <p>كل المنتجات اللي نشرتها على بينا موجودة هون.</p>
        </div>

        {products.length > 0 ? (
          <div className="my-products-grid">
            {products.map((product) => (
              <div className="my-product-card" key={product.id}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="my-product-image"
                />

                <div className="my-product-content">
                  <div className="my-product-top">
                    <span>{product.condition}</span>

                    <strong>{Number(product.price).toLocaleString()} ₪</strong>
                  </div>

                  <h3>{product.name}</h3>

                  <div className="my-product-location">
                    <MapPin size={14} />
                    {product.location}
                  </div>

                  <div className="my-product-actions">
                    <button
                      type="button"
                      className="view-product-button"
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      <Eye size={16} />
                      عرض المنتج
                    </button>
                    <button
                      type="button"
                      className="edit-product-button"
                      onClick={() => navigate(`/edit-product/${product.id}`)}
                    >
                      <Pencil size={16} />
                      تعديل
                    </button>

                    <button
                      type="button"
                      className="delete-product-button"
                      onClick={() => deleteProduct(product.id)}
                    >
                      <Trash2 size={16} />
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
    </main>
  );
}

export default MyProducts;
