import "./AllMessages.css";
import { defaultProducts } from "../data/products";
import { useNavigate } from "react-router-dom";
import { MessageCircle, ArrowRight, MapPin } from "lucide-react";

function AllMessages() {
  const navigate = useNavigate();

  const savedChats = JSON.parse(localStorage.getItem("benaMessages")) || {};
  const savedNotifications =
    JSON.parse(localStorage.getItem("benaNotifications")) || [];

  const savedProducts = JSON.parse(localStorage.getItem("benaProducts")) || [];

  const allProducts = [...savedProducts, ...defaultProducts];

  const conversations = Object.entries(savedChats)
    .map(([productId, messages]) => {
      const product = allProducts.find(
        (item) => Number(item.id) === Number(productId),
      );

      if (!product) return null;

      const lastMessage = messages[messages.length - 1];

      const unreadCount = savedNotifications.filter(
        (notification) =>
          notification.type === "message" &&
          !notification.read &&
          notification.link === `/messages/${productId}`,
      ).length;

      return {
        product,
        lastMessage,
        unreadCount,
      };
    })
    .filter(Boolean)
    .sort(
      (a, b) => Number(b.lastMessage?.id || 0) - Number(a.lastMessage?.id || 0),
    );

  return (
    <main className="all-messages-page" dir="rtl">
      <div className="all-messages-container">
        <button
          type="button"
          className="all-messages-back"
          onClick={() => navigate("/")}
        >
          <ArrowRight size={18} />
          العودة للرئيسية
        </button>

        <div className="all-messages-heading">
          <span>تواصل بسهولة</span>
          <h1>الرسائل</h1>
          <p>كل محادثاتك مع البائعين موجودة هنا.</p>
        </div>

        {conversations.length > 0 ? (
          <div className="conversations-list">
            {conversations.map(({ product, lastMessage, unreadCount }) => (
              <button
                type="button"
                key={product.id}
                className="conversation-card"
                onClick={() => navigate(`/messages/${product.id}`)}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="conversation-image"
                />

                <div className="conversation-info">
                  <div className="conversation-top">
                    <h3>{product.name}</h3>

                    <div className="conversation-top-left">
                      {unreadCount > 0 && (
                        <span className="conversation-unread-count">
                          {unreadCount}
                        </span>
                      )}

                      <strong>
                        {Number(product.price).toLocaleString()} ₪
                      </strong>
                    </div>
                  </div>

                  <div className="conversation-location">
                    <MapPin size={13} />
                    {product.location}
                  </div>

                  <p className="conversation-last-message">
                    {lastMessage?.type === "buyer" ? "أنت: " : "البائع: "}

                    {lastMessage?.text || "ابدأ المحادثة"}
                  </p>
                </div>

                <MessageCircle className="conversation-icon" size={22} />
              </button>
            ))}
          </div>
        ) : (
          <div className="messages-empty">
            <MessageCircle size={50} strokeWidth={1.4} />

            <h2>ما عندك محادثات لسه</h2>

            <p>لما تراسل بائع عن منتج، المحادثة رح تظهر هون.</p>

            <button type="button" onClick={() => navigate("/products")}>
              استكشف المنتجات
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default AllMessages;
