import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { getAdminStats } from "@/api/admin";
import { LayoutDashboard, Users, Building2, Car, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => getAdminStats(token!),
    enabled: !!token,
    staleTime: 60_000,
  });

  const pendingCount = stats?.pendingVehicles ?? 0;

  const navItems = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true, badge: 0 },
    { to: "/admin/utilizadores", label: "Utilizadores", icon: Users, badge: 0 },
    { to: "/admin/oficinas", label: "Oficinas", icon: Building2, badge: 0 },
    { to: "/admin/viaturas", label: "Viaturas", icon: Car, badge: pendingCount },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="flex w-64 flex-col border-r bg-card">
        <div className="flex items-center gap-2 border-b px-6 py-5">
          <Shield className="h-5 w-5 text-accent" />
          <span className="font-semibold text-sm">Painel Admin</span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map(({ to, label, icon: Icon, end, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-accent/10 text-accent font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )
              }
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1">{label}</span>
              {badge > 0 && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white">
                  {badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t px-3 py-4">
          <div className="mb-3 px-3">
            <p className="text-xs font-medium text-foreground truncate">{user?.name ?? user?.email}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
