import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Shield, Menu, X, LogOut, ChevronDown, LayoutDashboard, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

const PUBLIC_LINKS = [
  { to: "/consulta", label: "Consultar" },
  { to: "/veiculos", label: "Veículos" },
];

const LANDING_ANCHORS = [
  { href: "#problema", label: "Problema" },
  { href: "#solucao", label: "Solução" },
  { href: "#como-funciona", label: "Como Funciona" },
];

const UserAvatar = ({ name, email }: { name?: string | null; email?: string }) => {
  const initial = (name ?? email ?? "U")[0].toUpperCase();
  return (
    <div className="h-7 w-7 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
      <span className="text-xs font-semibold text-accent">{initial}</span>
    </div>
  );
};

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const isLanding = location.pathname === "/";
  const isDark = isLanding && !isAuthenticated;

  const dashboardPath = user?.role === "admin" ? "/admin" : user?.role === "oficina" ? "/dashboard" : null;

  const close = () => setMobileOpen(false);

  const anchorClass = isDark
    ? "text-sm text-navy-foreground/70 hover:text-navy-foreground transition-colors"
    : "text-sm text-muted-foreground hover:text-foreground transition-colors";

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "text-sm transition-colors",
      isActive
        ? isDark ? "text-navy-foreground font-medium" : "text-foreground font-medium"
        : isDark ? "text-navy-foreground/70 hover:text-navy-foreground" : "text-muted-foreground hover:text-foreground",
    );

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn("py-2 text-sm transition-colors", isActive ? "text-accent font-medium" : "text-muted-foreground");

  // --- Desktop content ---

  const DesktopLinks = () => {
    if (!isAuthenticated) {
      return (
        <>
          {isLanding
            ? LANDING_ANCHORS.map(({ href, label }) => (
                <a key={href} href={href} className={anchorClass}>{label}</a>
              ))
            : null}
          {PUBLIC_LINKS.map(({ to, label }) =>
            isLanding ? null : (
              <NavLink key={to} to={to} className={navLinkClass}>{label}</NavLink>
            ),
          )}
          {isLanding && (
            <NavLink to="/consulta">
              <Button variant="outline" size="sm" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                Consultar Viatura
              </Button>
            </NavLink>
          )}
          <NavLink to="/login">
            <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
              Entrar
            </Button>
          </NavLink>
        </>
      );
    }

    return (
      <>
        {PUBLIC_LINKS.map(({ to, label }) => (
          <NavLink key={to} to={to} className={navLinkClass}>{label}</NavLink>
        ))}

        <div className="pl-4 border-l border-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 px-2 hover:bg-muted">
                <UserAvatar name={user?.name} email={user?.email} />
                <span className="max-w-[100px] truncate text-sm font-medium">{user?.name ?? user?.email}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <div className="px-2 py-2">
                <p className="text-xs font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              {dashboardPath && (
                <DropdownMenuItem
                  onClick={() => navigate(dashboardPath)}
                  className="gap-2 cursor-pointer"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  {user?.role === "admin" ? "Painel Admin" : "Dashboard"}
                </DropdownMenuItem>
              )}
              {user?.role === "comprador" && (
                <DropdownMenuItem
                  onClick={() => navigate("/perfil")}
                  className="gap-2 cursor-pointer"
                >
                  <UserCircle className="h-4 w-4" />
                  O Meu Perfil
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={logout}
                className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </>
    );
  };

  // --- Mobile content ---

  const MobileLinks = () => {
    if (!isAuthenticated) {
      return (
        <>
          {isLanding &&
            LANDING_ANCHORS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={close}
                className="py-2 text-sm text-navy-foreground/70 hover:text-navy-foreground transition-colors"
              >
                {label}
              </a>
            ))}
          {!isLanding &&
            PUBLIC_LINKS.map(({ to, label }) => (
              <NavLink key={to} to={to} onClick={close} className={mobileNavLinkClass}>{label}</NavLink>
            ))}
          <div className="pt-2 flex flex-col gap-2">
            {isLanding && (
              <Link to="/consulta" onClick={close}>
                <Button variant="outline" size="sm" className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                  Consultar Viatura
                </Button>
              </Link>
            )}
            <Link to="/login" onClick={close}>
              <Button size="sm" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                Entrar
              </Button>
            </Link>
          </div>
        </>
      );
    }

    return (
      <>
        {PUBLIC_LINKS.map(({ to, label }) => (
          <NavLink key={to} to={to} onClick={close} className={mobileNavLinkClass}>{label}</NavLink>
        ))}
        <div className="pt-3 border-t flex flex-col gap-1">
          <div className="flex items-center gap-3 py-1">
            <UserAvatar name={user?.name} email={user?.email} />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          {dashboardPath && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { navigate(dashboardPath); close(); }}
              className="justify-start gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              {user?.role === "admin" ? "Painel Admin" : "Dashboard"}
            </Button>
          )}
          {user?.role === "comprador" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { navigate("/perfil"); close(); }}
              className="justify-start gap-2"
            >
              <UserCircle className="h-4 w-4" />
              O Meu Perfil
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { logout(); close(); }}
            className="justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </>
    );
  };

  return (
    <nav className={cn(
      "sticky top-0 z-50 border-b backdrop-blur-md",
      isDark ? "bg-navy/90 border-navy-light" : "bg-card/90 border-border",
    )}>
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <Shield className="h-6 w-6 text-accent" />
          <span className={cn(
            "font-display font-bold text-base",
            isDark ? "text-navy-foreground" : "text-foreground",
          )}>
            Moz Car History
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-5">
          <DesktopLinks />
        </div>

        {/* Mobile toggle */}
        <button
          aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((o) => !o)}
          className={cn(
            "md:hidden rounded-md p-1.5 transition-colors",
            isDark ? "text-navy-foreground/80 hover:bg-white/10" : "text-muted-foreground hover:bg-muted",
          )}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu — animated */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className={cn(
              "md:hidden border-t overflow-hidden",
              isDark ? "bg-navy/95 border-navy-light" : "bg-card border-border",
            )}
          >
            <div className="flex flex-col gap-1 p-4">
              <MobileLinks />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
