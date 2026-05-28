import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import type { UserRole } from "../types";
import { useAuthStore, type AuthState } from "../store/authStore";

export default function ProtectedRoute({ children, roles }: { children: ReactNode; roles?: UserRole[] }) {
  const user = useAuthStore((state: AuthState) => state.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
