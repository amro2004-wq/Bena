import { Navigate, useLocation } from "react-router-dom";

function AdminRoute({ children }) {
  const location = useLocation();

  /* CURRENT USER */

  let currentUser = null;

  try {
    const savedUser = localStorage.getItem("benaCurrentUser");

    const parsedUser = savedUser ? JSON.parse(savedUser) : null;

    if (
      parsedUser &&
      typeof parsedUser === "object" &&
      !Array.isArray(parsedUser)
    ) {
      currentUser = parsedUser;
    }
  } catch {
    currentUser = null;
  }

  /* LOGIN CHECK */

  if (!currentUser) {
    const from = location.pathname + location.search + location.hash;

    return <Navigate to="/login" replace state={{ from }} />;
  }

  /* ADMIN CHECK */

  const role = String(currentUser.role || "")
    .trim()
    .toLowerCase();

  if (role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRoute;
