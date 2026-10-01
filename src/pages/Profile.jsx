import "./Profile.css";

import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  UserRound,
  Mail,
  MapPin,
  Phone,
  Save,
  Pencil,
  X,
} from "lucide-react";

import Toast from "../components/Toast";

function Profile() {
  const navigate = useNavigate();

  const toastTimerRef = useRef(null);

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

  /* PHONE HELPERS */

  const normalizePhoneDigits = (value) => {
    return String(value || "").replace(/\D/g, "");
  };

  const normalizeLocalPhone = (value) => {
    let digits = normalizePhoneDigits(value);

    if (digits.startsWith("970") || digits.startsWith("972")) {
      digits = digits.slice(3);
    }

    if (digits.startsWith("0")) {
      digits = digits.slice(1);
    }

    return digits.slice(0, 9);
  };

  const getPhonePrefix = (value) => {
    const rawValue = String(value || "").trim();
    const digits = normalizePhoneDigits(rawValue);

    if (
      rawValue.startsWith("+972") ||
      rawValue.startsWith("00972") ||
      digits.startsWith("972")
    ) {
      return "+972";
    }

    return "+970";
  };

  const splitPhone = (value) => {
    if (!value) {
      return {
        phonePrefix: "+970",
        phone: "",
      };
    }

    return {
      phonePrefix: getPhonePrefix(value),
      phone: normalizeLocalPhone(value),
    };
  };

  const buildFullPhone = (prefix, localPhone) => {
    const phone = normalizeLocalPhone(localPhone);

    if (!phone) {
      return "";
    }

    return `${prefix}${phone}`;
  };

  const isValidPhone = (value) => {
    const phone = normalizeLocalPhone(value);

    return /^(59|56)\d{7}$/.test(phone);
  };

  /* SAVED PROFILE */

  const getSavedProfile = useCallback(
    (targetUserId) => {
      if (!targetUserId) {
        return {};
      }

      const profiles = readStorage("benaProfiles", {});

      if (
        !profiles ||
        typeof profiles !== "object" ||
        Array.isArray(profiles)
      ) {
        return {};
      }

      const savedProfile = profiles[String(targetUserId)];

      if (
        !savedProfile ||
        typeof savedProfile !== "object" ||
        Array.isArray(savedProfile)
      ) {
        return {};
      }

      return savedProfile;
    },
    [readStorage],
  );

  /* CREATE PROFILE */

  const createProfile = useCallback(
    (user) => {
      if (!user || user.id === undefined || user.id === null) {
        return {
          name: "مستخدم بينا",
          email: "",
          phonePrefix: "+970",
          phone: "",
          location: "قطاع غزة",
        };
      }

      const savedProfile = getSavedProfile(String(user.id));

      const savedPhone = savedProfile.phone || user.phone || "";

      const phoneData = splitPhone(savedPhone);

      return {
        name: user.name || "مستخدم بينا",
        email: user.email || "",
        phonePrefix: phoneData.phonePrefix,
        phone: phoneData.phone,
        location: savedProfile.location || user.location || "قطاع غزة",
      };
    },
    [getSavedProfile],
  );

  /* STATE */

  const [profile, setProfile] = useState(() => createProfile(getCurrentUser()));

  const [originalProfile, setOriginalProfile] = useState(() =>
    createProfile(getCurrentUser()),
  );

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  /* TOAST */

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = useCallback((message, type = "success") => {
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
  }, []);

  /* REFRESH */

  const refreshProfile = useCallback(() => {
    const latestUser = getCurrentUser();

    setCurrentUser(latestUser);

    const latestProfile = createProfile(latestUser);

    setProfile(latestProfile);
    setOriginalProfile(latestProfile);
    setIsEditing(false);
  }, [getCurrentUser, createProfile]);

  /* EVENTS */

  useEffect(() => {
    const handleStorage = (event) => {
      if (
        !event.key ||
        event.key === "benaCurrentUser" ||
        event.key === "benaUsers" ||
        event.key === "benaProfiles"
      ) {
        refreshProfile();
      }
    };

    const handleUsersUpdated = () => {
      refreshProfile();
    };

    const handleProfilesUpdated = () => {
      refreshProfile();
    };

    window.addEventListener("storage", handleStorage);

    window.addEventListener("bena-users-updated", handleUsersUpdated);

    window.addEventListener("bena-profiles-updated", handleProfilesUpdated);

    return () => {
      window.removeEventListener("storage", handleStorage);

      window.removeEventListener("bena-users-updated", handleUsersUpdated);

      window.removeEventListener(
        "bena-profiles-updated",
        handleProfilesUpdated,
      );

      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, [refreshProfile]);

  /* START EDIT */

  const startEditing = () => {
    setOriginalProfile({
      ...profile,
    });

    setIsEditing(true);
  };

  /* CANCEL EDIT */

  const cancelEditing = () => {
    setProfile({
      ...originalProfile,
    });

    setIsEditing(false);
  };

  /* CHANGE */

  const handleChange = (event) => {
    const { name, value } = event.target;

    let nextValue = value;

    if (name === "phone") {
      nextValue = normalizeLocalPhone(value);
    }

    setProfile((current) => ({
      ...current,
      [name]: nextValue,
    }));
  };

  /* SAVE */

  const saveProfile = () => {
    if (isSaving) {
      return;
    }

    if (!currentUser || !userId) {
      showToast("سجل دخولك أولاً", "error");

      setTimeout(() => {
        navigate("/login", {
          state: {
            from: "/profile",
          },
        });
      }, 650);

      return;
    }

    const name = String(profile.name || "").trim();

    const email = String(profile.email || "")
      .trim()
      .toLowerCase();

    const phonePrefix = ["+970", "+972"].includes(profile.phonePrefix)
      ? profile.phonePrefix
      : "+970";

    const localPhone = normalizeLocalPhone(profile.phone);

    const phone = buildFullPhone(phonePrefix, localPhone);

    const location = String(profile.location || "").trim();

    /* NAME */

    if (!name) {
      showToast("يرجى إدخال الاسم", "error");

      return;
    }

    if (name.length < 3) {
      showToast("الاسم يجب أن يكون 3 أحرف على الأقل", "error");

      return;
    }

    if (name.length > 80) {
      showToast("الاسم طويل جدًا", "error");

      return;
    }

    /* EMAIL */

    if (!email) {
      showToast("يرجى إدخال البريد الإلكتروني", "error");

      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      showToast("يرجى إدخال بريد إلكتروني صحيح", "error");

      return;
    }

    /* PHONE */

    if (!localPhone) {
      showToast("يرجى إدخال رقم واتساب", "error");

      return;
    }

    if (!isValidPhone(localPhone)) {
      showToast("أدخل رقمًا صحيحًا يبدأ بـ 59 أو 56", "error");

      return;
    }

    /* USERS */

    const storedUsers = readStorage("benaUsers", []);

    const users = Array.isArray(storedUsers) ? storedUsers : [];

    /* EMAIL EXISTS */

    const emailExists = users.some((user) => {
      if (!user || typeof user !== "object" || Array.isArray(user)) {
        return false;
      }

      const differentUser = String(user.id) !== userId;

      const sameEmail =
        String(user.email || "")
          .trim()
          .toLowerCase() === email;

      return differentUser && sameEmail;
    });

    if (emailExists) {
      showToast("البريد الإلكتروني مستخدم من حساب آخر", "error");

      return;
    }

    /* PHONE EXISTS */

    const phoneDigits = normalizePhoneDigits(phone);

    const phoneExists = users.some((user) => {
      if (!user || typeof user !== "object" || Array.isArray(user)) {
        return false;
      }

      const differentUser = String(user.id) !== userId;

      const savedPhoneDigits = normalizePhoneDigits(user.phone);

      return (
        differentUser && savedPhoneDigits && savedPhoneDigits === phoneDigits
      );
    });

    if (phoneExists) {
      showToast("رقم واتساب مستخدم من حساب آخر", "error");

      return;
    }

    setIsSaving(true);

    try {
      /* UPDATE USERS */

      const updatedUsers = users.map((user) => {
        if (!user || String(user.id) !== userId) {
          return user;
        }

        return {
          ...user,
          name,
          email,
          phone,
        };
      });

      localStorage.setItem("benaUsers", JSON.stringify(updatedUsers));

      /* CURRENT USER */

      const updatedCurrentUser = {
        ...currentUser,
        name,
        email,
        phone,
      };

      localStorage.setItem(
        "benaCurrentUser",
        JSON.stringify(updatedCurrentUser),
      );

      /* PROFILE */

      const finalLocation = location || "قطاع غزة";

      const storedProfiles = readStorage("benaProfiles", {});

      const profiles =
        storedProfiles &&
        typeof storedProfiles === "object" &&
        !Array.isArray(storedProfiles)
          ? storedProfiles
          : {};

      const updatedProfiles = {
        ...profiles,

        [userId]: {
          ...(profiles[userId] || {}),
          phone,
          location: finalLocation,
        },
      };

      localStorage.setItem("benaProfiles", JSON.stringify(updatedProfiles));

      /* UPDATE STATE */

      const updatedProfile = {
        name,
        email,
        phonePrefix,
        phone: localPhone,
        location: finalLocation,
      };

      setCurrentUser(updatedCurrentUser);

      setProfile(updatedProfile);

      setOriginalProfile(updatedProfile);

      setIsEditing(false);

      /* EVENTS */

      window.dispatchEvent(new Event("bena-users-updated"));

      window.dispatchEvent(new Event("bena-profiles-updated"));

      showToast("تم حفظ بيانات الحساب بنجاح ✓", "success");
    } catch {
      showToast("حدث خطأ أثناء حفظ البيانات", "error");
    } finally {
      setIsSaving(false);
    }
  };

  /* NOT LOGGED IN */

  if (!currentUser || !userId) {
    return (
      <main className="profile-page" dir="rtl">
        <div className="profile-login-required">
          <div className="profile-login-icon">
            <UserRound size={38} strokeWidth={1.5} />
          </div>

          <h2>سجل دخولك أولاً</h2>

          <p>يجب تسجيل الدخول للوصول إلى بيانات حسابك.</p>

          <button
            type="button"
            onClick={() =>
              navigate("/login", {
                state: {
                  from: "/profile",
                },
              })
            }
          >
            تسجيل الدخول
          </button>
        </div>
      </main>
    );
  }

  /* DISPLAY PHONE */

  const fullPhone = buildFullPhone(profile.phonePrefix, profile.phone);

  return (
    <main className="profile-page" dir="rtl">
      <Toast show={toast.show} message={toast.message} type={toast.type} />

      <div className="profile-container">
        {/* BACK */}

        <button
          type="button"
          className="profile-back"
          onClick={() => navigate("/")}
        >
          <ArrowRight size={19} />

          <span>العودة للرئيسية</span>
        </button>

        {/* HEADING */}

        <div className="profile-heading">
          <span>حسابك على بينا</span>

          <h1>حسابي</h1>

          <p>إدارة معلومات حسابك وبياناتك الشخصية.</p>
        </div>

        {/* CARD */}

        <div className="profile-card">
          {/* USER */}

          <div className="profile-user-section">
            <div className="profile-avatar">
              <UserRound size={42} strokeWidth={1.5} />
            </div>

            <div className="profile-user">
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  placeholder="الاسم"
                  className="profile-input profile-name-input"
                  maxLength={80}
                  autoComplete="name"
                  disabled={isSaving}
                />
              ) : (
                <h2>{profile.name || "مستخدم بينا"}</h2>
              )}

              <p>عضو في منصة بينا</p>
            </div>
          </div>

          {/* DETAILS */}

          <div className="profile-details">
            {/* EMAIL */}

            <div className="profile-detail">
              <div className="profile-detail-icon">
                <Mail size={19} />
              </div>

              <div className="profile-detail-content">
                <span>البريد الإلكتروني</span>

                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    placeholder="البريد الإلكتروني"
                    className="profile-input"
                    maxLength={120}
                    autoComplete="email"
                    disabled={isSaving}
                    dir="ltr"
                  />
                ) : (
                  <strong dir="ltr">{profile.email || "غير مضاف"}</strong>
                )}
              </div>
            </div>

            {/* PHONE */}

            <div className="profile-detail">
              <div className="profile-detail-icon">
                <Phone size={19} />
              </div>

              <div className="profile-detail-content">
                <span>رقم واتساب</span>

                {isEditing ? (
                  <div className="profile-phone-wrapper" dir="ltr">
                    <select
                      name="phonePrefix"
                      value={profile.phonePrefix}
                      onChange={handleChange}
                      className="profile-phone-prefix"
                      disabled={isSaving}
                      aria-label="مقدمة رقم الهاتف"
                      dir="ltr"
                    >
                      <option value="+970">+970</option>

                      <option value="+972">+972</option>
                    </select>

                    <span className="profile-phone-divider"></span>

                    <input
                      type="tel"
                      name="phone"
                      value={profile.phone}
                      onChange={handleChange}
                      placeholder="597227016"
                      className="profile-phone-input"
                      maxLength={9}
                      inputMode="numeric"
                      autoComplete="tel"
                      disabled={isSaving}
                      dir="ltr"
                    />
                  </div>
                ) : (
                  <strong dir="ltr" className="profile-phone-value">
                    {fullPhone || "غير مضاف"}
                  </strong>
                )}

                {isEditing && (
                  <small className="profile-phone-hint">
                    أدخل رقم الجوال بدون الصفر الأول
                  </small>
                )}
              </div>
            </div>

            {/* LOCATION */}

            <div className="profile-detail">
              <div className="profile-detail-icon">
                <MapPin size={19} />
              </div>

              <div className="profile-detail-content">
                <span>الموقع</span>

                {isEditing ? (
                  <select
                    name="location"
                    value={profile.location}
                    onChange={handleChange}
                    className="profile-input profile-select"
                    disabled={isSaving}
                  >
                    <option value="قطاع غزة">قطاع غزة</option>

                    <option value="غزة">غزة</option>

                    <option value="شمال غزة">شمال غزة</option>

                    <option value="دير البلح">دير البلح</option>

                    <option value="خان يونس">خان يونس</option>

                    <option value="رفح">رفح</option>
                  </select>
                ) : (
                  <strong>{profile.location || "قطاع غزة"}</strong>
                )}
              </div>
            </div>
          </div>

          {/* ACTIONS */}

          <div className="profile-actions">
            {isEditing ? (
              <>
                <button
                  type="button"
                  className="cancel-profile-button"
                  onClick={cancelEditing}
                  disabled={isSaving}
                >
                  <X size={17} />

                  <span>إلغاء</span>
                </button>

                <button
                  type="button"
                  className="edit-profile-button"
                  onClick={saveProfile}
                  disabled={isSaving}
                >
                  <Save size={17} />

                  <span>{isSaving ? "جاري الحفظ..." : "حفظ البيانات"}</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                className="edit-profile-button"
                onClick={startEditing}
              >
                <Pencil size={17} />

                <span>تعديل البيانات</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default Profile;
