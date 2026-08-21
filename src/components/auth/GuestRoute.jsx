import { Navigate } from "react-router-dom";

// Wrap the auth layout with this so a logged-in admin who lands on
// /auth/sign-in (or any auth page) is bounced straight to the dashboard.
export default function GuestRoute({ children }) {
  const token = localStorage.getItem("token");

  if (token) {
    return <Navigate to="/admin/default" replace />;
  }

  return children;
}
