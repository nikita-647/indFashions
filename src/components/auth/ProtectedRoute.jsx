import { Navigate, useLocation } from "react-router-dom";

// Wrap any layout/route with this to require a logged-in admin.
// Looks for the token that SignIn.jsx stores in localStorage.
export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("token");

  if (!token) {
    return (
      <Navigate to="/auth/sign-in" replace state={{ from: location }} />
    );
  }

  return children;
}
