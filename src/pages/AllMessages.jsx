import "./AllMessages.css";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  MessageCircle,
  ArrowRight,
  MapPin,
  ImageOff,
  Search,
  X,
  Clock3,
  MessagesSquare,
  PackageX,
} from "lucide-react";

import { defaultProducts } from "../data/products";

function AllMessages() {
  const navigate = useNavigate();

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

  const userId =
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

  /* USERS */

  const getUsers = useCallback(() => {
    const savedUsers = readStorage("benaUsers", []);

    return Array.isArray(savedUsers) ? savedUsers : [];
  }, [readStorage]);

  const [users, setUsers] = useState(getUsers);

  /* CHATS */

  const getChats = useCallback(() => {
    const savedChats = readStorage("benaMessages", {});

    if (
      !savedChats ||
      typeof savedChats !== "object" ||
      Array.isArray(savedChats)
    ) {
      return {};
    }

    return savedChats;
  }, [readStorage]);

  const [chats, setChats] = useState(getChats);

  /* NOTIFICATIONS */

  const getNotifications = useCallback(() => {
    const savedNotifications = readStorage("benaNotifications", []);

    return Array.isArray(savedNotifications) ? savedNotifications : [];
  }, [readStorage]);

  const [notifications, setNotifications] = useState(getNotifications);

  /* SEARCH */

  const [searchQuery, setSearchQuery] = useState("");

  /* REFRESH */

  const refreshData = useCallback(() => {
    setCurrentUser(getCurrentUser());
    setProducts(getProducts());
    setUsers(getUsers());
    setChats(getChats());
    setNotifications(getNotifications());
  }, [getCurrentUser, getProducts, getUsers, getChats, getNotifications]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  /* EVENTS */

  useEffect(() => {
    const handleStorage = (event) => {
      if (
        !event.key ||
        event.key === "benaCurrentUser" ||
        event.key === "benaMessages" ||
        event.key === "benaNotifications" ||
        event.key === "benaProducts" ||
        event.key === "benaUsers"
      ) {
        refreshData();
      }
    };

    const handleMessagesUpdated = () => {
      refreshData();
    };

    const handleNotificationsUpdated = () => {
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

    window.addEventListener(
      "bena-notifications-updated",
      handleNotificationsUpdated,
    );

    window.addEventListener("bena-products-updated", handleProductsUpdated);

    window.addEventListener("bena-users-updated", handleUsersUpdated);

    return () => {
      window.removeEventListener("storage", handleStorage);

      window.removeEventListener(
        "bena-messages-updated",
        handleMessagesUpdated,
      );

      window.removeEventListener(
        "bena-notifications-updated",
        handleNotificationsUpdated,
      );

      window.removeEventListener(
        "bena-products-updated",
        handleProductsUpdated,
      );

      window.removeEventListener("bena-users-updated", handleUsersUpdated);
    };
  }, [refreshData]);

  /* HELPERS */

  const getProductImage = (product) => {
    if (product?.image) {
      return product.image;
    }

    if (Array.isArray(product?.images) && product.images.length > 0) {
      return product.images[0];
    }

    return null;
  };

  const getProductPrice = (product) => {
    const price = Number(product?.price);

    return Number.isFinite(price) ? price : 0;
  };

  const getTimestamp = (value) => {
    if (!value) {
      return 0;
    }

    const timestamp = new Date(value).getTime();

    return Number.isFinite(timestamp) ? timestamp : 0;
  };

  const normalizeSearchText = (value) => {
    return String(value || "")
      .trim()
      .toLowerCase();
  };

  /* DATE */

  const formatMessageTime = (value) => {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const now = new Date();

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const messageDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );

    const difference = today.getTime() - messageDay.getTime();

    const oneDay = 24 * 60 * 60 * 1000;

    if (difference === 0) {
      return date.toLocaleTimeString("ar-EG", {
        hour: "numeric",
        minute: "2-digit",
      });
    }

    if (difference === oneDay) {
      return "أمس";
    }

    if (difference > 0 && difference < 7 * oneDay) {
      return date.toLocaleDateString("ar-EG", {
        weekday: "short",
      });
    }

    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString("ar-EG", {
        day: "numeric",
        month: "short",
      });
    }

    return date.toLocaleDateString("ar-EG", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
  };

  /* CONVERSATIONS */

  const conversations = useMemo(() => {
    if (!userId) {
      return [];
    }

    return Object.values(chats)
      .filter((conversation) => {
        if (
          !conversation ||
          typeof conversation !== "object" ||
          Array.isArray(conversation)
        ) {
          return false;
        }

        const buyerId =
          conversation.buyerId !== undefined && conversation.buyerId !== null
            ? String(conversation.buyerId)
            : null;

        const sellerId =
          conversation.sellerId !== undefined && conversation.sellerId !== null
            ? String(conversation.sellerId)
            : null;

        return buyerId === userId || sellerId === userId;
      })
      .map((conversation) => {
        const productId =
          conversation.productId !== undefined &&
          conversation.productId !== null
            ? String(conversation.productId)
            : null;

        const buyerId =
          conversation.buyerId !== undefined && conversation.buyerId !== null
            ? String(conversation.buyerId)
            : null;

        const sellerId =
          conversation.sellerId !== undefined && conversation.sellerId !== null
            ? String(conversation.sellerId)
            : null;

        if (!productId || !buyerId || !sellerId) {
          return null;
        }

        const savedProduct =
          products.find((item) => item && String(item.id) === productId) ||
          null;

        const productSnapshot =
          conversation.product &&
          typeof conversation.product === "object" &&
          !Array.isArray(conversation.product)
            ? conversation.product
            : null;

        const product = savedProduct ||
          productSnapshot || {
            id: productId,
            name: conversation.productName || "منتج لم يعد متاحًا",
            price: conversation.productPrice || 0,
            location: conversation.productLocation || "",
            image: conversation.productImage || null,
          };

        const productAvailable = Boolean(savedProduct);

        const messages = Array.isArray(conversation.messages)
          ? conversation.messages.filter(
              (message) =>
                message &&
                typeof message === "object" &&
                !Array.isArray(message),
            )
          : [];

        const lastMessage =
          messages.length > 0 ? messages[messages.length - 1] : null;

        const isSeller = sellerId === userId;

        const otherUserId = isSeller ? buyerId : sellerId;

        const otherUser =
          users.find(
            (user) => user && String(user.id) === String(otherUserId),
          ) || null;

        const conversationId = String(
          conversation.id || `${productId}_${buyerId}`,
        );

        const unreadCount = notifications.filter((notification) => {
          if (!notification || typeof notification !== "object") {
            return false;
          }

          return (
            notification.type === "message" &&
            !notification.read &&
            String(notification.userId) === userId &&
            String(notification.conversationId || "") === conversationId
          );
        }).length;

        const updatedAt =
          conversation.updatedAt ||
          lastMessage?.createdAt ||
          conversation.createdAt ||
          null;

        return {
          conversation,
          conversationId,
          product,
          productAvailable,
          lastMessage,
          unreadCount,
          isSeller,
          otherUser,
          buyerId,
          updatedAt,
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        const aTime = getTimestamp(a.updatedAt);

        const bTime = getTimestamp(b.updatedAt);

        return bTime - aTime;
      });
  }, [chats, notifications, products, users, userId]);

  /* FILTERED CONVERSATIONS */

  const filteredConversations = useMemo(() => {
    const query = normalizeSearchText(searchQuery);

    if (!query) {
      return conversations;
    }

    return conversations.filter(
      ({ product, otherUser, isSeller, lastMessage }) => {
        const otherUserName =
          otherUser?.name ||
          (isSeller
            ? "مشتري على بينا"
            : product?.sellerName || "بائع على بينا");

        const searchableText = [
          product?.name,
          product?.location,
          otherUserName,
          lastMessage?.text,
        ]
          .map(normalizeSearchText)
          .join(" ");

        return searchableText.includes(query);
      },
    );
  }, [conversations, searchQuery]);

  /* UNREAD TOTAL */

  const totalUnread = useMemo(() => {
    return conversations.reduce(
      (total, conversation) => total + conversation.unreadCount,
      0,
    );
  }, [conversations]);

  /* OPEN CONVERSATION */

  const openConversation = (conversation, buyerId) => {
    if (!conversation?.productId || !buyerId) {
      return;
    }

    navigate(`/messages/${conversation.productId}?buyer=${buyerId}`);
  };

  return (
    <main className="all-messages-page" dir="rtl">
      <div className="all-messages-container">
        {/* BACK */}

        <button
          type="button"
          className="all-messages-back"
          onClick={() => navigate("/")}
        >
          <ArrowRight size={19} />

          <span>العودة للرئيسية</span>
        </button>

        {/* HEADING */}

        <div className="all-messages-heading">
          <span>تواصل بسهولة</span>

          <h1>
            <MessageCircle size={29} aria-hidden="true" />
            الرسائل
          </h1>

          <p>كل محادثاتك مع مستخدمي بينا موجودة هنا.</p>
        </div>

        {conversations.length > 0 ? (
          <>
            {/* TOOLBAR */}

            <div className="messages-toolbar">
              <div className="messages-summary">
                <div className="messages-summary-icon">
                  <MessagesSquare size={20} aria-hidden="true" />
                </div>

                <div>
                  <strong>{conversations.length}</strong>

                  <span>
                    {conversations.length === 1 ? "محادثة" : "محادثات"}
                  </span>
                </div>

                {totalUnread > 0 && (
                  <div className="messages-unread-summary">
                    {totalUnread > 99 ? "99+" : totalUnread} غير مقروءة
                  </div>
                )}
              </div>

              {/* SEARCH */}

              <div className="messages-search">
                <Search size={18} aria-hidden="true" />

                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="ابحث باسم المستخدم أو المنتج..."
                  aria-label="البحث في المحادثات"
                />

                {searchQuery && (
                  <button
                    type="button"
                    className="messages-search-clear"
                    onClick={() => setSearchQuery("")}
                    aria-label="مسح البحث"
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            {/* CONVERSATIONS */}

            {filteredConversations.length > 0 ? (
              <div className="conversations-list">
                {filteredConversations.map(
                  ({
                    conversation,
                    conversationId,
                    product,
                    productAvailable,
                    lastMessage,
                    unreadCount,
                    isSeller,
                    otherUser,
                    buyerId,
                    updatedAt,
                  }) => {
                    const lastMessageIsMine =
                      lastMessage && String(lastMessage.senderId) === userId;

                    const otherUserName =
                      otherUser?.name ||
                      (isSeller
                        ? "مشتري على بينا"
                        : product.sellerName || "بائع على بينا");

                    const productImage = getProductImage(product);

                    const messageTime = formatMessageTime(updatedAt);

                    return (
                      <button
                        type="button"
                        key={conversationId}
                        className={`conversation-card ${
                          unreadCount > 0 ? "conversation-card--unread" : ""
                        }`}
                        onClick={() => openConversation(conversation, buyerId)}
                      >
                        {/* IMAGE */}

                        <div className="conversation-image-wrapper">
                          {productImage ? (
                            <img
                              src={productImage}
                              alt={product.name || "منتج"}
                              className="conversation-image"
                              onError={(event) => {
                                event.currentTarget.style.display = "none";

                                const fallback =
                                  event.currentTarget.nextElementSibling;

                                if (fallback) {
                                  fallback.hidden = false;
                                }
                              }}
                            />
                          ) : null}

                          <div
                            className="conversation-image conversation-image-fallback"
                            hidden={Boolean(productImage)}
                          >
                            {productAvailable ? (
                              <ImageOff
                                size={27}
                                strokeWidth={1.5}
                                aria-hidden="true"
                              />
                            ) : (
                              <PackageX
                                size={27}
                                strokeWidth={1.5}
                                aria-hidden="true"
                              />
                            )}
                          </div>

                          {unreadCount > 0 && (
                            <span className="conversation-image-unread-dot"></span>
                          )}
                        </div>

                        {/* INFO */}

                        <div className="conversation-info">
                          <div className="conversation-top">
                            <div className="conversation-title">
                              <div className="conversation-product-row">
                                <h3>{product.name || "منتج بدون اسم"}</h3>

                                {!productAvailable && (
                                  <span className="conversation-product-unavailable">
                                    غير متاح
                                  </span>
                                )}
                              </div>

                              <span className="conversation-user-name">
                                {otherUserName}
                              </span>
                            </div>

                            <div className="conversation-top-left">
                              {messageTime && (
                                <span
                                  className={`conversation-time ${
                                    unreadCount > 0
                                      ? "conversation-time--unread"
                                      : ""
                                  }`}
                                >
                                  <Clock3 size={12} aria-hidden="true" />

                                  {messageTime}
                                </span>
                              )}

                              {unreadCount > 0 && (
                                <span className="conversation-unread-count">
                                  {unreadCount > 99 ? "99+" : unreadCount}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="conversation-meta">
                            {product.location && (
                              <div className="conversation-location">
                                <MapPin size={13} aria-hidden="true" />

                                <span>{product.location}</span>
                              </div>
                            )}

                            {productAvailable && (
                              <strong className="conversation-price">
                                {getProductPrice(product).toLocaleString()} ₪
                              </strong>
                            )}
                          </div>

                          <p
                            className={`conversation-last-message ${
                              unreadCount > 0
                                ? "conversation-last-message--unread"
                                : ""
                            }`}
                          >
                            {lastMessage ? (
                              <>
                                <span className="conversation-message-owner">
                                  {lastMessageIsMine
                                    ? "أنت: "
                                    : `${otherUserName}: `}
                                </span>

                                <span className="conversation-message-text">
                                  {lastMessage.text || "رسالة"}
                                </span>
                              </>
                            ) : (
                              "ابدأ المحادثة"
                            )}
                          </p>
                        </div>

                        {/* ICON */}

                        <div className="conversation-open-icon">
                          <MessageCircle size={20} aria-hidden="true" />
                        </div>
                      </button>
                    );
                  },
                )}
              </div>
            ) : (
              /* SEARCH EMPTY */

              <div className="messages-search-empty">
                <div className="messages-search-empty-icon">
                  <Search size={30} strokeWidth={1.5} aria-hidden="true" />
                </div>

                <h2>لا توجد محادثات مطابقة</h2>

                <p>جرّب البحث باسم مستخدم أو منتج آخر.</p>

                <button type="button" onClick={() => setSearchQuery("")}>
                  مسح البحث
                </button>
              </div>
            )}
          </>
        ) : (
          /* EMPTY */

          <div className="messages-empty">
            <div className="messages-empty-icon">
              <MessageCircle size={42} strokeWidth={1.4} aria-hidden="true" />
            </div>

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
