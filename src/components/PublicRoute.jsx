import { Navigate } from "react-router-dom";

function PublicRoute({ children }) {
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

  /* AUTH CHECK */

  if (currentUser) {
    const role = String(currentUser.role || "")
      .trim()
      .toLowerCase();

    if (role === "admin") {
      return <Navigate to="/admin" replace />;
    }

    return <Navigate to="/" replace />;
  }

  return children;
}

export default PublicRoute;
