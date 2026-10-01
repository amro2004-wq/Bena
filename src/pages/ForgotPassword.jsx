import "./Auth.css";

import authMarketplace from "../assets/auth-marketplace.png";

import Toast from "../components/Toast";

import { Link, useNavigate } from "react-router-dom";

import { useEffect, useRef, useState } from "react";

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  PackagePlus,
  MessagesSquare,
  MapPinned,
  LoaderCircle,
  KeyRound,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

function ForgotPassword() {
  const navigate = useNavigate();

  const toastTimerRef = useRef(null);
  const actionTimersRef = useRef([]);

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
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast({
      show: true,
      message,
      type,
    });

    toastTimerRef.current = setTimeout(() => {
      setToast((current) => ({
        ...current,
        show: false,
      }));

      toastTimerRef.current = null;
    }, 2200);
  };

  /* TIMER */

  const addActionTimer = (callback, delay) => {
    const timerId = setTimeout(() => {
      actionTimersRef.current = actionTimersRef.current.filter(
        (currentTimerId) => currentTimerId !== timerId,
      );

      callback();
    }, delay);

    actionTimersRef.current.push(timerId);
  };

  /* CLEANUP */

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }

      actionTimersRef.current.forEach((timerId) => {
        clearTimeout(timerId);
      });

      actionTimersRef.current = [];
    };
  }, []);

  /* STORAGE */

  const getUsers = () => {
    try {
      const savedUsers = JSON.parse(localStorage.getItem("benaUsers"));

      return Array.isArray(savedUsers) ? savedUsers : [];
    } catch {
      return [];
    }
  };

  /* CHECK EMAIL */

  const handleEmailSubmit = (event) => {
    event.preventDefault();

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

    const users = getUsers();

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

    addActionTimer(() => {
      setIsLoading(false);
      setErrors({});
      setEmail(trimmedEmail);
      setStep("password");

      showToast("تم العثور على الحساب", "success");
    }, 700);
  };

  /* RESET PASSWORD */

  const handlePasswordSubmit = (event) => {
    event.preventDefault();

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

    const users = getUsers();
    const normalizedEmail = email.trim().toLowerCase();

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

    addActionTimer(() => {
      try {
        localStorage.setItem("benaUsers", JSON.stringify(updatedUsers));

        window.dispatchEvent(new Event("bena-users-updated"));

        setIsLoading(false);

        showToast("تم تغيير كلمة المرور بنجاح ✓", "success");

        addActionTimer(() => {
          navigate("/login", {
            replace: true,
          });
        }, 900);
      } catch {
        setIsLoading(false);

        showToast("تعذر تغيير كلمة المرور، حاول مرة أخرى", "error");
      }
    }, 700);
  };

  return (
    <main className="auth-page">
      <Toast show={toast.show} message={toast.message} type={toast.type} />

      <div className="auth-shell">
        {/* VISUAL */}

        <section className="auth-visual">
          <span className="auth-decor auth-decor-one"></span>
          <span className="auth-decor auth-decor-two"></span>
          <span className="auth-orange-circle"></span>

          <div className="auth-brand">
            <div className="auth-brand-name">بينا</div>

            <p>
              من الناس
              <span> ... </span>
              للناس
            </p>
          </div>

          <div className="auth-visual-content">
            <div className="auth-visual-badge">
              <Sparkles size={14} />
              <span>سوقك المحلي داخل غزة</span>
            </div>

            <div className="auth-visual-title">
              <h2>
                كل اللي بدك إياه
                <br />
                <span>موجود بينا.</span>
              </h2>

              <p>مكان واحد يجمع البيع والشراء والتواصل بسهولة.</p>
            </div>

            {/* BENEFITS */}

            <div className="auth-benefits">
              <div className="auth-benefit">
                <span className="auth-benefit-icon">
                  <PackagePlus />
                </span>

                <div className="auth-benefit-content">
                  <strong>بيع منتجاتك بسهولة</strong>
                  <small>اعرض منتجك ووصل للمشترين</small>
                </div>
              </div>

              <div className="auth-benefit">
                <span className="auth-benefit-icon">
                  <MessagesSquare />
                </span>

                <div className="auth-benefit-content">
                  <strong>تواصل مباشرة</strong>
                  <small>راسل البائع واتفق معه بسهولة</small>
                </div>
              </div>

              <div className="auth-benefit">
                <span className="auth-benefit-icon">
                  <MapPinned />
                </span>

                <div className="auth-benefit-content">
                  <strong>منتجات قريبة منك</strong>
                  <small>اكتشف المنتجات داخل قطاع غزة</small>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-marketplace">
            <img src={authMarketplace} alt="منصة بينا للبيع والشراء" />
          </div>
        </section>

        {/* FORM */}

        <section className="auth-form-side" dir="rtl">
          <div className="auth-form-content">
            <div className="auth-mobile-brand">
              <span>بينا</span>
              <small>من الناس... للناس</small>
            </div>

            <div className="auth-form-top">
              <div className="auth-form-icon">
                {step === "email" ? (
                  <KeyRound size={22} />
                ) : (
                  <ShieldCheck size={22} />
                )}
              </div>

              <div>
                <span>
                  {step === "email" ? "استعادة الحساب" : "تأمين حسابك"}
                </span>

                <small>
                  {step === "email"
                    ? "خطوة بسيطة للعودة إلى حسابك"
                    : "اختر كلمة مرور جديدة"}
                </small>
              </div>
            </div>

            <div className="auth-heading">
              <h1>
                {step === "email"
                  ? "نسيت كلمة المرور؟"
                  : "أنشئ كلمة مرور جديدة"}
              </h1>

              <p>
                {step === "email"
                  ? "أدخل البريد الإلكتروني المرتبط بحسابك على بينا."
                  : "اكتب كلمة مرور جديدة لحسابك ثم أكدها."}
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
                      onChange={(event) => {
                        setEmail(event.target.value);

                        setErrors((current) => ({
                          ...current,
                          email: "",
                        }));
                      }}
                      placeholder="example@email.com"
                      autoComplete="email"
                      disabled={isLoading}
                      dir="ltr"
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
                      onChange={(event) => {
                        setPassword(event.target.value);

                        setErrors((current) => ({
                          ...current,
                          password: "",
                        }));
                      }}
                      placeholder="6 أحرف على الأقل"
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
                      onChange={(event) => {
                        setConfirmPassword(event.target.value);

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
                      <span>حفظ كلمة المرور</span>
                      <ArrowLeft size={18} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* LOGIN */}

            <div className="auth-account-box">
              <div>
                <strong>
                  {step === "email"
                    ? "تذكرت كلمة المرور؟"
                    : "تريد استخدام بريد آخر؟"}
                </strong>

                <span>
                  {step === "email"
                    ? "ارجع وسجل دخولك إلى حسابك"
                    : "يمكنك الرجوع والتحقق من حساب آخر"}
                </span>
              </div>

              {step === "email" ? (
                <Link to="/login">
                  تسجيل الدخول
                  <ArrowLeft size={15} />
                </Link>
              ) : (
                <button
                  type="button"
                  className="auth-reset-back"
                  onClick={() => {
                    setStep("email");
                    setPassword("");
                    setConfirmPassword("");
                    setErrors({});
                  }}
                >
                  تغيير البريد
                  <ArrowLeft size={15} />
                </button>
              )}
            </div>

            <div className="auth-security-note">
              <ShieldCheck size={14} />
              <span>بيانات حسابك تستخدم فقط لتجربة منصة بينا.</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default ForgotPassword;
