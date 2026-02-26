import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Car, ShieldCheck, AlertTriangle, FileText, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

const BuyerSearch = () => {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) setSearched(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Search hero */}
      <section className="gradient-hero py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <ShieldCheck className="h-10 w-10 text-accent mx-auto mb-4" />
            <h1 className="font-display text-3xl md:text-4xl font-bold text-navy-foreground mb-3">
              Consultar Histórico de Viatura
            </h1>
            <p className="text-navy-foreground/60 max-w-md mx-auto mb-8">
              Introduza a matrícula ou número de chassis (VIN) para verificar o histórico.
            </p>
            <form onSubmit={handleSearch} className="max-w-lg mx-auto flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="MAA-123-MP ou VIN..."
                  className="pl-11 h-12 bg-card text-foreground font-mono text-base"
                />
              </div>
              <Button type="submit" size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 h-12 px-6">
                Consultar
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Results */}
      {searched && (
        <div className="container mx-auto px-4 py-10 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            {/* Vehicle summary */}
            <div className="bg-card border border-border rounded-lg p-6 shadow-card mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Car className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">Toyota Hilux 2019</h2>
                  <p className="text-sm text-muted-foreground font-mono">MAA-123-MP</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Registos", value: "5" },
                  { label: "Oficinas", value: "3" },
                  { label: "Última Km", value: "85,230" },
                  { label: "Alertas", value: "1" },
                ].map((item, i) => (
                  <div key={i} className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-xl font-display font-bold text-foreground">{item.value}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{item.label}</div>
                  </div>
                ))}
              </div>

              {/* Alerts */}
              <div className="flex items-start gap-2 bg-warning/10 text-warning rounded-md p-3 mb-4 text-sm">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>1 alerta de inconsistência de quilometragem detectado. Verifique o relatório completo.</span>
              </div>

              {/* Workshops */}
              <div className="space-y-2 mb-4">
                <h3 className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  Oficinas Envolvidas
                </h3>
                {["Auto Mecânica Maputo (3 registos)", "Oficina Central Matola (1 registo)", "Oficina Rápida Beira (1 registo)"].map((w, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground pl-5">
                    <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                    {w}
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/historico" className="flex-1">
                  <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    <FileText className="mr-2 h-4 w-4" />
                    Obter Relatório Completo
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BuyerSearch;
