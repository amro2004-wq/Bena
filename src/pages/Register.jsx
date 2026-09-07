import "./Auth.css";

import authMarketplace from "../assets/auth-marketplace.png";

import Toast from "../components/Toast";

import { Link, useNavigate } from "react-router-dom";

import { useState } from "react";

import {
  UserRound,
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

function Register() {
  const navigate = useNavigate();

  /* FORM */

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  /* TOAST */

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

  /* CHANGE */

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

  /* PASSWORD STRENGTH */

  const getPasswordStrength = () => {
    const password = form.password;

    if (!password) {
      return {
        level: 0,
        text: "",
        className: "",
      };
    }

    let score = 0;

    if (password.length >= 6) {
      score++;
    }

    if (password.length >= 8) {
      score++;
    }

    if (/[A-Z]/.test(password)) {
      score++;
    }

    if (/[a-z]/.test(password)) {
      score++;
    }

    if (/[0-9]/.test(password)) {
      score++;
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score++;
    }

    if (score <= 2) {
      return {
        level: 1,
        text: "ضعيفة",
        className: "weak",
      };
    }

    if (score <= 4) {
      return {
        level: 2,
        text: "متوسطة",
        className: "medium",
      };
    }

    return {
      level: 3,
      text: "قوية",
      className: "strong",
    };
  };

  const passwordStrength = getPasswordStrength();

  /* VALIDATION */

  const validateForm = () => {
    const newErrors = {};

    const name = form.name.trim();

    const email = form.email.trim().toLowerCase();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name) {
      newErrors.name = "يرجى إدخال الاسم الكامل";
    } else if (name.length < 3) {
      newErrors.name = "الاسم يجب أن يكون 3 أحرف على الأقل";
    }

    if (!email) {
      newErrors.email = "يرجى إدخال البريد الإلكتروني";
    } else if (!emailPattern.test(email)) {
      newErrors.email = "البريد الإلكتروني غير صحيح";
    }

    if (!form.password) {
      newErrors.password = "يرجى إدخال كلمة المرور";
    } else if (form.password.length < 6) {
      newErrors.password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "يرجى تأكيد كلمة المرور";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "كلمتا المرور غير متطابقتين";
    }

    if (!acceptedTerms) {
      newErrors.terms = "يجب الموافقة على الشروط والأحكام";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* REGISTER */

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isLoading) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    const users = JSON.parse(localStorage.getItem("benaUsers")) || [];

    const email = form.email.trim().toLowerCase();

    /* DUPLICATE EMAIL */

    const userExists = users.some(
      (user) =>
        typeof user?.email === "string" &&
        user.email.trim().toLowerCase() === email,
    );

    if (userExists) {
      setErrors((current) => ({
        ...current,
        email: "يوجد حساب مسجل بهذا البريد الإلكتروني",
      }));

      showToast("هذا البريد مستخدم بالفعل", "error");

      return;
    }

    setIsLoading(true);

    /* NEW USER */

    const newUser = {
      id: Date.now(),

      name: form.name.trim(),

      email,

      password: form.password,

      createdAt: new Date().toISOString(),
    };

    const updatedUsers = [...users, newUser];

    setTimeout(() => {
      localStorage.setItem("benaUsers", JSON.stringify(updatedUsers));

      setIsLoading(false);

      showToast("تم إنشاء الحساب بنجاح ✓", "success");

      setTimeout(() => {
        navigate("/login");
      }, 900);
    }, 900);
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
              <h1>أنشئ حسابك في بينا</h1>

              <p>وابدأ البيع والشراء بسهولة داخل قطاع غزة</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              {/* NAME */}

              <div className="auth-field">
                <label htmlFor="name">الاسم الكامل</label>

                <div
                  className={`auth-input ${
                    errors.name ? "auth-input-error" : ""
                  }`}
                >
                  <UserRound size={18} />

                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="مثال: محمد أحمد"
                    autoComplete="name"
                    disabled={isLoading}
                  />
                </div>

                {errors.name && (
                  <span className="auth-error">{errors.name}</span>
                )}
              </div>

              {/* EMAIL */}

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
                    disabled={isLoading}
                  />
                </div>

                {errors.email && (
                  <span className="auth-error">{errors.email}</span>
                )}
              </div>

              {/* PASSWORD */}

              <div className="auth-field">
                <label htmlFor="password">كلمة المرور</label>

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
                    autoComplete="new-password"
                    disabled={isLoading}
                  />

                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={
                      showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
                    }
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>

                {errors.password && (
                  <span className="auth-error">{errors.password}</span>
                )}

                {form.password && (
                  <div className="password-strength">
                    <div className="password-strength-top">
                      <span>قوة كلمة المرور</span>

                      <strong className={passwordStrength.className}>
                        {passwordStrength.text}
                      </strong>
                    </div>

                    <div className="password-bars">
                      {[1, 2, 3].map((item) => (
                        <span
                          key={item}
                          className={
                            item <= passwordStrength.level
                              ? passwordStrength.className
                              : ""
                          }
                        ></span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* CONFIRM PASSWORD */}

              <div className="auth-field">
                <label htmlFor="confirmPassword">تأكيد كلمة المرور</label>

                <div
                  className={`auth-input ${
                    errors.confirmPassword ? "auth-input-error" : ""
                  }`}
                >
                  <Lock size={18} />

                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="أعد إدخال كلمة المرور"
                    autoComplete="new-password"
                    disabled={isLoading}
                  />

                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                    aria-label={
                      showConfirmPassword
                        ? "إخفاء كلمة المرور"
                        : "إظهار كلمة المرور"
                    }
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>

                {errors.confirmPassword && (
                  <span className="auth-error">{errors.confirmPassword}</span>
                )}
              </div>

              {/* TERMS */}

              <div>
                <label className="auth-terms">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    disabled={isLoading}
                    onChange={(e) => {
                      setAcceptedTerms(e.target.checked);

                      setErrors((current) => ({
                        ...current,
                        terms: "",
                      }));
                    }}
                  />

                  <span>
                    أوافق على <Link to="/info/terms">الشروط والأحكام</Link> و{" "}
                    <Link to="/info/privacy">سياسة الخصوصية</Link>
                  </span>
                </label>

                {errors.terms && (
                  <span className="auth-error auth-terms-error">
                    {errors.terms}
                  </span>
                )}
              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                className="auth-submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoaderCircle size={18} className="auth-loader" />

                    <span>جاري إنشاء الحساب...</span>
                  </>
                ) : (
                  <>
                    <span>إنشاء حساب</span>

                    <ArrowLeft size={18} />
                  </>
                )}
              </button>
            </form>

            {/* DIVIDER */}

            <div className="auth-divider">
              <span>أو باستخدام</span>
            </div>

            {/* SOCIALS */}

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

            {/* LOGIN */}

            <p className="auth-login">
              لديك حساب بالفعل؟
              <Link to="/login">تسجيل الدخول</Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Register;
