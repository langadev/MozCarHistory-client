import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, AlertTriangle, Download, Car, Wrench, MapPin,
  Gauge, Calendar, User, Loader2, Plus, X, ChevronLeft,
  ChevronRight, Fuel, Settings, Bell, ChevronDown, Filter,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { searchRecordsByPlate, searchRecordsByVin } from "@/api/records";
import { getCarByPlate } from "@/api/cars";
import { useAuth } from "@/hooks/useAuth";
import { exportHistoryPdf } from "@/lib/exportPdf";

const SERVICE_TYPE_COLORS: Record<string, string> = {
  "Troca de Óleo": "bg-amber-500/10 text-amber-600 border-amber-200",
  "Revisão Geral": "bg-blue-500/10 text-blue-600 border-blue-200",
  "Travões / Freios": "bg-red-500/10 text-red-600 border-red-200",
  "Pneus": "bg-slate-500/10 text-slate-600 border-slate-200",
  "Motor": "bg-orange-500/10 text-orange-600 border-orange-200",
  "Sistema Eléctrico": "bg-yellow-500/10 text-yellow-600 border-yellow-200",
  "Transmissão / Caixa": "bg-purple-500/10 text-purple-600 border-purple-200",
  "Suspensão": "bg-green-500/10 text-green-600 border-green-200",
  "Filtros": "bg-teal-500/10 text-teal-600 border-teal-200",
  "Ar Condicionado": "bg-sky-500/10 text-sky-600 border-sky-200",
  "Diagnóstico": "bg-indigo-500/10 text-indigo-600 border-indigo-200",
};

