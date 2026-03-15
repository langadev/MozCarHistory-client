import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Shield, Menu, X, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const isLanding = location.pathname === "/";

  const renderNavLinks = (isMobile = false) => {
    const linkClass = isMobile ? "py-2 text-sm text-muted-foreground" : "text-sm text-muted-foreground hover:text-foreground transition-colors";
    const activeClass = isMobile ? "py-2 text-sm text-accent font-medium" : "text-sm text-accent font-medium transition-colors";

    if (!isAuthenticated) {
      if (isLanding) {
        return (
          <>
            <a href="#problema" onClick={() => isMobile && setMobileOpen(false)} className={isMobile ? "py-2 text-sm text-navy-foreground/70" : "text-sm text-navy-foreground/70 hover:text-navy-foreground transition-colors"}>Problema</a>
            <a href="#solucao" onClick={() => isMobile && setMobileOpen(false)} className={isMobile ? "py-2 text-sm text-navy-foreground/70" : "text-sm text-navy-foreground/70 hover:text-navy-foreground transition-colors"}>Solução</a>
            <a href="#como-funciona" onClick={() => isMobile && setMobileOpen(false)} className={isMobile ? "py-2 text-sm text-navy-foreground/70" : "text-sm text-navy-foreground/70 hover:text-navy-foreground transition-colors"}>Como Funciona</a>
            <Link to="/consulta" onClick={() => isMobile && setMobileOpen(false)}>
              <Button variant="outline" size="sm" className={`border-accent text-accent hover:bg-accent hover:text-accent-foreground ${isMobile ? "w-full" : ""}`}>
                Consultar Viatura
              </Button>
            </Link>
            <Link to="/login" onClick={() => isMobile && setMobileOpen(false)}>
              <Button size="sm" className={`bg-accent text-accent-foreground hover:bg-accent/90 ${isMobile ? "w-full" : ""}`}>
                Entrar
              </Button>
            </Link>
          </>
        );
      }
      return (
        <>
          <Link to="/consulta" onClick={() => isMobile && setMobileOpen(false)} className={location.pathname === "/consulta" ? activeClass : linkClass}>Consultar</Link>
          <Link to="/veiculos" onClick={() => isMobile && setMobileOpen(false)} className={location.pathname === "/veiculos" ? activeClass : linkClass}>Veículos</Link>
          <Link to="/login" onClick={() => isMobile && setMobileOpen(false)}>
            <Button size="sm" className={`bg-accent text-accent-foreground hover:bg-accent/90 ${isMobile ? "w-full" : ""}`}>
              Entrar
            </Button>
          </Link>
        </>
      );
    }

    // Role-based links
    return (
      <>
        {user?.role === "oficina" && (
          <>
            <Link to="/dashboard" onClick={() => isMobile && setMobileOpen(false)} className={location.pathname === "/dashboard" ? activeClass : linkClass}>Dashboard</Link>
            <Link to="/registar-servico" onClick={() => isMobile && setMobileOpen(false)} className={location.pathname === "/registar-servico" ? activeClass : linkClass}>Registar Serviço</Link>
          </>
        )}
        <Link to="/consulta" onClick={() => isMobile && setMobileOpen(false)} className={location.pathname === "/consulta" ? activeClass : linkClass}>Consultar</Link>
        <Link to="/veiculos" onClick={() => isMobile && setMobileOpen(false)} className={location.pathname === "/veiculos" ? activeClass : linkClass}>Veículos</Link>
        {user?.role === "oficina" && (
          <Link to="/perfil-oficina" onClick={() => isMobile && setMobileOpen(false)} className={location.pathname === "/perfil-oficina" ? activeClass : linkClass}>Perfil</Link>
        )}
        <div className={isMobile ? "pt-4 border-t flex flex-col gap-2" : "flex items-center gap-4 pl-4 border-l"}>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserIcon className="h-4 w-4" />
            <span className="font-medium max-w-[100px] truncate">{user?.name}</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => { logout(); isMobile && setMobileOpen(false); }}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </>
    );
  };

  return (
    <nav className={`sticky top-0 z-50 border-b backdrop-blur-md ${isLanding && !isAuthenticated ? "bg-navy/90 border-navy-light" : "bg-card/90 border-border"}`}>
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <Shield className="h-7 w-7 text-accent" />
          <span className={`font-display font-bold text-lg ${isLanding && !isAuthenticated ? "text-navy-foreground" : "text-foreground"}`}>
            Moz Car History
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {renderNavLinks()}
        </div>

        {/* Mobile menu button */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden">
          {mobileOpen ? (
            <X className={`h-6 w-6 ${isLanding && !isAuthenticated ? "text-navy-foreground" : "text-foreground"}`} />
          ) : (
            <Menu className={`h-6 w-6 ${isLanding && !isAuthenticated ? "text-navy-foreground" : "text-foreground"}`} />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className={`md:hidden border-t ${isLanding && !isAuthenticated ? "bg-navy border-navy-light" : "bg-card border-border"}`}>
          <div className="flex flex-col gap-2 p-4">
            {renderNavLinks(true)}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
