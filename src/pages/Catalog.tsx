import { motion } from "framer-motion";
import { Car, Search, ShieldCheck, MapPin, Gauge, History, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getAllVehicles, VehicleSummary } from "@/api/records";

const Catalog = () => {
    const [vehicles, setVehicles] = useState<VehicleSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const data = await getAllVehicles();
                setVehicles(data);
                if (data.length === 0) {
                    toast.error("Nenhuma viatura encontrada no catálogo.");
                }
            } catch (error: any) {
                console.error("Erro ao carregar catálogo:", error);
                toast.error(error?.message || "Erro ao carregar catálogo de viaturas");
            } finally {
                setIsLoading(false);
            }
        };
        fetchVehicles();
    }, []);

    const filteredVehicles = vehicles.filter(v => 
        v.car?.brandModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.car?.plateNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background pb-12">
            {/* Hero Section */}
            <div className="bg-accent/5 border-b border-border py-12 mb-8">
                <div className="container mx-auto px-4 text-center">
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4"
                    >
                        Catálogo de Viaturas Registadas
                    </motion.h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                        Explore as viaturas com histórico de manutenção verificado na nossa rede de oficinas.
                        Transparência e segurança para quem compra e vende.
                    </p>
                    <div className="max-w-md mx-auto relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Pesquisar por marca, modelo ou matrícula..." 
                            className="pl-10 h-12 bg-card"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-10 w-10 text-accent animate-spin mb-4" />
                        <p className="text-muted-foreground">A carregar viaturas...</p>
                    </div>
                ) : filteredVehicles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredVehicles.map((vehicle, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-card border border-border rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all group"
                            >
                                {/* Video/Photo Placeholder or Real Photo */}
                                <div className="aspect-video bg-muted relative overflow-hidden">
                                    {(vehicle.car?.photos?.length || 0) > 0 || (vehicle.photos?.length || 0) > 0 ? (
                                        <img 
                                            src={vehicle.car?.photos?.[0] || vehicle.photos?.[0]} 
                                            alt={vehicle.car?.brandModel}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                                            <Car className="h-16 w-16" />
                                        </div>
                                    )}
                                    <div className="absolute top-3 left-3">
                                        <div className="bg-background/90 backdrop-blur-sm px-2.5 py-1 rounded-md border border-border text-[10px] font-mono font-bold">
                                            {vehicle.car?.plateNumber}
                                        </div>
                                    </div>
                                    {((vehicle.car?.photos?.length || 0) + (vehicle.photos?.length || 0)) > 1 && (
                                        <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full">
                                            +{(vehicle.car?.photos?.length || 0) + (vehicle.photos?.length || 0) - 1} fotos
                                        </div>
                                    )}
                                </div>

                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-display font-bold text-lg text-foreground group-hover:text-accent transition-colors">
                                                {vehicle.car?.brandModel}
                                            </h3>
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                                                <MapPin className="h-3 w-3" />
                                                Última: {vehicle.workshop?.name || "N/A"}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 text-accent bg-accent/10 px-2 py-1 rounded-full text-[10px] font-bold">
                                            <ShieldCheck className="h-3 w-3" />
                                            VERIFICADO
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/50 mb-4">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Quilometragem</span>
                                            <div className="flex items-center gap-1.5 font-medium text-sm">
                                                <Gauge className="h-3.5 w-3.5 text-accent" />
                                                {vehicle.mileage.toLocaleString()} km
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Estado</span>
                                            <div className="flex items-center gap-1.5 font-medium text-sm">
                                                <History className="h-3.5 w-3.5 text-accent" />
                                                {vehicle.description.slice(0, 15)}...
                                            </div>
                                        </div>
                                    </div>

                                    <Link to={`/historico?plate=${vehicle.car?.plateNumber}`}>
                                        <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground group/btn">
                                            Ver Histórico Completo
                                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                        </Button>
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-card border border-dashed border-border rounded-xl">
                        <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma viatura encontrada</h3>
                        <p className="text-muted-foreground">Tente ajustar a sua pesquisa ou volte mais tarde.</p>
                        <Button variant="outline" className="mt-6" onClick={() => setSearchTerm("")}>
                            Limpar Filtros
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Catalog;
