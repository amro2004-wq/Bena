import "./Auth.css";

import authMarketplace from "../assets/auth-marketplace.png";

import Toast from "../components/Toast";

import { Link, useNavigate } from "react-router-dom";

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
  KeyRound,
} from "lucide-react";

function ForgotPassword() {
  const navigate = useNavigate();

  /* STEP */

  const [step, setStep] = useState("email");

  /* FORM */

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState({});

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  /* CHECK EMAIL */

  const handleEmailSubmit = (e) => {
    e.preventDefault();

    if (isLoading) {
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();

    const newErrors = {};

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail) {
      newErrors.email = "يرجى إدخال البريد الإلكتروني";
    } else if (!emailPattern.test(trimmedEmail)) {
      newErrors.email = "البريد الإلكتروني غير صحيح";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const users = JSON.parse(localStorage.getItem("benaUsers")) || [];

    const userExists = users.some(
      (user) =>
        typeof user?.email === "string" &&
        user.email.trim().toLowerCase() === trimmedEmail,
    );

    if (!userExists) {
      setErrors({
        email: "لا يوجد حساب مسجل بهذا البريد الإلكتروني",
      });

      showToast("الحساب غير موجود", "error");

      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      setErrors({});

      setEmail(trimmedEmail);

      setStep("password");

      showToast("تم العثور على الحساب", "success");
    }, 700);
  };

  /* RESET PASSWORD */

  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    if (isLoading) {
      return;
    }

    const newErrors = {};

    if (!password) {
      newErrors.password = "يرجى إدخال كلمة المرور الجديدة";
    } else if (password.length < 6) {
      newErrors.password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "يرجى تأكيد كلمة المرور";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "كلمتا المرور غير متطابقتين";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const users = JSON.parse(localStorage.getItem("benaUsers")) || [];

    const normalizedEmail = email.trim().toLowerCase();

    /* CHECK ACCOUNT */

    const userExists = users.some(
      (user) =>
        typeof user?.email === "string" &&
        user.email.trim().toLowerCase() === normalizedEmail,
    );

    if (!userExists) {
      showToast("لم يعد الحساب موجودًا", "error");

      setErrors({});

      setPassword("");

      setConfirmPassword("");

      setStep("email");

      return;
    }

    /* UPDATE PASSWORD */

    const updatedUsers = users.map((user) => {
      const userEmail =
        typeof user?.email === "string" ? user.email.trim().toLowerCase() : "";

      if (userEmail === normalizedEmail) {
        return {
          ...user,
          password,
        };
      }

      return user;
    });

    setIsLoading(true);

    setTimeout(() => {
      localStorage.setItem("benaUsers", JSON.stringify(updatedUsers));

      setIsLoading(false);

      showToast("تم تغيير كلمة المرور بنجاح ✓", "success");

      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 900);
    }, 700);
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
              <h1>
                {step === "email" ? "نسيت كلمة المرور؟" : "كلمة مرور جديدة"}
              </h1>

              <p>
                {step === "email"
                  ? "أدخل بريدك الإلكتروني للتأكد من حسابك"
                  : "أدخل كلمة مرور جديدة لحسابك"}
              </p>
            </div>

            {step === "email" ? (
              /* EMAIL FORM */

              <form
                className="auth-form"
                onSubmit={handleEmailSubmit}
                noValidate
              >
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
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);

                        setErrors({});
                      }}
                      placeholder="example@email.com"
                      autoComplete="email"
                      disabled={isLoading}
                    />
                  </div>

                  {errors.email && (
                    <span className="auth-error">{errors.email}</span>
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

                      <span>جاري التحقق...</span>
                    </>
                  ) : (
                    <>
                      <span>متابعة</span>

                      <ArrowLeft size={18} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* PASSWORD FORM */

              <form
                className="auth-form"
                onSubmit={handlePasswordSubmit}
                noValidate
              >
                {/* PASSWORD */}

                <div className="auth-field">
                  <label htmlFor="password">كلمة المرور الجديدة</label>

                  <div
                    className={`auth-input ${
                      errors.password ? "auth-input-error" : ""
                    }`}
                  >
                    <Lock size={18} />

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);

                        setErrors((current) => ({
                          ...current,
                          password: "",
                        }));
                      }}
                      placeholder="أدخل كلمة المرور الجديدة"
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
                </div>

                {/* CONFIRM PASSWORD */}

                <div className="auth-field">
                  <label htmlFor="confirmPassword">تأكيد كلمة المرور</label>

                  <div
                    className={`auth-input ${
                      errors.confirmPassword ? "auth-input-error" : ""
                    }`}
                  >
                    <KeyRound size={18} />

                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);

                        setErrors((current) => ({
                          ...current,
                          confirmPassword: "",
                        }));
                      }}
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

                {/* SUBMIT */}

                <button
                  type="submit"
                  className="auth-submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <LoaderCircle size={18} className="auth-loader" />

                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <>
                      <span>تغيير كلمة المرور</span>

                      <ArrowLeft size={18} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* LOGIN */}

            <p className="auth-login">
              تذكرت كلمة المرور؟
              <Link to="/login">العودة لتسجيل الدخول</Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default ForgotPassword;
