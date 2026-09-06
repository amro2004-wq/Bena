import "./Messages.css";

import { defaultProducts } from "../data/products";

import { useEffect, useRef, useState } from "react";

import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { ArrowRight, Send, UserRound, ShieldCheck, MapPin } from "lucide-react";

function Messages() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const messagesEndRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("benaCurrentUser"));

  const savedProducts = JSON.parse(localStorage.getItem("benaProducts")) || [];

  const products = [...savedProducts, ...defaultProducts];

  const product = products.find((item) => Number(item.id) === Number(id));

  const users = JSON.parse(localStorage.getItem("benaUsers")) || [];

  const sellerId = product?.sellerId ? Number(product.sellerId) : null;

  const isSeller =
    currentUser && sellerId && Number(currentUser.id) === sellerId;

  const buyerFromUrl = searchParams.get("buyer");

  const buyerId = isSeller
    ? buyerFromUrl
      ? Number(buyerFromUrl)
      : null
    : currentUser
      ? Number(currentUser.id)
      : null;

  const conversationId = product && buyerId ? `${product.id}_${buyerId}` : null;

  const buyer = users.find((user) => Number(user.id) === Number(buyerId));

  const seller = users.find((user) => Number(user.id) === Number(sellerId));

  const otherUser = isSeller ? buyer : seller;

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([]);

  /* LOAD CHAT */

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);

      return;
    }

    const savedChats = JSON.parse(localStorage.getItem("benaMessages")) || {};

    const conversation = savedChats[conversationId];

    if (conversation && Array.isArray(conversation.messages)) {
      setMessages(conversation.messages);
    } else {
      setMessages([]);
    }
  }, [conversationId]);

  /* READ NOTIFICATIONS */

  useEffect(() => {
    if (!currentUser || !conversationId) {
      return;
    }

    const savedNotifications =
      JSON.parse(localStorage.getItem("benaNotifications")) || [];

    const updatedNotifications = savedNotifications.map((notification) => {
      const belongsToUser =
        !notification.userId ||
        Number(notification.userId) === Number(currentUser.id);

      const sameConversation =
        notification.conversationId === conversationId ||
        notification.link === `/messages/${id}?buyer=${buyerId}` ||
        notification.link === `/messages/${id}`;

      if (belongsToUser && sameConversation) {
        return {
          ...notification,
          read: true,
        };
      }

      return notification;
    });

    localStorage.setItem(
      "benaNotifications",
      JSON.stringify(updatedNotifications),
    );
  }, [id, buyerId, conversationId, currentUser?.id]);

  /* AUTO SCROLL */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  /* SEND MESSAGE */

  const sendMessage = (e) => {
    e.preventDefault();

    if (!currentUser || !product || !conversationId) {
      return;
    }

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    const newMessage = {
      id: Date.now(),

      text: trimmedMessage,

      senderId: Number(currentUser.id),

      createdAt: new Date().toISOString(),
    };

    const updatedMessages = [...messages, newMessage];

    setMessages(updatedMessages);

    const savedChats = JSON.parse(localStorage.getItem("benaMessages")) || {};

    const conversation = {
      id: conversationId,

      productId: Number(product.id),

      sellerId,

      buyerId,

      messages: updatedMessages,

      updatedAt: new Date().toISOString(),
    };

    savedChats[conversationId] = conversation;

    localStorage.setItem("benaMessages", JSON.stringify(savedChats));

    /* NOTIFICATION */

    const receiverId = isSeller ? buyerId : sellerId;

    if (receiverId) {
      const notifications =
        JSON.parse(localStorage.getItem("benaNotifications")) || [];

      const notification = {
        id: Date.now(),

        userId: Number(receiverId),

        conversationId,

        type: "message",

        title: "رسالة جديدة",

        message: `رسالة جديدة بخصوص ${product.name}`,

        link: `/messages/${product.id}?buyer=${buyerId}`,

        read: false,

        createdAt: new Date().toISOString(),
      };

      localStorage.setItem(
        "benaNotifications",
        JSON.stringify([notification, ...notifications]),
      );
    }

    setMessage("");
  };

  if (!product) {
    return (
      <div className="messages-not-found" dir="rtl">
        <h2>المنتج غير موجود</h2>

        <button type="button" onClick={() => navigate("/products")}>
          العودة للمنتجات
        </button>
      </div>
    );
  }

  if (isSeller && !buyerId) {
    return (
      <div className="messages-not-found" dir="rtl">
        <h2>اختر محادثة</h2>

        <p>اختر أحد المشترين من صفحة الرسائل لفتح المحادثة.</p>

        <button type="button" onClick={() => navigate("/messages")}>
          عرض الرسائل
        </button>
      </div>
    );
  }

  return (
    <main className="messages-page" dir="rtl">
      <div className="messages-container">
        <button
          type="button"
          className="messages-back"
          onClick={() => navigate(-1)}
        >
          <ArrowRight size={18} />
          العودة
        </button>

        <div className="chat-card">
          {/* HEADER */}

          <div className="chat-header">
            <div className="seller-profile">
              <div className="chat-avatar">
                <UserRound size={24} />
              </div>

              <div>
                <h3>
                  {otherUser?.name ||
                    (isSeller
                      ? "مشتري على بينا"
                      : product.sellerName || "بائع على بينا")}
                </h3>

                <span>
                  <ShieldCheck size={13} />
                  حساب على منصة بينا
                </span>
              </div>
            </div>

            <div className="chat-product">
              <img src={product.image} alt={product.name} />

              <div>
                <strong>{product.name}</strong>

                <span className="chat-product-price">
                  {Number(product.price).toLocaleString()} ₪
                </span>

                <small>
                  <MapPin size={12} />

                  {product.location}
                </small>
              </div>
            </div>
          </div>

          {/* MESSAGES */}

          <div className="chat-messages">
            {messages.length > 0 ? (
              messages.map((item) => {
                const isMine = Number(item.senderId) === Number(currentUser.id);

                return (
                  <div
                    key={item.id}
                    className={`chat-message ${
                      isMine ? "chat-message--buyer" : "chat-message--seller"
                    }`}
                  >
                    {item.text}
                  </div>
                );
              })
            ) : (
              <div className="chat-empty">ابدأ المحادثة حول هذا المنتج.</div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* SEND */}

          <form className="chat-input-area" onSubmit={sendMessage}>
            <input
              type="text"
              placeholder="اكتب رسالتك..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <button type="submit" disabled={!message.trim()}>
              <Send size={18} />
              إرسال
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default Messages;
