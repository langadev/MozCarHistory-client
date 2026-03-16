import { motion } from "framer-motion";
import { Car, Wrench, Star, ShieldCheck, Plus, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useState, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getWorkshopRecords, VehicleSummary } from "@/api/records";
import { getAllCars, Car as ICar } from "@/api/cars";

const COLORS = ["hsl(152,60%,38%)", "hsl(215,80%,22%)", "hsl(38,92%,50%)", "hsl(215,60%,25%)", "hsl(200,50%,30%)"];

const Dashboard = () => {
  const { user, token } = useAuth();
  const [records, setRecords] = useState<VehicleSummary[]>([]);
  const [cars, setCars] = useState<ICar[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;
      try {
        const [recordsData, carsData] = await Promise.all([
          getWorkshopRecords(user.id, token ?? undefined),
          getAllCars(token ?? undefined)
        ]);
        setRecords(recordsData);
        setCars(carsData);
      } catch (error: any) {
        console.error("Erro dashboard:", error);
        toast.error(error?.message || "Erro ao carregar dados do dashboard");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [user, token]);

  // Derived stats
  const totalVehicles = new Set(records.map(r => r.car?.plateNumber)).size;
  const recentThisMonth = records.filter(r => {
    const d = new Date(r.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const monthlyData = useMemo(() => {
    const monthsNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const now = new Date();
    const last6Months = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      return { mes: monthsNames[d.getMonth()], year: d.getFullYear(), month: d.getMonth(), servicos: 0 };
    }).reverse();

    records.forEach(r => {
      const d = new Date(r.date);
      const match = last6Months.find(m => m.month === d.getMonth() && m.year === d.getFullYear());
      if (match) match.servicos++;
    });

    return last6Months.map(({ mes, servicos }) => ({ mes, servicos }));
  }, [records]);

  const serviceTypes = useMemo(() => {
    const types = {
      "Manutenção Geral": 0,
      "Travões": 0,
      "Motor": 0,
      "Suspensão": 0,
      "Elétrica": 0,
    };
    
    records.forEach(r => {
      const desc = ((r.description || "") + " " + (r.parts || "")).toLowerCase();
      if (desc.includes('motor') || desc.includes('oleo') || desc.includes('óleo')) {
        types["Motor"]++;
      } else if (desc.includes('travoes') || desc.includes('travão') || desc.includes('travões') || desc.includes('pastilha')) {
        types["Travões"]++;
      } else if (desc.includes('suspensa') || desc.includes('suspensão') || desc.includes('amortecedor')) {
        types["Suspensão"]++;
      } else if (desc.includes('eletr') || desc.includes('elétr') || desc.includes('bateria') || desc.includes('luz')) {
        types["Elétrica"]++;
      } else {
        types["Manutenção Geral"]++;
      }
    });

    return Object.entries(types).map(([name, value]) => ({ name, value }));
  }, [records]);

  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Dashboard da Oficina</h1>
            <p className="text-muted-foreground mt-1">{user?.name || "Auto Mecânica Maputo, Lda."}</p>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-3 py-1.5 rounded-full text-sm font-medium">
              <ShieldCheck className="h-4 w-4" />
              Oficina Verificada
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Link to="/registar-viatura">
                <Button variant="outline" className="w-full sm:w-auto border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                  <Car className="mr-2 h-4 w-4" />
                  Registar Nova Viatura
                </Button>
              </Link>
              <Link to="/registar-servico">
                <Button className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Registar Novo Serviço
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Car, label: "Viaturas Únicas", value: totalVehicles.toString(), change: `Total na base de dados` },
            { icon: Wrench, label: "Serviços Realizados", value: records.length.toString(), change: `+${recentThisMonth} este mês` },
            { icon: Star, label: "Pontuação", value: "4.8/5", change: "Excelente" },
            { icon: TrendingUp, label: "Taxa de Verificação", value: "100%", change: "Auditado" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-lg p-5 shadow-card"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <stat.icon className="h-5 w-5 text-accent" />
              </div>
              <div className="text-2xl font-display font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-accent mt-1">{stat.change}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="bg-card border border-border rounded-lg p-6 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-display font-semibold text-foreground">Serviços por Mês</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,88%)" />
                <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "hsl(215,15%,48%)" }} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(215,15%,48%)" }} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(214,20%,88%)", fontSize: 13 }} />
                <Bar dataKey="servicos" fill="hsl(152,60%,38%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="bg-card border border-border rounded-lg p-6 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <Wrench className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-display font-semibold text-foreground">Tipos de Manutenção</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={serviceTypes} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {serviceTypes.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(214,20%,88%)", fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-2">
              {serviceTypes.map((t, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  {t.name}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recently Registered Vehicles */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-lg text-foreground flex items-center gap-2">
              <Car className="h-5 w-5 text-accent" />
              Viaturas Registadas Recentemente
            </h3>
            <Link to="/consulta" className="text-sm text-accent hover:underline font-medium">
              Ver Catálogo
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[4/3] bg-muted animate-pulse rounded-lg" />
              ))
            ) : cars.length > 0 ? (
              cars.slice(0, 6).map((car, i) => (
                <motion.div
                  key={car.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-card transition-all"
                >
                  <Link to={`/historico?plate=${car.plateNumber}`}>
                    <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                      {car.photos && car.photos.length > 0 ? (
                        <img 
                          src={car.photos[0]} 
                          alt={car.brandModel} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                          <Car className="h-10 w-10" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2">
                        <span className="bg-background/90 backdrop-blur-sm px-1.5 py-0.5 rounded border border-border text-[8px] font-mono font-bold">
                          {car.plateNumber}
                        </span>
                      </div>
                    </div>
                    <div className="p-2 border-t border-border bg-card">
                      <div className="text-[10px] font-bold text-foreground truncate">{car.brandModel}</div>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-8 text-center bg-muted/30 rounded-lg border border-dashed border-border">
                <p className="text-sm text-muted-foreground">Nenhuma viatura registada.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent services */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="bg-card border border-border rounded-lg shadow-card overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="font-display font-semibold text-foreground">Serviços Recentes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 font-medium text-muted-foreground">Matrícula</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Viatura</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Serviço</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Data</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Estado</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Acções</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                   <tr>
                    <td colSpan={6} className="p-8 text-center">
                      <Loader2 className="h-6 w-6 text-accent animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : records.length > 0 ? (
                  records.slice(0, 5).map((row, i) => (
                    <tr key={i} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-mono font-medium text-foreground">{row.car?.plateNumber}</td>
                      <td className="p-3 text-foreground">{row.car?.brandModel}</td>
                      <td className="p-3 text-muted-foreground truncate max-w-[200px]">{row.description}</td>
                      <td className="p-3 text-muted-foreground">{new Date(row.date).toLocaleDateString('pt-PT')}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 text-accent text-xs font-medium bg-accent/10 px-2 py-0.5 rounded-full">
                          <ShieldCheck className="h-3 w-3" /> Verificado
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <Link to={`/historico?plate=${row.car?.plateNumber}`} className="text-accent hover:underline font-medium">
                          Histórico
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      Nenhum serviço registado ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
