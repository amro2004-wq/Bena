import { useState } from "react";
import { ArrowRight, UserRound, Mail, MapPin, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Toast from "../components/Toast";

import "./Profile.css";

function Profile() {
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("benaCurrentUser"));

  const savedProfiles = JSON.parse(localStorage.getItem("benaProfiles")) || {};

  const savedProfile = savedProfiles[currentUser?.id] || {};

  const initialProfile = {
    name: currentUser?.name || "مستخدم بينا",
    email: currentUser?.email || "",
    phone: savedProfile.phone || "",
    location: savedProfile.location || "قطاع غزة",
  };

  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState(initialProfile);

  const [originalProfile, setOriginalProfile] = useState(initialProfile);

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

  const startEditing = () => {
    setOriginalProfile(profile);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setProfile(originalProfile);
    setIsEditing(false);
  };

  const saveProfile = () => {
    const name = profile.name.trim();

    const email = profile.email.trim().toLowerCase();

    const phone = profile.phone.trim();

    const location = profile.location.trim();

    if (!name) {
      showToast("يرجى إدخال الاسم", "error");

      return;
    }

    if (name.length < 3) {
      showToast("الاسم يجب أن يكون 3 أحرف على الأقل", "error");

      return;
    }

    if (!email) {
      showToast("يرجى إدخال البريد الإلكتروني", "error");

      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      showToast("يرجى إدخال بريد إلكتروني صحيح", "error");

      return;
    }

    const users = JSON.parse(localStorage.getItem("benaUsers")) || [];

    const emailExists = users.some(
      (user) =>
        user.id !== currentUser.id && user.email.toLowerCase() === email,
    );

    if (emailExists) {
      showToast("البريد الإلكتروني مستخدم من حساب آخر", "error");

      return;
    }

    const updatedUsers = users.map((user) =>
      user.id === currentUser.id
        ? {
            ...user,
            name,
            email,
          }
        : user,
    );

    localStorage.setItem("benaUsers", JSON.stringify(updatedUsers));

    const updatedCurrentUser = {
      ...currentUser,
      name,
      email,
    };

    localStorage.setItem("benaCurrentUser", JSON.stringify(updatedCurrentUser));

    const updatedProfile = {
      name,
      email,
      phone,
      location: location || "قطاع غزة",
    };

    const updatedProfiles = {
      ...savedProfiles,

      [currentUser.id]: {
        phone,
        location: location || "قطاع غزة",
      },
    };

    localStorage.setItem("benaProfiles", JSON.stringify(updatedProfiles));

    setProfile(updatedProfile);
    setOriginalProfile(updatedProfile);

    setIsEditing(false);

    showToast("تم حفظ بيانات الحساب بنجاح ✓", "success");
  };

  return (
    <main className="profile-page" dir="rtl">
      <Toast show={toast.show} message={toast.message} type={toast.type} />

      <div className="profile-container">
        <button
          type="button"
          className="profile-back"
          onClick={() => navigate("/")}
        >
          <ArrowRight size={18} />
          العودة للرئيسية
        </button>

        <div className="profile-heading">
          <span>حسابك على بينا</span>

          <h1>حسابي</h1>

          <p>إدارة معلومات حسابك وبياناتك الشخصية.</p>
        </div>

        <div className="profile-card">
          <div className="profile-avatar">
            <UserRound size={42} strokeWidth={1.5} />
          </div>

          <div className="profile-user">
            {isEditing ? (
              <input
                type="text"
                value={profile.name}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    name: e.target.value,
                  })
                }
                placeholder="الاسم"
                className="profile-input"
              />
            ) : (
              <h2>{profile.name}</h2>
            )}

            <p>عضو في منصة بينا</p>
          </div>

          <div className="profile-details">
            <div className="profile-detail">
              <Mail size={19} />

              <div>
                <span>البريد الإلكتروني</span>

                {isEditing ? (
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        email: e.target.value,
                      })
                    }
                    placeholder="البريد الإلكتروني"
                    className="profile-input"
                  />
                ) : (
                  <strong>{profile.email}</strong>
                )}
              </div>
            </div>

            <div className="profile-detail">
              <Phone size={19} />

              <div>
                <span>رقم الهاتف</span>

                {isEditing ? (
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        phone: e.target.value,
                      })
                    }
                    placeholder="أدخل رقم الهاتف"
                    className="profile-input"
                  />
                ) : (
                  <strong>{profile.phone || "غير مضاف"}</strong>
                )}
              </div>
            </div>

            <div className="profile-detail">
              <MapPin size={19} />

              <div>
                <span>الموقع</span>

                {isEditing ? (
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        location: e.target.value,
                      })
                    }
                    placeholder="الموقع"
                    className="profile-input"
                  />
                ) : (
                  <strong>{profile.location}</strong>
                )}
              </div>
            </div>
          </div>

          <div className="profile-actions">
            {isEditing && (
              <button
                type="button"
                className="cancel-profile-button"
                onClick={cancelEditing}
              >
                إلغاء
              </button>
            )}

            <button
              type="button"
              className="edit-profile-button"
              onClick={() => {
                if (isEditing) {
                  saveProfile();
                } else {
                  startEditing();
                }
              }}
            >
              {isEditing ? "حفظ البيانات" : "تعديل البيانات"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Profile;
