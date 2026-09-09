import "./AdminMessages.css";

import { useMemo, useState } from "react";

import { MessageCircle, Search, Package, UserRound, Clock } from "lucide-react";

import AdminSidebar from "../components/AdminSidebar";

function AdminMessages() {
  const [search, setSearch] = useState("");

  /* STORAGE */

  const readStorage = (key, fallback) => {
    try {
      const value = localStorage.getItem(key);

      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  };

  const messages = readStorage("benaMessages", {});

  const users = readStorage("benaUsers", []);

  const products = readStorage("benaProducts", []);

  /* USER */

  const getUser = (userId) => {
    return users.find((user) => Number(user.id) === Number(userId));
  };

  /* PRODUCT */

  const getProduct = (productId) => {
    return products.find((product) => Number(product.id) === Number(productId));
  };

  /* CONVERSATIONS */

  const conversations = useMemo(() => {
    if (!messages || typeof messages !== "object" || Array.isArray(messages)) {
      return [];
    }

    return Object.entries(messages).map(([conversationId, conversation]) => {
      let messageList = [];

      let buyerId = conversation?.buyerId;

      let sellerId = conversation?.sellerId;

      let productId = conversation?.productId;

      /* ARRAY SCHEMA */

      if (Array.isArray(conversation)) {
        messageList = conversation;

        const firstMessage = messageList[0];

        buyerId = firstMessage?.buyerId;

        sellerId = firstMessage?.sellerId;

        productId = firstMessage?.productId;
      } else {
        messageList = Array.isArray(conversation?.messages)
          ? conversation.messages
          : [];
      }

      /* CONVERSATION ID */

      const idParts = conversationId.split("_");

      if (!productId) {
        productId = idParts[0];
      }

      if (!buyerId) {
        buyerId = idParts[1];
      }

      /* PRODUCT */

      const product = getProduct(productId);

      /* SELLER FALLBACK */

      if (!sellerId && product?.sellerId) {
        sellerId = product.sellerId;
      }

      /* USERS */

      const buyer = getUser(buyerId);

      const seller = getUser(sellerId);

      /* LAST MESSAGE */

      const lastMessage = messageList[messageList.length - 1];

      const lastActivity =
        lastMessage?.createdAt ||
        lastMessage?.timestamp ||
        conversation?.updatedAt ||
        conversation?.createdAt ||
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
    });
  }, [messages, users, products]);

  /* FILTER */

  const filteredConversations = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return conversations;
    }

    return conversations.filter((conversation) => {
      const productName =
        conversation.product?.name || conversation.product?.title || "";

      const buyerName = conversation.buyer?.name || "";

      const sellerName = conversation.seller?.name || "";

      const conversationId = String(
        conversation.conversationId || "",
      ).toLowerCase();

      return (
        productName.toLowerCase().includes(value) ||
        buyerName.toLowerCase().includes(value) ||
        sellerName.toLowerCase().includes(value) ||
        conversationId.includes(value)
      );
    });
  }, [search, conversations]);

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

  return (
    <div className="admin-layout" dir="rtl">
      <AdminSidebar />

      <main className="admin-messages-page">
        <div className="admin-messages-container">
          <div className="admin-messages-heading">
            <div>
              <span>إدارة الرسائل</span>

              <h1>المحادثات</h1>

              <p>
                تابع نشاط المحادثات بين مستخدمي منصة بينا دون عرض محتوى الرسائل.
              </p>
            </div>

            <div className="admin-messages-count">
              <MessageCircle size={20} />

              <strong>{conversations.length}</strong>

              <span>محادثة</span>
            </div>
          </div>

          <div className="admin-messages-toolbar">
            <div className="admin-messages-search">
              <Search size={18} />

              <input
                type="text"
                value={search}
                placeholder="ابحث باسم المنتج أو المستخدم..."
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

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
                {filteredConversations.map((conversation) => (
                  <tr key={conversation.conversationId}>
                    <td>
                      <div className="admin-message-product">
                        <div className="admin-message-product-icon">
                          <Package size={18} />
                        </div>

                        <div>
                          <strong>
                            {conversation.product?.name ||
                              conversation.product?.title ||
                              "منتج غير متوفر"}
                          </strong>

                          <span>ID: {conversation.productId}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="admin-message-user">
                        <UserRound size={16} />

                        <span>
                          {conversation.buyer?.name || "مستخدم غير متوفر"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="admin-message-user">
                        <UserRound size={16} />

                        <span>
                          {conversation.seller?.name || "مستخدم غير متوفر"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className="admin-message-total">
                        <MessageCircle size={15} />

                        {conversation.messagesCount}
                      </span>
                    </td>

                    <td>
                      <span className="admin-message-date">
                        <Clock size={15} />

                        {formatDate(conversation.lastActivity)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredConversations.length === 0 && (
              <div className="admin-messages-empty">
                {search
                  ? "لا توجد محادثات مطابقة للبحث."
                  : "لا توجد محادثات حاليًا."}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminMessages;
