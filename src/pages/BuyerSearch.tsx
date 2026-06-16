import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Car, ShieldCheck, AlertTriangle, FileText, Gauge,
  Calendar, Plus, Loader2, Fuel, Settings, Hash, ChevronLeft, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { searchCars, type CarSearchResult } from "@/api/cars";

const SERVICE_TYPE_COLORS: Record<string, string> = {
  "Troca de Óleo": "bg-amber-500/10 text-amber-600 border-amber-200",
  "Revisão Geral": "bg-blue-500/10 text-blue-600 border-blue-200",
  "Travões / Freios": "bg-red-500/10 text-red-600 border-red-200",
  "Pneus": "bg-slate-500/10 text-slate-600 border-slate-200",
  "Motor": "bg-orange-500/10 text-orange-600 border-orange-200",
  "Sistema Eléctrico": "bg-yellow-500/10 text-yellow-600 border-yellow-200",
};

function serviceTypeBadge(type: string | null) {
  if (!type) return null;
  const cls = SERVICE_TYPE_COLORS[type] ?? "bg-accent/10 text-accent border-accent/20";
  return (
    <span className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full border ${cls}`}>
      {type}
    </span>
  );
}

const PAGE_SIZE = 12;

const BuyerSearch = () => {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<CarSearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleSearch = async (e?: React.FormEvent, targetPage = 1) => {
    e?.preventDefault();
    const q = query.trim();
    if (q.length < 2) {
      toast.error("Introduza pelo menos 2 caracteres.");
      return;
    }
    setIsLoading(true);
    if (targetPage === 1) setSearched(false);
    try {
      const data = await searchCars(q, targetPage, PAGE_SIZE);
      setResults(data.cars);
      setTotal(data.total);
      setPage(data.page);
      setSearched(true);
      if (data.total === 0) toast.info("Nenhuma viatura encontrada.");
    } catch (error: any) {
      toast.error(error?.message || "Erro ao pesquisar");
    } finally {
      setIsLoading(false);
    }
  };

  const goToPage = (p: number) => {
    handleSearch(undefined, p);
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const clearSearch = () => {
    setQuery("");
    setSearched(false);
    setResults([]);
    setTotal(0);
    setPage(1);
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="gradient-hero py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <ShieldCheck className="h-10 w-10 text-accent mx-auto mb-4" />
            <h1 className="font-display text-3xl md:text-4xl font-bold text-navy-foreground mb-3">
              Consultar Histórico de Viatura
            </h1>
            <p className="text-navy-foreground/60 max-w-md mx-auto mb-8">
              Pesquise por matrícula, número de chassis (VIN), marca ou modelo.
            </p>

            <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="MAA-123-MP, Toyota Hilux, VIN..."
                  className="pl-11 pr-10 h-12 bg-card text-foreground font-mono text-base"
                  autoFocus
                />
                {query && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Plus className="h-4 w-4 rotate-45" />
                  </button>
                )}
              </div>
              <Button
                type="submit"
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 h-12 px-6 shrink-0"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Consultar"}
              </Button>
            </form>

            <div className="flex flex-wrap justify-center gap-3 mt-5 text-xs text-navy-foreground/50">
              {["MAA-123-MP", "Toyota", "Hilux", "1HGBH41JXMN109186"].map(hint => (
                <button
                  key={hint}
                  type="button"
                  onClick={() => { setQuery(hint); }}
                  className="bg-white/10 hover:bg-white/20 transition-colors px-3 py-1 rounded-full font-mono"
                >
                  {hint}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Results */}
      <div ref={resultsRef} className="container mx-auto px-4 py-10 max-w-5xl">
        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 gap-4"
            >
              <Loader2 className="h-10 w-10 text-accent animate-spin" />
              <p className="text-muted-foreground text-sm">A pesquisar viaturas...</p>
            </motion.div>
          )}

          {!isLoading && searched && results.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-card border border-border rounded-xl p-12 text-center shadow-card"
            >
              <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4 opacity-60" />
              <h2 className="font-display text-xl font-bold text-foreground mb-2">Nenhuma viatura encontrada</h2>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
                Não encontrámos nenhuma viatura para "<span className="font-mono font-semibold text-foreground">{query}</span>".
                Verifique a matrícula ou tente pesquisar pela marca.
              </p>
              <Button variant="outline" size="sm" onClick={clearSearch}>
                <Plus className="h-4 w-4 rotate-45 mr-2" /> Nova pesquisa
              </Button>
            </motion.div>
          )}

          {!isLoading && searched && results.length > 0 && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                <p className="text-sm text-muted-foreground">
                  <span className="font-bold text-foreground">{total}</span> viatura{total !== 1 ? "s" : ""} encontrada{total !== 1 ? "s" : ""}
                  {" "}para <span className="font-mono font-semibold">"{query}"</span>
                  {totalPages > 1 && (
                    <span className="ml-2 text-xs">
                      — página <span className="font-semibold text-foreground">{page}</span> de <span className="font-semibold text-foreground">{totalPages}</span>
                    </span>
                  )}
                </p>
                <button
                  type="button"
                  onClick={clearSearch}
                  className="text-xs text-muted-foreground hover:text-accent transition-colors flex items-center gap-1"
                >
                  <Plus className="h-3 w-3 rotate-45" /> Limpar
                </button>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" key={page}>
                {results.map((car, i) => {
                  const lastRecord = car.records?.[0];
                  const recordCount = car._count?.records ?? 0;
                  return (
                    <motion.div
                      key={car.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <Link
                        to={`/historico?plate=${encodeURIComponent(car.plateNumber)}`}
                        className="block bg-card border border-border rounded-xl overflow-hidden shadow-card hover:shadow-card-hover hover:border-accent/40 transition-all group"
                      >
                        {/* Photo */}
                        <div className="aspect-video bg-muted relative overflow-hidden">
                          {car.photos?.[0] ? (
                            <img
                              src={car.photos[0]}
                              alt={`${car.brand} ${car.model}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                              <Car className="h-14 w-14" />
                            </div>
                          )}
                          {/* Plate badge */}
                          <div className="absolute top-3 left-3">
                            <span className="bg-background/90 backdrop-blur-sm text-foreground px-2.5 py-1 rounded-md border border-border text-[10px] font-mono font-bold">
                              {car.plateNumber}
                            </span>
                          </div>
                          {/* Record count badge */}
                          <div className="absolute top-3 right-3">
                            {recordCount > 0 ? (
                              <span className="bg-accent/90 text-accent-foreground px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1">
                                <ShieldCheck className="h-3 w-3" />
                                {recordCount} registo{recordCount !== 1 ? "s" : ""}
                              </span>
                            ) : (
                              <span className="bg-muted/90 text-muted-foreground px-2 py-1 rounded-md text-[10px] font-medium">
                                Sem registos
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Info */}
                        <div className="p-4">
                          <div className="mb-3">
                            <h3 className="font-display font-bold text-foreground text-lg leading-tight group-hover:text-accent transition-colors">
                              {car.brand} {car.model}
                            </h3>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                              {car.year && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" /> {car.year}
                                </span>
                              )}
                              {car.fuelType && (
                                <span className="flex items-center gap-1">
                                  <Fuel className="h-3 w-3" /> {car.fuelType}
                                </span>
                              )}
                              {car.transmission && (
                                <span className="flex items-center gap-1">
                                  <Settings className="h-3 w-3" /> {car.transmission}
                                </span>
                              )}
                              {car.color && (
                                <span className="flex items-center gap-1">
                                  <span className="h-2 w-2 rounded-full bg-muted-foreground/50 inline-block" />
                                  {car.color}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* VIN */}
                          {car.vin && (
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-3">
                              <Hash className="h-3 w-3 shrink-0" />
                              <span className="font-mono truncate">{car.vin}</span>
                            </div>
                          )}

                          {/* Last record */}
                          {lastRecord && (
                            <div className="pt-3 border-t border-border space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-muted-foreground">Último serviço</span>
                                <span className="text-[10px] text-muted-foreground">
                                  {new Date(lastRecord.date).toLocaleDateString("pt-PT")}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                {serviceTypeBadge(lastRecord.serviceType)}
                                <span className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                                  <Gauge className="h-3 w-3" />
                                  {lastRecord.mileage.toLocaleString("pt-PT")} km
                                </span>
                              </div>
                              {lastRecord.workshop && (
                                <p className="text-[10px] text-muted-foreground truncate">{lastRecord.workshop.name}</p>
                              )}
                            </div>
                          )}

                          {/* CTA */}
                          <div className="mt-4 flex items-center gap-1.5 text-accent text-xs font-medium">
                            <FileText className="h-3.5 w-3.5" />
                            Ver histórico completo →
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-10">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1 || isLoading}
                    onClick={() => goToPage(page - 1)}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                      .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                        if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, i) =>
                        p === "…" ? (
                          <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground text-sm">…</span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => goToPage(p as number)}
                            className={`h-8 w-8 rounded-md text-sm font-medium transition-colors ${
                              p === page
                                ? "bg-accent text-accent-foreground"
                                : "hover:bg-muted text-muted-foreground"
                            }`}
                          >
                            {p}
                          </button>
                        )
                      )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages || isLoading}
                    onClick={() => goToPage(page + 1)}
                    className="gap-1"
                  >
                    Próximo
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BuyerSearch;
