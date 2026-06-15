import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const RequirePasswordChange = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.mustChangePassword) return <Navigate to="/alterar-senha" replace />;

  return <>{children}</>;
};

export default RequirePasswordChange;
