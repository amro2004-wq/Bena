import "./Auth.css";

import authMarketplace from "../assets/auth-marketplace.png";

import Toast from "../components/Toast";

import { Link, useNavigate } from "react-router-dom";

import { useEffect, useRef, useState } from "react";

import {
  UserRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  PackagePlus,
  MessagesSquare,
  MapPinned,
  LoaderCircle,
  UserPlus,
  Sparkles,
  ShieldCheck,
  Phone,
} from "lucide-react";

function Register() {
  const navigate = useNavigate();

  const toastTimerRef = useRef(null);
  const actionTimersRef = useRef([]);

  /* FORM */

  const [form, setForm] = useState({
    name: "",
    email: "",
    phonePrefix: "+970",
    phone: "",
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

  /* PHONE */

  const normalizeLocalPhone = (value) => {
    let digits = String(value || "").replace(/\D/g, "");

    if (digits.startsWith("0")) {
      digits = digits.slice(1);
    }

    return digits.slice(0, 9);
  };

  const buildFullPhone = (prefix, localPhone) => {
    const digits = normalizeLocalPhone(localPhone);

    if (!digits) {
      return "";
    }

    return `${prefix}${digits}`;
  };

  const normalizeFullPhone = (value) => {
    return String(value || "").replace(/\D/g, "");
  };

  const isValidPhone = (value) => {
    const digits = normalizeLocalPhone(value);

    return /^(59|56)\d{7}$/.test(digits);
  };

  /* CHANGE */

  const handleChange = (event) => {
    const { name, value } = event.target;

    let nextValue = value;

    if (name === "phone") {
      nextValue = normalizeLocalPhone(value);
    }

    setForm((current) => ({
      ...current,
      [name]: nextValue,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
      ...(name === "phonePrefix"
        ? {
            phone: "",
          }
        : {}),
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
    const phone = normalizeLocalPhone(form.phone);

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

    if (!phone) {
      newErrors.phone = "يرجى إدخال رقم واتساب";
    } else if (!isValidPhone(phone)) {
      newErrors.phone = "أدخل رقمًا صحيحًا يبدأ بـ 59 أو 56";
    }

    if (!["+970", "+972"].includes(form.phonePrefix)) {
      newErrors.phone = "يرجى اختيار مقدمة رقم صحيحة";
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

  /* STORAGE */

  const getUsers = () => {
    try {
      const savedUsers = JSON.parse(localStorage.getItem("benaUsers"));

      return Array.isArray(savedUsers) ? savedUsers : [];
    } catch {
      return [];
    }
  };

  /* REGISTER */

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

    const phone = buildFullPhone(form.phonePrefix, form.phone);

    const phoneDigits = normalizeFullPhone(phone);

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

    /* DUPLICATE PHONE */

    const phoneExists = users.some((user) => {
      if (!user?.phone) {
        return false;
      }

      return normalizeFullPhone(user.phone) === phoneDigits;
    });

    if (phoneExists) {
      setErrors((current) => ({
        ...current,
        phone: "يوجد حساب مسجل بهذا الرقم",
      }));

      showToast("رقم الهاتف مستخدم بالفعل", "error");

      return;
    }

    setIsLoading(true);

    /* NEW USER */

    const newUser = {
      id: Date.now(),
      name: form.name.trim(),
      email,
      phone,
      password: form.password,
      createdAt: new Date().toISOString(),
      role: "user",
    };

    const updatedUsers = [...users, newUser];

    addActionTimer(() => {
      try {
        localStorage.setItem("benaUsers", JSON.stringify(updatedUsers));

        window.dispatchEvent(new Event("bena-users-updated"));

        showToast("تم إنشاء الحساب بنجاح ✓", "success");

        addActionTimer(() => {
          navigate("/login", {
            replace: true,
          });
        }, 800);
      } catch {
        setIsLoading(false);

        showToast("تعذر إنشاء الحساب، حاول مرة أخرى", "error");
      }
    }, 600);
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
                <UserPlus size={22} />
              </div>

              <div>
                <span>انضم إلى بينا</span>

                <small>حساب واحد للبيع والشراء</small>
              </div>
            </div>

            <div className="auth-heading">
              <h1>ابدأ مع بينا</h1>

              <p>أنشئ حسابك وابدأ البيع والشراء داخل قطاع غزة.</p>
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
                    maxLength={80}
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
                    dir="ltr"
                  />
                </div>

                {errors.email && (
                  <span className="auth-error">{errors.email}</span>
                )}
              </div>

              {/* PHONE */}

              <div className="auth-field">
                <label htmlFor="phone">رقم واتساب</label>

                <div
                  className={`auth-phone-wrapper ${
                    errors.phone ? "auth-input-error" : ""
                  }`}
                  dir="ltr"
                >
                  <Phone size={18} className="auth-phone-icon" />

                  <select
                    name="phonePrefix"
                    value={form.phonePrefix}
                    onChange={handleChange}
                    className="auth-phone-prefix"
                    disabled={isLoading}
                    aria-label="مقدمة رقم الهاتف"
                    dir="ltr"
                  >
                    <option value="+970">+970</option>

                    <option value="+972">+972</option>
                  </select>

                  <span className="auth-phone-divider"></span>

                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="597227016"
                    autoComplete="tel"
                    inputMode="numeric"
                    maxLength={9}
                    disabled={isLoading}
                    dir="ltr"
                  />
                </div>

                <span className="auth-phone-hint">
                  اختر المقدمة ثم أدخل رقم الجوال بدون الصفر الأول
                </span>

                {errors.phone && (
                  <span className="auth-error">{errors.phone}</span>
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

              <div className="auth-terms-wrapper">
                <label className="auth-terms">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    disabled={isLoading}
                    onChange={(event) => {
                      setAcceptedTerms(event.target.checked);

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

            {/* LOGIN */}

            <div className="auth-account-box">
              <div>
                <strong>عندك حساب بالفعل؟</strong>

                <span>سجل دخولك وكمل من مكانك</span>
              </div>

              <Link to="/login">
                تسجيل الدخول
                <ArrowLeft size={15} />
              </Link>
            </div>

            <div className="auth-security-note">
              <ShieldCheck size={14} />

              <span>حساب واحد يتيح لك البيع والشراء على بينا.</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Register;
