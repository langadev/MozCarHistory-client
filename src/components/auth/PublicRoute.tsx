import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const PublicRoute = ({ children, redirectTo }: PublicRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (isAuthenticated) {
    const destination = redirectTo ?? (user?.role === "oficina" ? "/dashboard" : "/consulta");
    return <Navigate to={destination} replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
