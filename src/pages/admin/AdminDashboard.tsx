import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getAdminStats } from "@/api/admin";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, Car, FileText, Loader2, Clock } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const COLORS = ["hsl(var(--accent))", "hsl(var(--muted))"];

const statCards = (stats: { totalUsers: number; totalWorkshops: number; totalVehicles: number; totalRecords: number; pendingVehicles: number }) => [
  { label: "Utilizadores", value: stats.totalUsers, icon: Users, highlight: false },
  { label: "Oficinas", value: stats.totalWorkshops, icon: Building2, highlight: false },
  { label: "Viaturas", value: stats.totalVehicles, icon: Car, highlight: false },
  { label: "Registos", value: stats.totalRecords, icon: FileText, highlight: false },
  { label: "Viaturas Pendentes", value: stats.pendingVehicles, icon: Clock, highlight: stats.pendingVehicles > 0 },
];

const AdminDashboard = () => {
  const { token } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => getAdminStats(token!),
    enabled: !!token,
  });

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <h1 className="text-xl md:text-2xl font-semibold">Dashboard</h1>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : data ? (
          <>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {statCards(data).map(({ label, value, icon: Icon, highlight }) => (
                <Card key={label} className={highlight ? "border-amber-300 bg-amber-50" : ""}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className={`text-sm font-medium ${highlight ? "text-amber-700" : "text-muted-foreground"}`}>{label}</CardTitle>
                    <Icon className={`h-4 w-4 ${highlight ? "text-amber-500" : "text-muted-foreground"}`} />
                  </CardHeader>
                  <CardContent>
                    <p className={`text-3xl font-bold ${highlight ? "text-amber-700" : ""}`}>{value.toLocaleString("pt")}</p>
                    {highlight && <p className="text-xs text-amber-600 mt-1">Aguardam aprovação</p>}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Actividade Recente (registos)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.recentRecords.map((r) => (
                      <div key={r.id} className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-medium">{r.car.plateNumber} — {r.car.brand} {r.car.model}</p>
                          <p className="text-xs text-muted-foreground">{r.workshop.name}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(r.date), "dd MMM yyyy", { locale: ptBR })}
                        </span>
                      </div>
                    ))}
                    {data.recentRecords.length === 0 && (
                      <p className="text-sm text-muted-foreground">Sem registos recentes.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Visão Geral</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center pt-2">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Oficinas", value: data.totalWorkshops },
                          { name: "Outros utilizadores", value: data.totalUsers - data.totalWorkshops },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {COLORS.map((color, i) => (
                          <Cell key={i} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
