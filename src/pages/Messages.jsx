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

  /* USER */

  const currentUser = JSON.parse(localStorage.getItem("benaCurrentUser"));

  /* PRODUCTS */

  const savedProducts = JSON.parse(localStorage.getItem("benaProducts")) || [];

  const products = [...savedProducts, ...defaultProducts];

  const product = products.find((item) => Number(item.id) === Number(id));

  /* USERS */

  const users = JSON.parse(localStorage.getItem("benaUsers")) || [];

  /* SELLER */

  const sellerId = product?.sellerId ? Number(product.sellerId) : null;

  const seller = users.find((user) => Number(user.id) === Number(sellerId));

  const isSeller =
    currentUser && sellerId && Number(currentUser.id) === Number(sellerId);

  /* BUYER */

  const buyerFromUrl = searchParams.get("buyer");

  const buyerId = isSeller
    ? buyerFromUrl
      ? Number(buyerFromUrl)
      : null
    : currentUser
      ? Number(currentUser.id)
      : null;

  const buyer = users.find((user) => Number(user.id) === Number(buyerId));

  /* CONVERSATION */

  const conversationId = product && buyerId ? `${product.id}_${buyerId}` : null;

  const savedChats = JSON.parse(localStorage.getItem("benaMessages")) || {};

  const existingConversation = conversationId
    ? savedChats[conversationId]
    : null;

  /* OTHER USER */

  const otherUser = isSeller ? buyer : seller;

  /* STATE */

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([]);

  /* LOAD CHAT */

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);

      return;
    }

    const chats = JSON.parse(localStorage.getItem("benaMessages")) || {};

    const conversation = chats[conversationId];

    if (
      conversation &&
      !Array.isArray(conversation) &&
      Array.isArray(conversation.messages)
    ) {
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

    let changed = false;

    const updatedNotifications = savedNotifications.map((notification) => {
      const belongsToUser =
        Number(notification.userId) === Number(currentUser.id);

      const sameConversation = notification.conversationId === conversationId;

      if (belongsToUser && sameConversation && !notification.read) {
        changed = true;

        return {
          ...notification,
          read: true,
        };
      }

      return notification;
    });

    if (changed) {
      localStorage.setItem(
        "benaNotifications",
        JSON.stringify(updatedNotifications),
      );
    }
  }, [conversationId, currentUser?.id]);

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

    if (!sellerId || !buyerId) {
      return;
    }

    const currentUserId = Number(currentUser.id);

    const userIsSeller = currentUserId === Number(sellerId);

    const userIsBuyer = currentUserId === Number(buyerId);

    if (!userIsSeller && !userIsBuyer) {
      return;
    }

    /* VALIDATE BUYER */

    if (!buyer) {
      return;
    }

    /* VALIDATE SELLER */

    if (!seller) {
      return;
    }

    /*
      Seller can only reply to an
      already existing conversation.
    */

    if (isSeller && !existingConversation) {
      return;
    }

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    const now = new Date().toISOString();

    const newMessage = {
      id: Date.now(),

      text: trimmedMessage,

      senderId: Number(currentUser.id),

      createdAt: now,
    };

    const updatedMessages = [...messages, newMessage];

    setMessages(updatedMessages);

    const chats = JSON.parse(localStorage.getItem("benaMessages")) || {};

    const conversation = {
      id: conversationId,

      productId: Number(product.id),

      sellerId: Number(sellerId),

      buyerId: Number(buyerId),

      messages: updatedMessages,

      updatedAt: now,
    };

    chats[conversationId] = conversation;

    localStorage.setItem("benaMessages", JSON.stringify(chats));

    /* NOTIFICATION */

    const receiverId = isSeller ? Number(buyerId) : Number(sellerId);

    if (receiverId && receiverId !== Number(currentUser.id)) {
      const notifications =
        JSON.parse(localStorage.getItem("benaNotifications")) || [];

      const notification = {
        id: Date.now() + 1,

        userId: receiverId,

        conversationId,

        type: "message",

        title: "رسالة جديدة",

        message: `رسالة جديدة بخصوص ${product.name}`,

        link: `/messages/${product.id}?buyer=${buyerId}`,

        read: false,

        createdAt: now,
      };

      localStorage.setItem(
        "benaNotifications",
        JSON.stringify([notification, ...notifications]),
      );
    }

    setMessage("");
  };

  /* PRODUCT NOT FOUND */

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

  /* DEMO PRODUCT */

  if (!sellerId) {
    return (
      <div className="messages-not-found" dir="rtl">
        <h2>لا يمكن بدء المحادثة</h2>

        <p>لا يوجد بائع مرتبط بهذا المنتج حاليًا.</p>

        <button
          type="button"
          onClick={() => navigate(`/products/${product.id}`)}
        >
          العودة للمنتج
        </button>
      </div>
    );
  }

  /* SELLER NOT FOUND */

  if (!seller) {
    return (
      <div className="messages-not-found" dir="rtl">
        <h2>حساب البائع غير موجود</h2>

        <p>لا يمكن فتح هذه المحادثة حاليًا.</p>

        <button type="button" onClick={() => navigate("/messages")}>
          العودة للرسائل
        </button>
      </div>
    );
  }

  /* SELECT CONVERSATION */

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

  /* INVALID BUYER */

  if (!buyer) {
    return (
      <div className="messages-not-found" dir="rtl">
        <h2>المحادثة غير موجودة</h2>

        <p>المستخدم المرتبط بهذه المحادثة غير موجود.</p>

        <button type="button" onClick={() => navigate("/messages")}>
          العودة للرسائل
        </button>
      </div>
    );
  }

  /* SELLER INVALID CONVERSATION */

  if (isSeller && !existingConversation) {
    return (
      <div className="messages-not-found" dir="rtl">
        <h2>المحادثة غير موجودة</h2>

        <p>لا توجد محادثة سابقة مع هذا المستخدم حول المنتج.</p>

        <button type="button" onClick={() => navigate("/messages")}>
          العودة للرسائل
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
                    (isSeller ? "مشتري على بينا" : "بائع على بينا")}
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
