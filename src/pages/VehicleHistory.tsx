import { motion } from "framer-motion";
import { ShieldCheck, AlertTriangle, Download, Car, Wrench, MapPin, Gauge, Calendar, User, Loader2, Plus, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { searchRecordsByPlate, searchRecordsByVin } from "@/api/records";
import { useAuth } from "@/hooks/useAuth";

const VehicleHistory = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lightbox, setLightbox] = useState<{ photos: string[], index: number } | null>(null);
  const { user } = useAuth();

  const plate = searchParams.get('plate');
  const vin = searchParams.get('vin');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const result = plate
          ? await searchRecordsByPlate(plate)
          : await searchRecordsByVin(vin ?? "");

        setData(result);

        if (result.length === 0) {
          toast.error("Nenhum histórico encontrado para esta viatura.");
        }
      } catch (error: any) {
        console.error("Erro ao carregar histórico:", error);
        toast.error(error?.message || "Erro ao carregar histórico");
      } finally {
        setIsLoading(false);
      }
    };

    if (plate || vin) {
      fetchHistory();
    } else {
      setIsLoading(false);
    }
  }, [plate, vin]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 text-accent animate-spin" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 text-center">
        <h2 className="text-lg md:text-xl font-bold mb-4">Nenhum registo encontrado.</h2>
        <Button onClick={() => navigate('/consulta')} className="w-full sm:w-auto">Voltar à pesquisa</Button>
      </div>
    );
  }

  const vehicle = data[0];

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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-card mb-6 md:mb-8">
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Car className="h-6 w-6 text-accent" />
                <h1 className="font-display text-xl md:text-2xl font-bold text-foreground">{vehicle.brandModel}</h1>
              </div>
              <div className="flex flex-wrap gap-2 md:gap-4 text-sm text-muted-foreground">
                <span className="font-mono font-medium text-foreground bg-muted px-2 py-1 rounded text-xs md:text-sm">{vehicle.plateNumber}</span>
                {vehicle.vin && <span className="text-xs md:text-sm">VIN: {vehicle.vin}</span>}
                <span className="text-xs md:text-sm">Última: {Math.max(...data.map(d => d.mileage)).toLocaleString()} km</span>
              </div>
            </div>

            {/* Mobile-first button layout */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="inline-flex items-center gap-1.5 text-accent text-sm font-medium bg-accent/10 px-3 py-2 rounded-full w-fit">
                <ShieldCheck className="h-4 w-4" />
                {data.length} Registos Verificados
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/5 w-full sm:w-auto">
                  <Download className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Exportar PDF</span>
                  <span className="sm:hidden">PDF</span>
                </Button>
                {user?.role === "oficina" && (
                  <Button
                    size="sm"
                    className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto"
                    onClick={() => navigate(`/registar-servico?plate=${vehicle.plateNumber}${vehicle.vin ? `&vin=${vehicle.vin}` : ''}&brand=${encodeURIComponent(vehicle.brandModel)}`)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Serviço
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line - hidden on mobile for cleaner look */}
          <div className="hidden md:block absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

          {data.map((record, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative pl-4 md:pl-14 pb-6 md:pb-8"
            >
              {/* Timeline dot - adjusted for mobile */}
              <div className={`hidden md:block absolute left-4 w-5 h-5 rounded-full border-2 bg-accent/20 border-accent`}>
                <div className="absolute inset-1 rounded-full bg-accent" />
              </div>

              <div className="bg-card border border-border rounded-lg p-4 md:p-5 shadow-card transition-shadow hover:shadow-card-hover">
                {/* Mobile-first metadata layout */}
                <div className="flex flex-col gap-2 md:gap-3 mb-4">
                  <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                      <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      {new Date(record.date).toLocaleDateString('pt-PT')}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium text-foreground bg-muted/50 px-2 py-1 rounded">
                      <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      {record.workshop?.name}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    {record.mechanic && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                        <User className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        {record.mechanic}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                      <Gauge className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      {record.mileage.toLocaleString()} km
                    </div>
                  </div>
                </div>

                <div className="mb-4 text-sm text-foreground">
                  <p className="font-semibold mb-2 text-base">Serviço Realizado:</p>
                  <p className="text-muted-foreground leading-relaxed">{record.description}</p>
                </div>

                {record.parts && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold mb-2">Peças Substituídas:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {record.parts.split(',').map((s, j) => (
                        <span key={j} className="text-xs bg-muted px-2.5 py-1.5 rounded-md text-muted-foreground">
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {record.photos && record.photos.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold mb-2">Fotos do Serviço:</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {record.photos.map((photo: string, idx: number) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setLightbox({ photos: record.photos, index: idx })}
                          className="aspect-square rounded-md overflow-hidden border border-border hover:border-accent transition-colors block p-0"
                        >
                          <img
                            src={photo}
                            alt={`Serviço ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status badge - improved mobile spacing */}
                <div className="pt-2 border-t border-border">
                  {record.verified ? (
                    <span className="inline-flex items-center gap-1.5 text-accent text-sm font-medium">
                      <ShieldCheck className="h-4 w-4" /> Registo Verificado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-warning text-sm font-medium">
                      <AlertTriangle className="h-4 w-4" /> Verificação Pendente
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Lightbox Modal */}
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
               onClick={(e) => {
                 e.stopPropagation();
                 setLightbox(prev => prev ? { ...prev, index: (prev.index - 1 + prev.photos.length) % prev.photos.length } : null);
               }}
            >
              <ChevronLeft className="h-10 w-10 sm:h-14 sm:w-14" />
            </button>
          )}

          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img 
              src={lightbox.photos[lightbox.index]} 
              alt="Preview em ecrã inteiro" 
              className="max-h-[90vh] max-w-full rounded-md object-contain shadow-2xl transition-opacity duration-300"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {lightbox.photos.length > 1 && (
            <button
               type="button"
               className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 p-2 z-50"
               onClick={(e) => {
                 e.stopPropagation();
                 setLightbox(prev => prev ? { ...prev, index: (prev.index + 1) % prev.photos.length } : null);
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
