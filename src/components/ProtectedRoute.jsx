import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children }) {
  const location = useLocation();

  const currentUser = JSON.parse(localStorage.getItem("benaCurrentUser"));

  if (!currentUser) {
    const from = location.pathname + location.search;

    return <Navigate to="/login" replace state={{ from }} />;
  }

  return children;
}

export default ProtectedRoute;
