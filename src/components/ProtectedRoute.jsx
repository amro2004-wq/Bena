import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children }) {
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

  /* AUTH CHECK */

  if (!currentUser) {
    const from = location.pathname + location.search + location.hash;

    return <Navigate to="/login" replace state={{ from }} />;
  }

  return children;
}

export default ProtectedRoute;