function serviceTypeBadge(type: string | null | undefined) {
  if (!type) return null;
  const cls = SERVICE_TYPE_COLORS[type] ?? "bg-accent/10 text-accent border-accent/20";
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cls}`}>
      <Wrench className="h-2.5 w-2.5 mr-1" />
      {type}
    </span>
  );
}

const VehicleHistory = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<any[]>([]);
  const [carInfo, setCarInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lightbox, setLightbox] = useState<{ photos: string[]; index: number } | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(5);
  const { user, token } = useAuth();

  const plate = searchParams.get("plate");
  const vin = searchParams.get("vin");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const result = plate
          ? await searchRecordsByPlate(plate)
          : await searchRecordsByVin(vin ?? "");

        setData(result);

        if (result.length === 0 && plate) {
          const car = await getCarByPlate(plate, token ?? undefined);
          if (car) setCarInfo(car);
          else toast.error("Nenhum histórico ou viatura encontrada.");
        }
      } catch (error: any) {
        console.error("Erro ao carregar histórico:", error);
        toast.error(error?.message || "Erro ao carregar histórico");
      } finally {
        setIsLoading(false);
      }
    };

    if (plate || vin) fetchHistory();
    else setIsLoading(false);
  }, [plate, vin, token]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 text-accent animate-spin" />
      </div>
    );
  }

  if (data.length === 0 && !carInfo) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 text-center flex flex-col items-center justify-center">
        <Car className="h-16 w-16 text-muted-foreground/20 mb-4" />
        <h2 className="text-lg md:text-xl font-bold mb-4 text-foreground">Viatura não encontrada.</h2>
        <p className="text-muted-foreground mb-8 max-w-xs mx-auto">
          Não conseguimos encontrar registos para esta viatura no sistema.
        </p>
        <Button onClick={() => navigate("/consulta")} className="w-full sm:w-auto">Voltar à pesquisa</Button>
      </div>
    );
  }

  const car = data.length > 0 ? data[0].car : carInfo;
  const recordsCount = data.length;
  const maxMileage = data.length > 0 ? Math.max(...data.map(d => d.mileage)) : null;
  const nextServiceMileage = data.find(d => d.nextServiceMileage)?.nextServiceMileage ?? null;

  const serviceTypes = useMemo(
    () => Array.from(new Set(data.map(r => r.serviceType).filter(Boolean))),
    [data],
  );

  const filteredData = useMemo(
    () => (activeFilter ? data.filter(r => r.serviceType === activeFilter) : data),
    [data, activeFilter],
  );

  const visibleData = filteredData.slice(0, visibleCount);
  const hasMore = filteredData.length > visibleCount;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent font-medium mb-4 md:mb-6 transition-colors"
        >
          <Car className="h-4 w-4 rotate-180" />
          <span className="hidden sm:inline">Voltar para a pesquisa</span>
          <span className="sm:hidden">Voltar</span>
        </button>

        {/* Vehicle header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-lg overflow-hidden shadow-card mb-6 md:mb-8"
        >
          <div className="flex flex-col md:flex-row gap-0">
            {/* Photo */}
            <div className="w-full md:w-52 h-40 md:h-auto bg-muted shrink-0">
              {car?.photos && car.photos.length > 0 ? (
                <img
                  src={car.photos[0]}
                  alt={`${car?.brand} ${car?.model}`}
                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setLightbox({ photos: car.photos, index: 0 })}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                  <Car className="h-16 w-16" />
                </div>
              )}
            </div>

            <div className="flex-1 p-4 md:p-6">
              {/* Title */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h1 className="font-display text-xl md:text-2xl font-bold text-foreground">
                    {car?.brand} {car?.model}
                    {car?.year && <span className="text-muted-foreground font-normal text-base ml-2">({car.year})</span>}
                  </h1>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    <span className="font-mono font-bold text-foreground bg-muted px-2 py-0.5 rounded text-sm">{car?.plateNumber}</span>
                    {car?.vin && <span className="text-xs text-muted-foreground self-center font-mono">VIN: {car.vin}</span>}
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 text-accent text-xs font-semibold bg-accent/10 px-3 py-1.5 rounded-full shrink-0">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {recordsCount} Registo{recordsCount !== 1 ? "s" : ""}
                </div>
              </div>

              {/* Car attributes */}
              <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4 text-sm text-muted-foreground">
                {car?.color && (
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
                    {car.color}
                  </span>
                )}
                {car?.fuelType && (
                  <span className="flex items-center gap-1.5">
                    <Fuel className="h-3.5 w-3.5" /> {car.fuelType}
                  </span>
                )}
                {car?.transmission && (
                  <span className="flex items-center gap-1.5">
                    <Settings className="h-3.5 w-3.5" /> {car.transmission}
                  </span>
                )}
                {car?.bodyType && (
                  <span className="flex items-center gap-1.5">
                    <Car className="h-3.5 w-3.5" /> {car.bodyType}
                  </span>
                )}
                {car?.engineSize && (
                  <span className="text-xs text-muted-foreground">Motor: {car.engineSize}</span>
                )}
              </div>

              {/* Stats row */}
              <div className="flex flex-wrap gap-3 mb-4">
                {maxMileage !== null && (
                  <div className="flex items-center gap-1.5 bg-muted/60 px-3 py-1.5 rounded-lg text-sm">
                    <Gauge className="h-4 w-4 text-accent" />
                    <span className="text-muted-foreground text-xs">Última km:</span>
                    <span className="font-bold text-foreground">{maxMileage.toLocaleString("pt-PT")} km</span>
                  </div>
                )}
                {nextServiceMileage && (
                  <div className="flex items-center gap-1.5 bg-amber-500/5 border border-amber-200 px-3 py-1.5 rounded-lg text-sm">
                    <Bell className="h-4 w-4 text-amber-500" />
                    <span className="text-xs text-amber-600">Próximo serviço:</span>
                    <span className="font-bold text-amber-700">{nextServiceMileage.toLocaleString("pt-PT")} km</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary text-primary hover:bg-primary/5 w-full sm:w-auto"
                  disabled={recordsCount === 0}
                  onClick={() => exportHistoryPdf(car, data)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Exportar PDF</span>
                  <span className="sm:hidden">PDF</span>
                </Button>
                {(user?.role === "oficina" || user?.role === "mecanico") && (
                  <Button
                    size="sm"
                    className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto"
                    onClick={() =>
                      navigate(
                        user.role === "mecanico"
                          ? `/mecanico/registar-servico?plate=${car?.plateNumber}`
                          : `/registar-servico?plate=${car?.plateNumber}`,
                      )
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Serviço
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* No records yet */}
        {recordsCount === 0 && (
          <div className="bg-card border border-dashed border-border rounded-lg p-10 text-center">
            <Wrench className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Esta viatura ainda não tem serviços registados.</p>
          </div>
        )}

        {/* Timeline */}
        {recordsCount > 0 && (
          <div>
            {/* Filter pills */}
            {serviceTypes.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => { setActiveFilter(null); setVisibleCount(5); }}
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                    !activeFilter
                      ? "bg-accent text-accent-foreground border-accent"
                      : "bg-card border-border text-muted-foreground hover:border-accent/50"
                  }`}
                >
                  <Filter className="h-3 w-3" />
                  Todos ({data.length})
                </button>
                {serviceTypes.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => { setActiveFilter(activeFilter === type ? null : type); setVisibleCount(5); }}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                      activeFilter === type
                        ? "bg-accent text-accent-foreground border-accent"
                        : "bg-card border-border text-muted-foreground hover:border-accent/50"
                    }`}
                  >
                    {type} ({data.filter(r => r.serviceType === type).length})
                  </button>
                ))}
              </div>
            )}

            <div className="relative">
              <div className="hidden md:block absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

              {visibleData.map((record, i) => {
                const isExpanded = expandedIds.has(i);
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i * 0.07, 0.3) }}
                    className="relative pl-4 md:pl-14 pb-4 md:pb-5"
                  >
                    <div className="hidden md:block absolute left-4 w-5 h-5 rounded-full border-2 bg-accent/20 border-accent">
                      <div className="absolute inset-1 rounded-full bg-accent" />
                    </div>

                    <div className="bg-card border border-border rounded-lg shadow-card hover:shadow-card-hover transition-shadow overflow-hidden">
                      {/* Compact header — always visible, clickable to expand */}
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedIds(prev => {
                            const next = new Set(prev);
                            if (next.has(i)) next.delete(i);
                            else next.add(i);
                            return next;
                          })
                        }
                        className="w-full text-left p-4 md:p-5 flex items-start gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            {serviceTypeBadge(record.serviceType)}
                            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                              <Calendar className="h-3 w-3" />
                              {new Date(record.date).toLocaleDateString("pt-PT", { day: "numeric", month: "short", year: "numeric" })}
                            </div>
                            <div className="flex items-center gap-1 text-xs font-medium bg-muted/50 px-2 py-1 rounded">
                              <Gauge className="h-3 w-3 text-accent" />
                              {record.mileage.toLocaleString("pt-PT")} km
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">{record.workshop?.name}</span>
                            {record.mechanic?.name && (
                              <>
                                <span className="text-border">·</span>
                                <User className="h-3 w-3 shrink-0" />
                                <span className="truncate">{record.mechanic.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 pt-0.5">
                          {!isExpanded && record.photos?.length > 0 && (
                            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              {record.photos.length} foto{record.photos.length !== 1 ? "s" : ""}
                            </span>
                          )}
                          <ChevronDown
                            className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                          />
                        </div>
                      </button>

                      {/* Expanded details */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            key="expanded"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 md:px-5 pb-4 md:pb-5 border-t border-border">
                              {/* Description */}
                              <div className="mt-4 mb-4">
                                <p className="font-semibold text-sm mb-1 text-foreground">Serviço Realizado</p>
                                <p className="text-muted-foreground text-sm leading-relaxed">{record.description}</p>
                              </div>

                              {/* Parts */}
                              {record.parts && (
                                <div className="mb-4">
                                  <p className="text-sm font-semibold mb-2 text-foreground">Peças Substituídas</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {record.parts.split(",").map((s: string, j: number) => (
                                      <span key={j} className="text-xs bg-muted px-2.5 py-1.5 rounded-md text-muted-foreground">
                                        {s.trim()}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Next service */}
                              {record.nextServiceMileage && (
                                <div className="flex flex-wrap gap-3 mb-4">
                                  <div className="flex items-center gap-1.5 bg-amber-500/5 border border-amber-200 px-3 py-1.5 rounded-lg text-sm">
                                    <Bell className="h-3.5 w-3.5 text-amber-500" />
                                    <span className="text-xs text-amber-600">Próximo:</span>
                                    <span className="font-bold text-amber-700">{record.nextServiceMileage.toLocaleString("pt-PT")} km</span>
                                  </div>
                                </div>
                              )}

                              {/* Photos */}
                              {record.photos && record.photos.length > 0 && (
                                <div className="mb-4">
                                  <p className="text-sm font-semibold mb-2 text-foreground">Fotos do Serviço</p>
                                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                    {record.photos.map((photo: string, idx: number) => (
                                      <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setLightbox({ photos: record.photos, index: idx })}
                                        className="aspect-square rounded-md overflow-hidden border border-border hover:border-accent transition-colors block p-0"
                                      >
                                        <img src={photo} alt={`Serviço ${idx + 1}`} className="w-full h-full object-cover" />
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Footer */}
                              <div className="pt-2 border-t border-border">
                                <span className="inline-flex items-center gap-1.5 text-accent text-xs font-medium">
                                  <ShieldCheck className="h-4 w-4" /> Registo Verificado
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="text-center mt-2 mb-4 pl-4 md:pl-14">
                <Button
                  variant="outline"
                  onClick={() => setVisibleCount(prev => prev + 5)}
                  className="gap-2"
                >
                  <ChevronDown className="h-4 w-4" />
                  Ver mais ({filteredData.length - visibleCount} restantes)
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors p-2"
            onClick={() => setLightbox(null)}
          >
            <X className="h-8 w-8" />
          </button>

          {lightbox.photos.length > 1 && (
            <button
              type="button"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 p-2 z-50"
              onClick={e => {
                e.stopPropagation();
                setLightbox(prev =>
                  prev ? { ...prev, index: (prev.index - 1 + prev.photos.length) % prev.photos.length } : null,
                );
              }}
            >
              <ChevronLeft className="h-10 w-10 sm:h-14 sm:w-14" />
            </button>
          )}

          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img
              src={lightbox.photos[lightbox.index]}
              alt="Preview"
              className="max-h-[90vh] max-w-full rounded-md object-contain shadow-2xl"
              onClick={e => e.stopPropagation()}
            />
          </div>

          {lightbox.photos.length > 1 && (
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 p-2 z-50"
              onClick={e => {
                e.stopPropagation();
                setLightbox(prev =>
                  prev ? { ...prev, index: (prev.index + 1) % prev.photos.length } : null,
                );
              }}
            >
              <ChevronRight className="h-10 w-10 sm:h-14 sm:w-14" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default VehicleHistory;
