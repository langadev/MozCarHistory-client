import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard, Wrench, Search, LogOut, Wrench as WrenchIcon, KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/mecanico/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/mecanico/registar-servico", label: "Registar Serviço", icon: Wrench },
  { to: "/consulta", label: "Consultar Histórico", icon: Search },
  { to: "/alterar-senha", label: "Alterar Senha", icon: KeyRound },
];

const MechanicLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="flex w-64 flex-shrink-0 flex-col border-r bg-card">
        <div className="flex items-center gap-2 border-b px-6 py-5">
          <WrenchIcon className="h-5 w-5 text-accent" />
          <span className="font-semibold text-sm">Moz Car History</span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map(({ to, label, icon: Icon, end }) => (
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
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t px-3 py-4">
          <div className="mb-3 px-3">
            <p className="text-xs font-medium text-foreground truncate">{user?.name ?? user?.email}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            <p className="text-xs text-accent/70 font-medium mt-0.5">Mecânico</p>
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

export default MechanicLayout;
