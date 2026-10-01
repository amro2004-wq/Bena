import "./AdminMessages.css";

import { useEffect, useMemo, useState } from "react";

import {
  MessageCircle,
  Search,
  Package,
  UserRound,
  Clock,
  MessagesSquare,
  Users,
  Activity,
  ChevronDown,
  SlidersHorizontal,
  Inbox,
} from "lucide-react";

import AdminSidebar from "../components/AdminSidebar";

function AdminMessages() {
  /* STATE */

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [storageVersion, setStorageVersion] = useState(0);

  /* STORAGE */

  const readStorage = (key, fallback) => {
    try {
      const value = localStorage.getItem(key);

      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  };

  const messages = useMemo(() => {
    const savedMessages = readStorage("benaMessages", {});

    if (
      !savedMessages ||
      typeof savedMessages !== "object" ||
      Array.isArray(savedMessages)
    ) {
      return {};
    }

    return savedMessages;
  }, [storageVersion]);

  const users = useMemo(() => {
    const savedUsers = readStorage("benaUsers", []);

    return Array.isArray(savedUsers) ? savedUsers : [];
  }, [storageVersion]);

  const products = useMemo(() => {
    const savedProducts = readStorage("benaProducts", []);

    return Array.isArray(savedProducts) ? savedProducts : [];
  }, [storageVersion]);

  /* LIVE UPDATE */

  useEffect(() => {
    const refreshData = () => {
      setStorageVersion((current) => current + 1);
    };

    window.addEventListener("bena-messages-updated", refreshData);
    window.addEventListener("bena-products-updated", refreshData);
    window.addEventListener("bena-users-updated", refreshData);
    window.addEventListener("storage", refreshData);

    return () => {
      window.removeEventListener("bena-messages-updated", refreshData);
      window.removeEventListener("bena-products-updated", refreshData);
      window.removeEventListener("bena-users-updated", refreshData);
      window.removeEventListener("storage", refreshData);
    };
  }, []);

  /* USER */

  const getUser = (userId) => {
    if (userId === undefined || userId === null || userId === "") {
      return null;
    }

    return users.find((user) => String(user.id) === String(userId)) || null;
  };

  /* PRODUCT */

  const getProduct = (productId) => {
    if (productId === undefined || productId === null || productId === "") {
      return null;
    }

    return (
      products.find((product) => String(product.id) === String(productId)) ||
      null
    );
  };

  /* PRODUCT IMAGE */

  const getProductImage = (product) => {
    if (!product) {
      return null;
    }

    if (product.image) {
      return product.image;
    }

    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0];
    }

    return null;
  };

  /* CONVERSATIONS */

  const conversations = useMemo(() => {
    return Object.entries(messages)
      .map(([conversationId, conversation]) => {
        let messageList = [];

        let buyerId = null;
        let sellerId = null;
        let productId = null;

        let conversationCreatedAt = null;
        let conversationUpdatedAt = null;

        /* ARRAY SCHEMA */

        if (Array.isArray(conversation)) {
          messageList = conversation;

          const firstMessage = messageList[0];

          buyerId = firstMessage?.buyerId ?? null;
          sellerId = firstMessage?.sellerId ?? null;
          productId = firstMessage?.productId ?? null;

          conversationCreatedAt =
            firstMessage?.createdAt || firstMessage?.timestamp || null;
        } else if (conversation && typeof conversation === "object") {
          messageList = Array.isArray(conversation.messages)
            ? conversation.messages
            : [];

          buyerId = conversation.buyerId ?? null;
          sellerId = conversation.sellerId ?? null;
          productId = conversation.productId ?? null;

          conversationCreatedAt = conversation.createdAt || null;

          conversationUpdatedAt = conversation.updatedAt || null;

          const firstMessage = messageList[0];

          if (buyerId === null || buyerId === undefined || buyerId === "") {
            buyerId = firstMessage?.buyerId ?? null;
          }

          if (sellerId === null || sellerId === undefined || sellerId === "") {
            sellerId = firstMessage?.sellerId ?? null;
          }

          if (
            productId === null ||
            productId === undefined ||
            productId === ""
          ) {
            productId = firstMessage?.productId ?? null;
          }
        }

        /* CONVERSATION ID */

        const idParts = String(conversationId).split("_");

        if (productId === null || productId === undefined || productId === "") {
          productId = idParts[0] || null;
        }

        if (buyerId === null || buyerId === undefined || buyerId === "") {
          buyerId = idParts[1] || null;
        }

        /* PRODUCT */

        const product = getProduct(productId);

        /* SELLER FALLBACK */

        if (
          (sellerId === null || sellerId === undefined || sellerId === "") &&
          product?.sellerId !== undefined &&
          product?.sellerId !== null
        ) {
          sellerId = product.sellerId;
        }

        /* USERS */

        const buyer = getUser(buyerId);
        const seller = getUser(sellerId);

        /* LAST ACTIVITY */

        const lastMessage =
          messageList.length > 0 ? messageList[messageList.length - 1] : null;

        const lastActivity =
          lastMessage?.createdAt ||
          lastMessage?.timestamp ||
          conversationUpdatedAt ||
          conversationCreatedAt ||
          null;

        return {
          conversationId,
          buyerId,
          sellerId,
          productId,
          buyer,
          seller,
          product,
          messagesCount: messageList.length,
          lastActivity,
        };
      })
      .filter((conversation) => conversation.conversationId);
  }, [messages, users, products]);

  /* STATISTICS */

  const statistics = useMemo(() => {
    const totalMessages = conversations.reduce(
      (total, conversation) => total + Number(conversation.messagesCount || 0),
      0,
    );

    const activeUsers = new Set();

    conversations.forEach((conversation) => {
      if (
        conversation.buyerId !== null &&
        conversation.buyerId !== undefined &&
        conversation.buyerId !== ""
      ) {
        activeUsers.add(String(conversation.buyerId));
      }

      if (
        conversation.sellerId !== null &&
        conversation.sellerId !== undefined &&
        conversation.sellerId !== ""
      ) {
        activeUsers.add(String(conversation.sellerId));
      }
    });

    const activeProducts = new Set(
      conversations
        .map((conversation) => conversation.productId)
        .filter(
          (productId) =>
            productId !== null && productId !== undefined && productId !== "",
        )
        .map(String),
    );

    return {
      conversations: conversations.length,
      messages: totalMessages,
      users: activeUsers.size,
      products: activeProducts.size,
    };
  }, [conversations]);

  /* FILTER */

  const filteredConversations = useMemo(() => {
    const value = search.trim().toLowerCase();

    const result = conversations.filter((conversation) => {
      if (!value) {
        return true;
      }

      const productName = String(
        conversation.product?.name || conversation.product?.title || "",
      ).toLowerCase();

      const buyerName = String(conversation.buyer?.name || "").toLowerCase();

      const sellerName = String(conversation.seller?.name || "").toLowerCase();

      const conversationId = String(
        conversation.conversationId || "",
      ).toLowerCase();

      const productId = String(conversation.productId || "").toLowerCase();

      const buyerId = String(conversation.buyerId || "").toLowerCase();

      const sellerId = String(conversation.sellerId || "").toLowerCase();

      return (
        productName.includes(value) ||
        buyerName.includes(value) ||
        sellerName.includes(value) ||
        conversationId.includes(value) ||
        productId.includes(value) ||
        buyerId.includes(value) ||
        sellerId.includes(value)
      );
    });

    return [...result].sort((a, b) => {
      if (sortBy === "messages-high") {
        return Number(b.messagesCount || 0) - Number(a.messagesCount || 0);
      }

      if (sortBy === "messages-low") {
        return Number(a.messagesCount || 0) - Number(b.messagesCount || 0);
      }

      const aDate = new Date(a.lastActivity || 0).getTime();

      const bDate = new Date(b.lastActivity || 0).getTime();

      const safeADate = Number.isNaN(aDate) ? 0 : aDate;
      const safeBDate = Number.isNaN(bDate) ? 0 : bDate;

      if (sortBy === "oldest") {
        return safeADate - safeBDate;
      }

      return safeBDate - safeADate;
    });
  }, [search, conversations, sortBy]);

  /* DATE */

  const formatDate = (date) => {
    if (!date) {
      return "غير معروف";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "غير معروف";
    }

    return parsedDate.toLocaleString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  /* RESET */

  const resetFilters = () => {
    setSearch("");
    setSortBy("latest");
  };

  return (
    <div className="admin-messages-layout" dir="rtl">
      <AdminSidebar />

      <main className="admin-messages-page">
        <div className="admin-messages-container">
          {/* HEADER */}

          <header className="admin-messages-heading">
            <div>
              <div className="admin-messages-eyebrow">
                <MessageCircle size={14} />

                <span>إدارة الرسائل</span>
              </div>

              <h1>المحادثات</h1>

              <p>
                تابع نشاط المحادثات بين مستخدمي منصة بينا دون عرض محتوى الرسائل.
              </p>
            </div>

            <div className="admin-messages-heading-count">
              <span>إجمالي المحادثات</span>

              <strong>{statistics.conversations}</strong>

              <small>محادثة على المنصة</small>
            </div>
          </header>

          {/* STATISTICS */}

          <section className="admin-messages-stats">
            <div className="admin-messages-stat conversations">
              <span className="admin-messages-stat-icon">
                <MessagesSquare size={20} />
              </span>

              <div>
                <span>المحادثات</span>

                <strong>{statistics.conversations}</strong>
              </div>
            </div>

            <div className="admin-messages-stat messages">
              <span className="admin-messages-stat-icon">
                <MessageCircle size={20} />
              </span>

              <div>
                <span>إجمالي الرسائل</span>

                <strong>{statistics.messages}</strong>
              </div>
            </div>

            <div className="admin-messages-stat users">
              <span className="admin-messages-stat-icon">
                <Users size={20} />
              </span>

              <div>
                <span>مستخدمون نشطون</span>

                <strong>{statistics.users}</strong>
              </div>
            </div>

            <div className="admin-messages-stat products">
              <span className="admin-messages-stat-icon">
                <Activity size={20} />
              </span>

              <div>
                <span>منتجات نشطة</span>

                <strong>{statistics.products}</strong>
              </div>
            </div>
          </section>

          {/* TOOLBAR */}

          <section className="admin-messages-toolbar">
            <div className="admin-messages-search">
              <Search size={17} />

              <input
                type="text"
                value={search}
                placeholder="ابحث بالمنتج أو المستخدم أو رقم المحادثة..."
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="admin-messages-sort">
              <SlidersHorizontal size={15} />

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                <option value="latest">آخر نشاط</option>

                <option value="oldest">الأقدم أولًا</option>

                <option value="messages-high">الأكثر رسائل</option>

                <option value="messages-low">الأقل رسائل</option>
              </select>

              <ChevronDown size={14} />
            </div>
          </section>

          {/* RESULTS */}

          <div className="admin-messages-results">
            عرض <strong>{filteredConversations.length}</strong> من{" "}
            <strong>{statistics.conversations}</strong> محادثة
          </div>

          {/* TABLE */}

          <section className="admin-messages-table-card">
            <div className="admin-messages-table-heading">
              <div>
                <h2>نشاط المحادثات</h2>

                <p>ملخص نشاط التواصل بين المشترين والبائعين</p>
              </div>

              <span>{filteredConversations.length} نتيجة</span>
            </div>

            {filteredConversations.length > 0 ? (
              <div className="admin-messages-table-wrapper">
                <table className="admin-messages-table">
                  <thead>
                    <tr>
                      <th>المنتج</th>

                      <th>المشتري</th>

                      <th>البائع</th>

                      <th>عدد الرسائل</th>

                      <th>آخر نشاط</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredConversations.map((conversation) => {
                      const productImage = getProductImage(
                        conversation.product,
                      );

                      return (
                        <tr key={conversation.conversationId}>
                          <td>
                            <div className="admin-message-product">
                              <div className="admin-message-product-icon">
                                {productImage ? (
                                  <img
                                    src={productImage}
                                    alt={
                                      conversation.product?.name ||
                                      conversation.product?.title ||
                                      "منتج"
                                    }
                                    loading="lazy"
                                  />
                                ) : (
                                  <Package size={18} />
                                )}
                              </div>

                              <div>
                                <strong>
                                  {conversation.product?.name ||
                                    conversation.product?.title ||
                                    "منتج غير متوفر"}
                                </strong>

                                <span>
                                  #{conversation.productId || "غير معروف"}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td>
                            <div className="admin-message-user">
                              <span className="admin-message-user-icon buyer">
                                <UserRound size={14} />
                              </span>

                              <div>
                                <strong>
                                  {conversation.buyer?.name ||
                                    "مستخدم غير متوفر"}
                                </strong>

                                <span>
                                  المشتري
                                  {conversation.buyerId
                                    ? ` · #${conversation.buyerId}`
                                    : ""}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td>
                            <div className="admin-message-user">
                              <span className="admin-message-user-icon seller">
                                <UserRound size={14} />
                              </span>

                              <div>
                                <strong>
                                  {conversation.seller?.name ||
                                    "مستخدم غير متوفر"}
                                </strong>

                                <span>
                                  البائع
                                  {conversation.sellerId
                                    ? ` · #${conversation.sellerId}`
                                    : ""}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="admin-message-total">
                              <MessageCircle size={13} />

                              {conversation.messagesCount}
                            </span>
                          </td>

                          <td>
                            <span className="admin-message-date">
                              <Clock size={13} />

                              {formatDate(conversation.lastActivity)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="admin-messages-empty">
                <span className="admin-messages-empty-icon">
                  <Inbox size={29} />
                </span>

                <h2>{search ? "لا توجد نتائج" : "لا توجد محادثات"}</h2>

                <p>
                  {search
                    ? "لم يتم العثور على محادثات مطابقة لعملية البحث."
                    : "لا يوجد نشاط محادثات على المنصة حاليًا."}
                </p>

                {(search || sortBy !== "latest") && (
                  <button type="button" onClick={resetFilters}>
                    عرض جميع المحادثات
                  </button>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default AdminMessages;
