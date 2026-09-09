import { Navigate, useLocation } from "react-router-dom";

function AdminRoute({ children }) {
  const location = useLocation();

  /* CURRENT USER */

  let currentUser = null;

  try {
    currentUser = JSON.parse(localStorage.getItem("benaCurrentUser"));
  } catch {
    currentUser = null;
  }

  /* LOGIN CHECK */

  if (!currentUser) {
    const from = location.pathname + location.search;

    return <Navigate to="/login" replace state={{ from }} />;
  }

  /* ADMIN CHECK */

  if (currentUser.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRoute;
