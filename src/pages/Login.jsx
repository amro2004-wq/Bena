import "./Auth.css";

import authMarketplace from "../assets/auth-marketplace.png";

import Toast from "../components/Toast";

import { Link, useLocation, useNavigate } from "react-router-dom";

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
  ShieldCheck,
  Sparkles,
} from "lucide-react";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const toastTimerRef = useRef(null);
  const actionTimersRef = useRef([]);

  /* REDIRECT */

  const redirectPath =
    typeof location.state?.from === "string" &&
    location.state.from.startsWith("/") &&
    !location.state.from.startsWith("//")
      ? location.state.from
      : "/";

  /* FORM */

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
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

  /* CHANGE */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));
  };

  /* VALIDATION */

  const validateForm = () => {
    const newErrors = {};

    const email = form.email.trim().toLowerCase();
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

  /* STORAGE */

  const getUsers = () => {
    try {
      const savedUsers = JSON.parse(localStorage.getItem("benaUsers"));

      return Array.isArray(savedUsers) ? savedUsers : [];
    } catch {
      return [];
    }
  };

  /* LOGIN */

  const handleSubmit = (event) => {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    const users = getUsers();
    const email = form.email.trim().toLowerCase();

    const user = users.find(
      (item) =>
        typeof item?.email === "string" &&
        item.email.trim().toLowerCase() === email,
    );

    /* USER NOT FOUND */

    if (!user) {
      setErrors((current) => ({
        ...current,
        email: "لا يوجد حساب مسجل بهذا البريد الإلكتروني",
      }));

      showToast("الحساب غير موجود", "error");

      return;
    }

    /* WRONG PASSWORD */

    if (user.password !== form.password) {
      setErrors((current) => ({
        ...current,
        password: "كلمة المرور غير صحيحة",
      }));

      showToast("كلمة المرور غير صحيحة", "error");

      return;
    }

    setIsLoading(true);

    /* CURRENT USER */

    const currentUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || "user",
      createdAt: user.createdAt,
    };

    addActionTimer(() => {
      try {
        localStorage.setItem("benaCurrentUser", JSON.stringify(currentUser));

        window.dispatchEvent(new Event("bena-users-updated"));

        showToast(`أهلاً ${user.name} 👋`, "success");

        addActionTimer(() => {
          navigate(redirectPath, {
            replace: true,
          });
        }, 700);
      } catch {
        setIsLoading(false);

        showToast("تعذر تسجيل الدخول، حاول مرة أخرى", "error");
      }
    }, 500);
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
                <ShieldCheck size={22} />
              </div>

              <div>
                <span>مرحبًا من جديد</span>
                <small>سعداء بعودتك إلى بينا</small>
              </div>
            </div>

            <div className="auth-heading">
              <h1>أهلاً بعودتك</h1>
              <p>سجّل دخولك للمتابعة إلى حسابك على بينا.</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
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
                    dir="ltr"
                  />
                </div>

                {errors.email && (
                  <span className="auth-error">{errors.email}</span>
                )}
              </div>

              {/* PASSWORD */}

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

              {/* SUBMIT */}

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

            {/* REGISTER */}

            <div className="auth-account-box">
              <div>
                <strong>جديد على بينا؟</strong>
                <span>أنشئ حسابك وابدأ البيع والشراء</span>
              </div>

              <Link to="/register">
                إنشاء حساب
                <ArrowLeft size={15} />
              </Link>
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

export default Login;
