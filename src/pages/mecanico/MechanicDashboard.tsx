import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Car, Wrench, Loader2, Calendar, MapPin, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch, withAuthToken } from "@/api/client";

const MechanicDashboard = () => {
  const { token } = useAuth();

  const { data: vehicles = [], isLoading: loadingVehicles } = useQuery({
    queryKey: ["mechanic-vehicles"],
    queryFn: () =>
      apiFetch<any[]>("/mechanics/me/vehicles", { headers: withAuthToken(token!) }),
    enabled: !!token,
  });

  const { data: records = [], isLoading: loadingRecords } = useQuery({
    queryKey: ["mechanic-records"],
    queryFn: () =>
      apiFetch<any[]>("/mechanics/me/records", { headers: withAuthToken(token!) }),
    enabled: !!token,
  });

  const isLoading = loadingVehicles || loadingRecords;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
            <div>
              <h1 className="font-display text-xl md:text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Viaturas e serviços da oficina</p>
            </div>
            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90 shrink-0">
              <Link to="/mecanico/registar-servico">
                <Plus className="mr-2 h-4 w-4" />
                Registar Serviço
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Recent services */}
              <section>
                <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-accent" />
                  Os meus últimos serviços
                </h2>
                {records.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Ainda não registou nenhum serviço.</p>
                ) : (
                  <div className="space-y-3">
                    {records.map((r: any) => (
                      <div
                        key={r.id}
                        className="bg-card border border-border rounded-lg p-4 shadow-card"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <p className="font-medium text-foreground">
                              {r.car?.brand} {r.car?.model}{" "}
                              <span className="font-mono text-sm bg-muted px-1.5 py-0.5 rounded">
                                {r.car?.plateNumber}
                              </span>
                            </p>
                            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                              {r.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {r.workshop?.name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(r.date).toLocaleDateString("pt-PT")}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Workshop vehicles */}
              <section>
                <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Car className="h-5 w-5 text-accent" />
                  Viaturas da oficina ({vehicles.length})
                </h2>
                {vehicles.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Nenhuma viatura registada ainda.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vehicles.map((v: any) => (
                      <Link
                        key={v.id}
                        to={`/historico?plate=${v.plateNumber}`}
                        className="bg-card border border-border rounded-lg p-4 shadow-card hover:shadow-card-hover transition-shadow block"
                      >
                        <div className="flex items-start gap-3">
                          {v.photos?.[0] ? (
                            <img
                              src={v.photos[0]}
                              alt={`${v.brand} ${v.model}`}
                              className="h-12 w-12 rounded-md object-cover border border-border shrink-0"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center shrink-0">
                              <Car className="h-5 w-5 text-muted-foreground/50" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-foreground text-sm truncate">{v.brand} {v.model}</p>
                            <p className="font-mono text-xs text-muted-foreground mt-0.5">{v.plateNumber}</p>
                            {v.records?.[0] && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                Últ: {v.records[0].description}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MechanicDashboard;
