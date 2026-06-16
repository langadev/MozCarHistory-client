import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { getUnreadCount } from "@/api/messages";
import {
  LayoutDashboard, Car, Wrench, Search, Grid3X3, User, LogOut, Shield,
  UserCog, AlertTriangle, Menu, List, ClipboardList, MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const WorkshopLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout, token } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["unread-count"],
    queryFn: () => getUnreadCount(token!),
    enabled: !!token,
    refetchInterval: 30_000,
  });

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true, badge: 0 },
    { to: "/registar-viatura", label: "Registar Viatura", icon: Car, badge: 0 },
    { to: "/minhas-viaturas", label: "As Minhas Viaturas", icon: List, badge: 0 },
    { to: "/registar-servico", label: "Registar Serviço", icon: Wrench, badge: 0 },
    { to: "/meus-registos", label: "Os Meus Registos", icon: ClipboardList, badge: 0 },
    { to: "/mecanicos", label: "Mecânicos", icon: UserCog, badge: 0 },
    { to: "/mensagens", label: "Mensagens", icon: MessageSquare, badge: unreadCount },
    { to: "/veiculos", label: "Catálogo", icon: Grid3X3, badge: 0 },
    { to: "/consulta", label: "Consultar Histórico", icon: Search, badge: 0 },
    { to: "/perfil-oficina", label: "Perfil da Oficina", icon: User, badge: 0 },
  ];

  const NavContent = ({ onNav }: { onNav?: () => void }) => (
    <>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ to, label, icon: Icon, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNav}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-accent/10 text-accent font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1">{label}</span>
            {badge > 0 && (
              <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-bold text-accent-foreground">
                {badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t px-3 py-4">
        <div className="mb-3 px-3">
          <p className="text-xs font-medium text-foreground truncate">{user?.name ?? user?.email}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
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
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 flex-col border-r bg-card">
        <Link to="/" className="flex items-center gap-2 border-b px-6 py-5 hover:bg-muted/50 transition-colors">
          <Shield className="h-5 w-5 text-accent" />
          <span className="font-semibold text-sm">Moz Car History</span>
        </Link>
        <NavContent />
      </aside>

      {/* Mobile layout */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="flex lg:hidden items-center gap-3 border-b bg-card px-4 py-3 shrink-0">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 flex flex-col">
              <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 border-b px-6 py-5 hover:bg-muted/50 transition-colors">
                <Shield className="h-5 w-5 text-accent" />
                <span className="font-semibold text-sm">Moz Car History</span>
              </Link>
              <NavContent onNav={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Shield className="h-4 w-4 text-accent" />
            <span className="font-semibold text-sm">Moz Car History</span>
          </Link>
        </header>

        {/* Verified warning banner */}
        {user?.verified === false && (
          <div className="flex items-start gap-3 bg-amber-50 border-b border-amber-200 px-5 py-3 text-amber-800 shrink-0">
            <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0 text-amber-500" />
            <div className="text-sm">
              <span className="font-semibold">Conta não verificada.</span>{" "}
              Não é possível registar viaturas nem serviços enquanto a sua oficina não for verificada pelo administrador.
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default WorkshopLayout;
