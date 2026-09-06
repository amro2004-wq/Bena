import "./Auth.css";
import authMarketplace from "../assets/auth-marketplace.png";
import Toast from "../components/Toast";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ShoppingBag,
  MessageCircle,
  MapPin,
  LoaderCircle,
} from "lucide-react";

import { FcGoogle } from "react-icons/fc";
import { FaFacebookF, FaApple } from "react-icons/fa";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from || "/";
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({
      show: true,
      message,
      type,
    });

    setTimeout(() => {
      setToast((current) => ({
        ...current,
        show: false,
      }));
    }, 2200);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    const email = form.email.trim();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      newErrors.email = "يرجى إدخال البريد الإلكتروني";
    } else if (!emailPattern.test(email)) {
      newErrors.email = "البريد الإلكتروني غير صحيح";
    }

    if (!form.password) {
      newErrors.password = "يرجى إدخال كلمة المرور";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const users = JSON.parse(localStorage.getItem("benaUsers")) || [];

    const email = form.email.trim().toLowerCase();

    const user = users.find((item) => item.email.toLowerCase() === email);

    if (!user) {
      setErrors((current) => ({
        ...current,
        email: "لا يوجد حساب مسجل بهذا البريد الإلكتروني",
      }));

      showToast("الحساب غير موجود", "error");

      return;
    }

    if (user.password !== form.password) {
      setErrors((current) => ({
        ...current,
        password: "كلمة المرور غير صحيحة",
      }));

      showToast("كلمة المرور غير صحيحة", "error");

      return;
    }

    setIsLoading(true);

    const currentUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };

    setTimeout(() => {
      localStorage.setItem("benaCurrentUser", JSON.stringify(currentUser));

      setIsLoading(false);

      showToast(`أهلاً ${user.name} 👋`, "success");

      setTimeout(() => {
        navigate(redirectPath, {
          replace: true,
        });
      }, 800);
    }, 800);
  };

  return (
    <main className="auth-page">
      <Toast show={toast.show} message={toast.message} type={toast.type} />

      <div className="auth-shell">
        {/* VISUAL */}

        <section className="auth-visual">
          <span className="auth-decor auth-decor-one"></span>

          <span className="auth-orange-circle"></span>

          <div className="auth-brand">
            <h2>بينا</h2>

            <p>
              من الناس
              <span> ... </span>
              للناس
            </p>
          </div>

          <div className="auth-visual-title">
            <h3>
              كل اللي بدك إياه
              <br />
              موجود بينا
            </h3>
          </div>

          <div className="auth-benefits">
            <div className="auth-benefit">
              <span className="auth-benefit-icon">
                <ShoppingBag size={17} />
              </span>

              <strong>بيع منتجاتك بكل سهولة</strong>
            </div>

            <div className="auth-benefit">
              <span className="auth-benefit-icon">
                <MessageCircle size={17} />
              </span>

              <strong>تواصل مباشرة مع البائع</strong>
            </div>

            <div className="auth-benefit">
              <span className="auth-benefit-icon">
                <MapPin size={17} />
              </span>

              <strong>اكتشف منتجات قريبة منك</strong>
            </div>
          </div>

          <div className="auth-marketplace">
            <img src={authMarketplace} alt="منصة بينا للبيع والشراء" />
          </div>
        </section>

        {/* FORM */}

        <section className="auth-form-side" dir="rtl">
          <div className="auth-form-content">
            <div className="auth-form-brand">بينا</div>

            <div className="auth-heading">
              <h1>أهلاً بعودتك</h1>

              <p>سجل دخولك وكمل البيع والشراء على بينا</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="auth-field">
                <label htmlFor="email">البريد الإلكتروني</label>

                <div
                  className={`auth-input ${
                    errors.email ? "auth-input-error" : ""
                  }`}
                >
                  <Mail size={18} />

                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    autoComplete="email"
                  />
                </div>

                {errors.email && (
                  <span className="auth-error">{errors.email}</span>
                )}
              </div>

              <div className="auth-field">
                <div className="auth-label-row">
                  <label htmlFor="password">كلمة المرور</label>

                  <Link to="/forgot-password" className="auth-forgot">
                    نسيت كلمة المرور؟
                  </Link>
                </div>

                <div
                  className={`auth-input ${
                    errors.password ? "auth-input-error" : ""
                  }`}
                >
                  <Lock size={18} />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="أدخل كلمة المرور"
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
                    }
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>

                {errors.password && (
                  <span className="auth-error">{errors.password}</span>
                )}
              </div>

              <button
                type="submit"
                className="auth-submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoaderCircle size={18} className="auth-loader" />

                    <span>جاري تسجيل الدخول...</span>
                  </>
                ) : (
                  <>
                    <span>تسجيل الدخول</span>

                    <ArrowLeft size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>أو باستخدام</span>
            </div>

            <div className="auth-socials">
              <button type="button">
                <FcGoogle className="social-icon google-icon" />
                <span>Google</span>
              </button>

              <button type="button">
                <span className="facebook-icon">
                  <FaFacebookF />
                </span>

                <span>Facebook</span>
              </button>

              <button type="button">
                <FaApple className="social-icon apple-icon" />

                <span>Apple</span>
              </button>
            </div>

            <p className="auth-login">
              ما عندك حساب؟
              <Link to="/register">إنشاء حساب جديد</Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Login;
