import { useNavigate } from "react-router-dom";
import { Home, ArrowRight, SearchX } from "lucide-react";

import "./NotFound.css";

function NotFound() {
  const navigate = useNavigate();

  return (
    <main className="not-found-page">
      <div className="not-found-card">
        <div className="not-found-icon">
          <SearchX size={42} />
        </div>

        <span className="not-found-code">404</span>

        <h1>الصفحة غير موجودة</h1>

        <p>
          الرابط الذي تحاول الوصول إليه غير موجود أو ربما تم نقله إلى مكان آخر.
        </p>

        <div className="not-found-actions">
          <button
            type="button"
            className="not-found-home"
            onClick={() => navigate("/")}
          >
            <Home size={18} />
            <span>العودة للرئيسية</span>
          </button>

          <button
            type="button"
            className="not-found-back"
            onClick={() => navigate(-1)}
          >
            <ArrowRight size={18} />
            <span>الرجوع للخلف</span>
          </button>
        </div>
      </div>
    </main>
  );
}

export default NotFound;
