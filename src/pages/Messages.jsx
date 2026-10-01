import "./Messages.css";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import {
  ArrowRight,
  Send,
  UserRound,
  ShieldCheck,
  MapPin,
  ImageOff,
  MessageCircle,
  Clock3,
} from "lucide-react";

import { defaultProducts } from "../data/products";

function Messages() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const messagesEndRef = useRef(null);

  /* STORAGE */

  const readStorage = useCallback((key, fallback) => {
    try {
      const value = localStorage.getItem(key);

      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }, []);

  /* USER */

  const getCurrentUser = useCallback(() => {
    const user = readStorage("benaCurrentUser", null);

    if (!user || typeof user !== "object" || Array.isArray(user)) {
      return null;
    }

    return user;
  }, [readStorage]);

  const [currentUser, setCurrentUser] = useState(getCurrentUser);

  const currentUserId =
    currentUser?.id !== undefined && currentUser?.id !== null
      ? String(currentUser.id)
      : null;

  /* PRODUCTS */

  const getProducts = useCallback(() => {
    const saved = readStorage("benaProducts", []);

    const savedProducts = Array.isArray(saved) ? saved : [];

    return [...savedProducts, ...defaultProducts];
  }, [readStorage]);

  const [products, setProducts] = useState(getProducts);

  const product = useMemo(() => {
    return (
      products.find((item) => item && String(item.id) === String(id)) || null
    );
  }, [products, id]);

  /* USERS */

  const getUsers = useCallback(() => {
    const savedUsers = readStorage("benaUsers", []);

    return Array.isArray(savedUsers) ? savedUsers : [];
  }, [readStorage]);

  const [users, setUsers] = useState(getUsers);

  /* SELLER */

  const sellerId =
    product?.sellerId !== undefined && product?.sellerId !== null
      ? String(product.sellerId)
      : null;

  const seller = useMemo(() => {
    if (!sellerId) {
      return null;
    }

    return users.find((user) => user && String(user.id) === sellerId) || null;
  }, [users, sellerId]);

  const isSeller =
    Boolean(currentUserId) && Boolean(sellerId) && currentUserId === sellerId;

  /* BUYER */

  const buyerFromUrl = searchParams.get("buyer");

  const buyerId = isSeller
    ? buyerFromUrl
      ? String(buyerFromUrl)
      : null
    : currentUserId;

  const buyer = useMemo(() => {
    if (!buyerId) {
      return null;
    }

    return (
      users.find((user) => user && String(user.id) === String(buyerId)) || null
    );
  }, [users, buyerId]);

  /* CONVERSATION */

  const conversationId = product && buyerId ? `${product.id}_${buyerId}` : null;

  const getChats = useCallback(() => {
    const chats = readStorage("benaMessages", {});

    if (!chats || typeof chats !== "object" || Array.isArray(chats)) {
      return {};
    }

    return chats;
  }, [readStorage]);

  const getConversation = useCallback(
    (targetConversationId) => {
      if (!targetConversationId) {
        return null;
      }

      const chats = getChats();

      const targetConversation = chats[targetConversationId];

      if (
        !targetConversation ||
        typeof targetConversation !== "object" ||
        Array.isArray(targetConversation)
      ) {
        return null;
      }

      return targetConversation;
    },
    [getChats],
  );

  const [conversation, setConversation] = useState(() =>
    getConversation(conversationId),
  );

  /* OTHER USER */

  const otherUser = isSeller ? buyer : seller;

  const otherUserName =
    otherUser?.name || (isSeller ? "مشتري على بينا" : "بائع على بينا");

  /* MESSAGE STATE */

  const [message, setMessage] = useState("");

  const messages = useMemo(() => {
    if (conversation && Array.isArray(conversation.messages)) {
      return conversation.messages;
    }

    return [];
  }, [conversation]);

  /* REFRESH */

  const refreshData = useCallback(() => {
    setCurrentUser(getCurrentUser());

    setProducts(getProducts());

    setUsers(getUsers());

    setConversation(getConversation(conversationId));
  }, [getCurrentUser, getProducts, getUsers, getConversation, conversationId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  /* EVENTS */

  useEffect(() => {
    const handleStorage = (event) => {
      if (
        !event.key ||
        event.key === "benaMessages" ||
        event.key === "benaProducts" ||
        event.key === "benaUsers" ||
        event.key === "benaCurrentUser"
      ) {
        refreshData();
      }
    };

    const handleMessagesUpdated = () => {
      refreshData();
    };

    const handleProductsUpdated = () => {
      refreshData();
    };

    const handleUsersUpdated = () => {
      refreshData();
    };

    window.addEventListener("storage", handleStorage);

    window.addEventListener("bena-messages-updated", handleMessagesUpdated);

    window.addEventListener("bena-products-updated", handleProductsUpdated);

    window.addEventListener("bena-users-updated", handleUsersUpdated);

    return () => {
      window.removeEventListener("storage", handleStorage);

      window.removeEventListener(
        "bena-messages-updated",
        handleMessagesUpdated,
      );

      window.removeEventListener(
        "bena-products-updated",
        handleProductsUpdated,
      );

      window.removeEventListener("bena-users-updated", handleUsersUpdated);
    };
  }, [refreshData]);

  /* READ NOTIFICATIONS */

  useEffect(() => {
    if (!currentUserId || !conversationId) {
      return;
    }

    const savedNotifications = readStorage("benaNotifications", []);

    if (!Array.isArray(savedNotifications)) {
      return;
    }

    let changed = false;

    const updatedNotifications = savedNotifications.map((notification) => {
      if (!notification || typeof notification !== "object") {
        return notification;
      }

      const belongsToUser = String(notification.userId) === currentUserId;

      const sameConversation =
        String(notification.conversationId || "") === String(conversationId);

      const isMessageNotification = notification.type === "message";

      if (
        belongsToUser &&
        sameConversation &&
        isMessageNotification &&
        !notification.read
      ) {
        changed = true;

        return {
          ...notification,
          read: true,
        };
      }

      return notification;
    });

    if (!changed) {
      return;
    }

    localStorage.setItem(
      "benaNotifications",
      JSON.stringify(updatedNotifications),
    );

    window.dispatchEvent(new Event("bena-notifications-updated"));
  }, [conversationId, currentUserId, readStorage]);

  /* AUTO SCROLL */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  /* PRODUCT IMAGE */

  const getProductImage = (targetProduct) => {
    if (targetProduct?.image) {
      return targetProduct.image;
    }

    if (
      Array.isArray(targetProduct?.images) &&
      targetProduct.images.length > 0
    ) {
      return targetProduct.images[0];
    }

    return null;
  };

  /* PRICE */

  const getProductPrice = (targetProduct) => {
    const price = Number(targetProduct?.price);

    return Number.isFinite(price) ? price : 0;
  };

  /* MESSAGE TIME */

  const formatMessageTime = (value) => {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString("ar-EG", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  /* SEND MESSAGE */

  const sendMessage = (event) => {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (
      !trimmedMessage ||
      !currentUserId ||
      !product ||
      !conversationId ||
      !sellerId ||
      !buyerId
    ) {
      return;
    }

    const userIsSeller = currentUserId === String(sellerId);

    const userIsBuyer = currentUserId === String(buyerId);

    if (!userIsSeller && !userIsBuyer) {
      return;
    }

    if (!buyer || !seller) {
      return;
    }

    const chats = getChats();

    const latestConversation = chats[conversationId];

    if (isSeller && !latestConversation) {
      return;
    }

    const latestMessages =
      latestConversation &&
      typeof latestConversation === "object" &&
      !Array.isArray(latestConversation) &&
      Array.isArray(latestConversation.messages)
        ? latestConversation.messages
        : [];

    const now = new Date().toISOString();

    const newMessage = {
      id: Date.now(),

      text: trimmedMessage,

      senderId: currentUserId,

      createdAt: now,
    };

    const updatedMessages = [...latestMessages, newMessage];

    const updatedConversation = {
      id: conversationId,

      productId: String(product.id),

      sellerId: String(sellerId),

      buyerId: String(buyerId),

      messages: updatedMessages,

      updatedAt: now,
    };

    const updatedChats = {
      ...chats,

      [conversationId]: updatedConversation,
    };

    localStorage.setItem("benaMessages", JSON.stringify(updatedChats));

    setConversation(updatedConversation);

    setMessage("");

    window.dispatchEvent(new Event("bena-messages-updated"));

    /* NOTIFICATION */

    const receiverId = isSeller ? String(buyerId) : String(sellerId);

    if (!receiverId || receiverId === currentUserId) {
      return;
    }

    /* SENDER */

    const senderName =
      String(currentUser?.name || "").trim() ||
      (isSeller ? "البائع" : "المشتري");

    /* NOTIFICATIONS */

    const storedNotifications = readStorage("benaNotifications", []);

    const notifications = Array.isArray(storedNotifications)
      ? storedNotifications
      : [];

    /* CREATE NOTIFICATION */

    const notification = {
      id: `${Date.now()}_message`,

      userId: receiverId,

      conversationId,

      productId: String(product.id),

      type: "message",

      title: `رسالة جديدة من ${senderName}`,

      text: `أرسل لك ${senderName} رسالة بخصوص ${product.name || "المنتج"}`,

      createdAt: now,

      read: false,

      link: `/messages/${product.id}?buyer=${buyerId}`,
    };

    /* SAVE NOTIFICATION */

    localStorage.setItem(
      "benaNotifications",
      JSON.stringify([notification, ...notifications]),
    );

    window.dispatchEvent(new Event("bena-notifications-updated"));
  };

  /* PRODUCT NOT FOUND */

  if (!product) {
    return (
      <div className="messages-not-found" dir="rtl">
        <div className="messages-not-found-icon">
          <MessageCircle size={34} />
        </div>

        <h2>المنتج غير موجود</h2>

        <p>قد يكون المنتج قد تم حذفه أو لم يعد متاحًا.</p>

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
        <div className="messages-not-found-icon">
          <MessageCircle size={34} />
        </div>

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
        <div className="messages-not-found-icon">
          <UserRound size={34} />
        </div>

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
        <div className="messages-not-found-icon">
          <MessageCircle size={34} />
        </div>

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
        <div className="messages-not-found-icon">
          <UserRound size={34} />
        </div>

        <h2>المحادثة غير موجودة</h2>

        <p>المستخدم المرتبط بهذه المحادثة غير موجود.</p>

        <button type="button" onClick={() => navigate("/messages")}>
          العودة للرسائل
        </button>
      </div>
    );
  }

  /* SELLER INVALID CONVERSATION */

  if (isSeller && !conversation) {
    return (
      <div className="messages-not-found" dir="rtl">
        <div className="messages-not-found-icon">
          <MessageCircle size={34} />
        </div>

        <h2>المحادثة غير موجودة</h2>

        <p>لا توجد محادثة سابقة مع هذا المستخدم حول المنتج.</p>

        <button type="button" onClick={() => navigate("/messages")}>
          العودة للرسائل
        </button>
      </div>
    );
  }

  const productImage = getProductImage(product);

  return (
    <main className="messages-page" dir="rtl">
      <div className="messages-container">
        {/* BACK */}

        <button
          type="button"
          className="messages-back"
          onClick={() => navigate("/messages")}
        >
          <ArrowRight size={19} />

          <span>العودة للرسائل</span>
        </button>

        {/* CHAT */}

        <div className="chat-card">
          {/* HEADER */}

          <div className="chat-header">
            <div className="seller-profile">
              <div className="chat-avatar">
                <UserRound size={24} />
              </div>

              <div className="seller-profile-info">
                <h3>{otherUserName}</h3>

                <span>
                  <ShieldCheck size={13} />
                  حساب على منصة بينا
                </span>
              </div>
            </div>

            {/* PRODUCT */}

            <button
              type="button"
              className="chat-product"
              onClick={() => navigate(`/products/${product.id}`)}
            >
              {productImage ? (
                <img src={productImage} alt={product.name || "منتج"} />
              ) : (
                <div className="chat-product-image-fallback">
                  <ImageOff size={22} strokeWidth={1.5} />
                </div>
              )}

              <div>
                <strong>{product.name || "منتج بدون اسم"}</strong>

                <span className="chat-product-price">
                  {getProductPrice(product).toLocaleString()} ₪
                </span>

                <small>
                  <MapPin size={12} />

                  {product.location || "غير محدد"}
                </small>
              </div>
            </button>
          </div>

          {/* MESSAGES */}

          <div className="chat-messages">
            {messages.length > 0 ? (
              messages.map((item, index) => {
                const isMine = String(item?.senderId) === currentUserId;

                const messageTime = formatMessageTime(item?.createdAt);

                return (
                  <div
                    key={item?.id ?? `${conversationId}-${index}`}
                    className={`chat-message-row ${
                      isMine
                        ? "chat-message-row--mine"
                        : "chat-message-row--other"
                    }`}
                  >
                    <div
                      className={`chat-message ${
                        isMine ? "chat-message--buyer" : "chat-message--seller"
                      }`}
                    >
                      <p className="chat-message-text">{item?.text || ""}</p>

                      {messageTime && (
                        <span className="chat-message-time">
                          <Clock3 size={10} />

                          {messageTime}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="chat-empty">
                <div className="chat-empty-icon">
                  <MessageCircle size={29} strokeWidth={1.5} />
                </div>

                <strong>ابدأ المحادثة</strong>

                <span>أرسل رسالة إلى {otherUserName} حول هذا المنتج.</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* SEND */}

          <form className="chat-input-area" onSubmit={sendMessage}>
            <div className="chat-input-wrapper">
              <input
                type="text"
                placeholder={`اكتب رسالة إلى ${otherUserName}...`}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                maxLength={1000}
                autoComplete="off"
                aria-label="اكتب رسالتك"
              />

              {message.length > 850 && (
                <span className="chat-character-count">
                  {message.length}/1000
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={!message.trim()}
              aria-label="إرسال الرسالة"
            >
              <Send size={18} />

              <span>إرسال</span>
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default Messages;
