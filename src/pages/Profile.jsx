import { useState } from "react";
import { ArrowRight, UserRound, Mail, MapPin, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";

import "./Profile.css";

function Profile() {
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState(() => {
    return (
      JSON.parse(localStorage.getItem("benaProfile")) || {
        name: "مستخدم بينا",
        email: "user@example.com",
        phone: "",
        location: "قطاع غزة",
      }
    );
  });

  const saveProfile = () => {
    const name = profile.name.trim();
    const email = profile.email.trim();
    const phone = profile.phone.trim();
    const location = profile.location.trim();

    if (!name) {
      alert("يرجى إدخال الاسم");
      return;
    }

    if (!email) {
      alert("يرجى إدخال البريد الإلكتروني");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      alert("يرجى إدخال بريد إلكتروني صحيح");
      return;
    }

    const updatedProfile = {
      ...profile,
      name,
      email,
      phone,
      location: location || "قطاع غزة",
    };

    setProfile(updatedProfile);

    localStorage.setItem("benaProfile", JSON.stringify(updatedProfile));

    setIsEditing(false);
  };

  return (
    <main className="profile-page" dir="rtl">
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

          <button
            type="button"
            className="edit-profile-button"
            onClick={() => {
              if (isEditing) {
                saveProfile();
              } else {
                setIsEditing(true);
              }
            }}
          >
            {isEditing ? "حفظ البيانات" : "تعديل البيانات"}
          </button>
        </div>
      </div>
    </main>
  );
}

export default Profile;
