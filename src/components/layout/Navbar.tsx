import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Shield, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <nav className={`sticky top-0 z-50 border-b backdrop-blur-md ${isLanding ? "bg-navy/90 border-navy-light" : "bg-card/90 border-border"}`}>
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <Shield className={`h-7 w-7 ${isLanding ? "text-accent" : "text-accent"}`} />
          <span className={`font-display font-bold text-lg ${isLanding ? "text-navy-foreground" : "text-foreground"}`}>
            Moz Car History
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {isLanding ? (
            <>
              <a href="#problema" className="text-sm text-navy-foreground/70 hover:text-navy-foreground transition-colors">Problema</a>
              <a href="#solucao" className="text-sm text-navy-foreground/70 hover:text-navy-foreground transition-colors">Solução</a>
              <a href="#como-funciona" className="text-sm text-navy-foreground/70 hover:text-navy-foreground transition-colors">Como Funciona</a>
              <Link to="/consulta">
                <Button variant="outline" size="sm" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                  Consultar Viatura
                </Button>
              </Link>
              <Link to="/login">
                <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  Entrar
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
              <Link to="/registar-servico" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Registar Serviço</Link>
              <Link to="/consulta" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Consultar</Link>
              <Link to="/perfil-oficina" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Perfil</Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden">
          {mobileOpen ? (
            <X className={`h-6 w-6 ${isLanding ? "text-navy-foreground" : "text-foreground"}`} />
          ) : (
            <Menu className={`h-6 w-6 ${isLanding ? "text-navy-foreground" : "text-foreground"}`} />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className={`md:hidden border-t ${isLanding ? "bg-navy border-navy-light" : "bg-card border-border"}`}>
          <div className="flex flex-col gap-2 p-4">
            {isLanding ? (
              <>
                <a href="#problema" onClick={() => setMobileOpen(false)} className="py-2 text-sm text-navy-foreground/70">Problema</a>
                <a href="#solucao" onClick={() => setMobileOpen(false)} className="py-2 text-sm text-navy-foreground/70">Solução</a>
                <a href="#como-funciona" onClick={() => setMobileOpen(false)} className="py-2 text-sm text-navy-foreground/70">Como Funciona</a>
                <Link to="/consulta" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full border-accent text-accent">Consultar Viatura</Button>
                </Link>
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <Button size="sm" className="w-full bg-accent text-accent-foreground">Entrar</Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="py-2 text-sm text-muted-foreground">Dashboard</Link>
                <Link to="/registar-servico" onClick={() => setMobileOpen(false)} className="py-2 text-sm text-muted-foreground">Registar Serviço</Link>
                <Link to="/consulta" onClick={() => setMobileOpen(false)} className="py-2 text-sm text-muted-foreground">Consultar</Link>
                <Link to="/perfil-oficina" onClick={() => setMobileOpen(false)} className="py-2 text-sm text-muted-foreground">Perfil</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
