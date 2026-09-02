import "./Messages.css";
import { defaultProducts } from "../data/products";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Send, UserRound, ShieldCheck, MapPin } from "lucide-react";

function Messages() {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const savedNotifications =
      JSON.parse(localStorage.getItem("benaNotifications")) || [];

    const updatedNotifications = savedNotifications.map((notification) => {
      if (notification.link === `/messages/${id}`) {
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
  }, [id]);

  const savedProducts = JSON.parse(localStorage.getItem("benaProducts")) || [];

  const products = [...savedProducts, ...defaultProducts];

  const product = products.find((item) => Number(item.id) === Number(id));

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState(() => {
    const savedChats = JSON.parse(localStorage.getItem("benaMessages")) || {};

    return (
      savedChats[id] || [
        {
          id: 1,
          text: "مرحباً، المنتج ما زال متوفراً.",
          type: "seller",
        },
      ]
    );
  });

  const sendMessage = (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: message.trim(),
      type: "buyer",
    };

    const updatedMessages = [...messages, newMessage];

    setMessages(updatedMessages);

    const savedChats = JSON.parse(localStorage.getItem("benaMessages")) || {};

    savedChats[id] = updatedMessages;

    localStorage.setItem("benaMessages", JSON.stringify(savedChats));

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
                <h3>بائع على بينا</h3>

                <span>
                  <ShieldCheck size={13} />
                  حساب موثوق
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
            {messages.map((item) => (
              <div
                key={item.id}
                className={`chat-message ${
                  item.type === "buyer"
                    ? "chat-message--buyer"
                    : "chat-message--seller"
                }`}
              >
                {item.text}
              </div>
            ))}
          </div>

          {/* SEND */}

          <form className="chat-input-area" onSubmit={sendMessage}>
            <input
              type="text"
              placeholder="اكتب رسالتك..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <button type="submit">
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
