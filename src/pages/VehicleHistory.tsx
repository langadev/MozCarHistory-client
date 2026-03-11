import { motion } from "framer-motion";
import { ShieldCheck, AlertTriangle, Download, Car, Wrench, MapPin, Gauge, Calendar, User, Loader2, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const VehicleHistory = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const plate = searchParams.get('plate');
  const vin = searchParams.get('vin');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const param = plate ? `plate=${plate}` : `vin=${vin}`;
        const response = await fetch(`${import.meta.env.VITE_API_URL}/maintenance/search?${param}`);
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error("Erro ao carregar histórico:", error);
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
      <div className="min-h-screen bg-background p-8 text-center">
        <h2 className="text-xl font-bold mb-4">Nenhum registo encontrado.</h2>
        <Button onClick={() => navigate('/consulta')}>Voltar à pesquisa</Button>
      </div>
    );
  }

  const vehicle = data[0];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent font-medium mb-6 transition-colors"
        >
          <Car className="h-4 w-4 rotate-180" />
          Voltar para a pesquisa
        </button>
        {/* Vehicle header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-lg p-6 shadow-card mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Car className="h-6 w-6 text-accent" />
                <h1 className="font-display text-2xl font-bold text-foreground">{vehicle.brandModel}</h1>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="font-mono font-medium text-foreground">{vehicle.plateNumber}</span>
                {vehicle.vin && <span>VIN: {vehicle.vin}</span>}
                <span>Última quilometragem: {Math.max(...data.map(d => d.mileage)).toLocaleString()} km</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 text-accent text-sm font-medium bg-accent/10 px-3 py-1.5 rounded-full">
                <ShieldCheck className="h-4 w-4" />
                {data.length} Registos Verificados
              </div>
              <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/5">
                <Download className="mr-2 h-4 w-4" />
                Exportar PDF
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

          {data.map((record, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative pl-14 pb-8"
            >
              <div className={`absolute left-4 w-5 h-5 rounded-full border-2 bg-accent/20 border-accent`}>
                <div className="absolute inset-1 rounded-full bg-accent" />
              </div>

              <div className="bg-card border border-border rounded-lg p-5 shadow-card transition-shadow hover:shadow-card-hover">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(record.date).toLocaleDateString('pt-PT')}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium text-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {record.workshop?.name}
                  </div>
                  {record.mechanic && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <User className="h-3.5 w-3.5" />
                      {record.mechanic}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Gauge className="h-3.5 w-3.5" />
                    {record.mileage.toLocaleString()} km
                  </div>
                </div>

                <div className="mb-3 text-sm text-foreground">
                  <p className="font-semibold mb-1">Serviço Realizado:</p>
                  <p className="text-muted-foreground">{record.description}</p>
                </div>

                {record.parts && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {record.parts.split(',').map((s, j) => (
                      <span key={j} className="text-xs bg-muted px-2.5 py-1 rounded-md text-muted-foreground">
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {record.photos && record.photos.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-4">
                    {record.photos.map((photo: string, idx: number) => (
                      <a 
                        key={idx} 
                        href={photo} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="aspect-square rounded-md overflow-hidden border border-border hover:border-accent transition-colors"
                      >
                        <img 
                          src={photo} 
                          alt="Serviço" 
                          className="w-full h-full object-cover"
                        />
                      </a>
                    ))}
                  </div>
                )}

                {record.verified ? (
                  <span className="inline-flex items-center gap-1 text-accent text-xs font-medium">
                    <ShieldCheck className="h-3.5 w-3.5" /> Registo Verificado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-warning text-xs font-medium">
                    <AlertTriangle className="h-3.5 w-3.5" /> Verificação Pendente
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VehicleHistory;
