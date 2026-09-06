import { Navigate } from "react-router-dom";

function PublicRoute({ children }) {
  const currentUser = JSON.parse(localStorage.getItem("benaCurrentUser"));

  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default PublicRoute;
