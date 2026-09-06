import "./AllMessages.css";

import { defaultProducts } from "../data/products";

import { useNavigate } from "react-router-dom";

import { MessageCircle, ArrowRight, MapPin } from "lucide-react";

function AllMessages() {
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("benaCurrentUser"));

  const savedChats = JSON.parse(localStorage.getItem("benaMessages")) || {};

  const savedNotifications =
    JSON.parse(localStorage.getItem("benaNotifications")) || [];

  const savedProducts = JSON.parse(localStorage.getItem("benaProducts")) || [];

  const users = JSON.parse(localStorage.getItem("benaUsers")) || [];

  const allProducts = [...savedProducts, ...defaultProducts];

  const conversations = Object.values(savedChats)
    .filter((conversation) => {
      if (!conversation || Array.isArray(conversation)) {
        return false;
      }

      if (!currentUser) {
        return false;
      }

      const isBuyer = Number(conversation.buyerId) === Number(currentUser.id);

      const isSeller = Number(conversation.sellerId) === Number(currentUser.id);

      return isBuyer || isSeller;
    })
    .map((conversation) => {
      const product = allProducts.find(
        (item) => Number(item.id) === Number(conversation.productId),
      );

      if (!product) {
        return null;
      }

      const messages = Array.isArray(conversation.messages)
        ? conversation.messages
        : [];

      const lastMessage = messages[messages.length - 1];

      const isSeller = Number(conversation.sellerId) === Number(currentUser.id);

      const otherUserId = isSeller
        ? conversation.buyerId
        : conversation.sellerId;

      const otherUser = users.find(
        (user) => Number(user.id) === Number(otherUserId),
      );

      const conversationId =
        conversation.id || `${conversation.productId}_${conversation.buyerId}`;

      const unreadCount = savedNotifications.filter(
        (notification) =>
          notification.type === "message" &&
          !notification.read &&
          Number(notification.userId) === Number(currentUser.id) &&
          notification.conversationId === conversationId,
      ).length;

      return {
        conversation,
        conversationId,
        product,
        lastMessage,
        unreadCount,
        isSeller,
        otherUser,
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const aTime = a.conversation.updatedAt || a.lastMessage?.createdAt || "";

      const bTime = b.conversation.updatedAt || b.lastMessage?.createdAt || "";

      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });

  const openConversation = (conversation) => {
    navigate(
      `/messages/${conversation.productId}?buyer=${conversation.buyerId}`,
    );
  };

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

          <p>كل محادثاتك مع مستخدمي بينا موجودة هنا.</p>
        </div>

        {conversations.length > 0 ? (
          <div className="conversations-list">
            {conversations.map(
              ({
                conversation,
                conversationId,
                product,
                lastMessage,
                unreadCount,
                isSeller,
                otherUser,
              }) => {
                const lastMessageIsMine =
                  lastMessage &&
                  Number(lastMessage.senderId) === Number(currentUser.id);

                const otherUserName =
                  otherUser?.name ||
                  (isSeller
                    ? "مشتري على بينا"
                    : product.sellerName || "بائع على بينا");

                return (
                  <button
                    type="button"
                    key={conversationId}
                    className={`conversation-card ${
                      unreadCount > 0 ? "conversation-card--unread" : ""
                    }`}
                    onClick={() => openConversation(conversation)}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="conversation-image"
                    />

                    <div className="conversation-info">
                      <div className="conversation-top">
                        <div>
                          <h3>{product.name}</h3>

                          <span className="conversation-user-name">
                            {otherUserName}
                          </span>
                        </div>

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
                        {lastMessage ? (
                          <>
                            <span className="conversation-message-owner">
                              {lastMessageIsMine
                                ? "أنت: "
                                : `${otherUserName}: `}
                            </span>

                            {lastMessage.text}
                          </>
                        ) : (
                          "ابدأ المحادثة"
                        )}
                      </p>
                    </div>

                    <MessageCircle className="conversation-icon" size={22} />
                  </button>
                );
              },
            )}
          </div>
        ) : (
          <div className="messages-empty">
            <MessageCircle size={50} strokeWidth={1.4} />

            <h2>ما عندك محادثات لسه</h2>

            <p>لما تبدأ محادثة عن منتج، رح تظهر هون.</p>

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
