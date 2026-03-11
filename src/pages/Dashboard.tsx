import { motion } from "framer-motion";
import { Car, Wrench, Star, ShieldCheck, Plus, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

const monthlyData = [
  { mes: "Jan", servicos: 12 },
  { mes: "Fev", servicos: 19 },
  { mes: "Mar", servicos: 15 },
  { mes: "Abr", servicos: 22 },
  { mes: "Mai", servicos: 28 },
  { mes: "Jun", servicos: 35 },
];

const serviceTypes = [
  { name: "Manutenção Geral", value: 40 },
  { name: "Travões", value: 20 },
  { name: "Motor", value: 15 },
  { name: "Suspensão", value: 15 },
  { name: "Elétrica", value: 10 },
];

const COLORS = ["hsl(152,60%,38%)", "hsl(215,80%,22%)", "hsl(38,92%,50%)", "hsl(215,60%,25%)", "hsl(200,50%,30%)"];

const Dashboard = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      if (!user?.id) return;
      try {
        const response = await fetch(`http://localhost:3000/maintenance/workshop/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setRecords(data);
        }
      } catch (error) {
        console.error("Erro dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecords();
  }, [user]);

  // Derived stats
  const totalVehicles = new Set(records.map(r => r.plateNumber)).size;
  const recentThisMonth = records.filter(r => {
    const d = new Date(r.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  
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
            <Link to="/registar-servico">
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Plus className="mr-2 h-4 w-4" />
                Registar Novo Serviço
              </Button>
            </Link>
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
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                   <tr>
                    <td colSpan={5} className="p-8 text-center">
                      <Loader2 className="h-6 w-6 text-accent animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : records.length > 0 ? (
                  records.slice(0, 5).map((row, i) => (
                    <tr key={i} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-mono font-medium text-foreground">{row.plateNumber}</td>
                      <td className="p-3 text-foreground">{row.brandModel}</td>
                      <td className="p-3 text-muted-foreground truncate max-w-[200px]">{row.description}</td>
                      <td className="p-3 text-muted-foreground">{new Date(row.date).toLocaleDateString('pt-PT')}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 text-accent text-xs font-medium bg-accent/10 px-2 py-0.5 rounded-full">
                          <ShieldCheck className="h-3 w-3" /> Verificado
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
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
