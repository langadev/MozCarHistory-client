import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getAdminStats, getAdminFinanceStats, type AdminStats } from "@/api/admin";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users, Building2, Car, FileText, Loader2, Clock,
  TrendingUp, TrendingDown, DollarSign, Wrench, BarChart3,
  UserCog, Calendar, History,
} from "lucide-react";
import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";

const COLORS = ["hsl(var(--accent))", "#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

const PT_MONTHS: Record<string, string> = {
  "01": "Jan", "02": "Fev", "03": "Mar", "04": "Abr",
  "05": "Mai", "06": "Jun", "07": "Jul", "08": "Ago",
  "09": "Set", "10": "Out", "11": "Nov", "12": "Dez",
};

function monthLabel(key: string) {
  const [, mm] = key.split("-");
  return PT_MONTHS[mm] ?? key;
}

function fmt(n: number) {
  return n.toLocaleString("pt-PT");
}

function pctChange(current: number, previous: number) {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

const statCards = (stats: {
  totalUsers: number; totalWorkshops: number;
  totalVehicles: number; totalRecords: number; pendingVehicles: number;
}) => [
  { label: "Utilizadores", value: stats.totalUsers, icon: Users, highlight: false },
  { label: "Oficinas", value: stats.totalWorkshops, icon: Building2, highlight: false },
  { label: "Viaturas", value: stats.totalVehicles, icon: Car, highlight: false },
  { label: "Registos", value: stats.totalRecords, icon: FileText, highlight: false },
  { label: "Pendentes", value: stats.pendingVehicles, icon: Clock, highlight: stats.pendingVehicles > 0 },
];

type RecentRecord = AdminStats["recentRecords"][number];

function RecentRecordsSection({ records }: { records: RecentRecord[] }) {
  const [search, setSearch] = useState("");
  const [show, setShow] = useState(10);

  const filtered = records.filter(r =>
    !search ||
    r.car.plateNumber.toLowerCase().includes(search.toLowerCase()) ||
    (r.workshop.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (r.mechanic?.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (r.serviceType ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <History className="h-5 w-5 text-accent" />
        <h2 className="text-lg font-semibold">Histórico de Registos</h2>
        <span className="text-sm text-muted-foreground ml-1">({records.length} mais recentes)</span>
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-4">
        <Car className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Filtrar por matrícula, oficina, mecânico..."
          value={search}
          onChange={e => { setSearch(e.target.value); setShow(10); }}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">Nenhum registo encontrado.</p>
      ) : (
        <>
          <div className="space-y-2">
            {filtered.slice(0, show).map(r => (
              <div
                key={r.id}
                className="bg-card border border-border rounded-xl p-4 hover:border-accent/30 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  {/* Car photo */}
                  {r.car.photos?.[0] && (
                    <div className="hidden sm:block h-14 w-20 shrink-0 rounded-lg overflow-hidden bg-muted">
                      <img src={r.car.photos[0]} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Main info */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    {/* Row 1: plate + service type */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/historico?plate=${encodeURIComponent(r.car.plateNumber)}`}
                        className="font-mono font-bold text-sm text-foreground hover:text-accent transition-colors"
                      >
                        {r.car.plateNumber}
                      </Link>
                      <span className="text-sm text-muted-foreground">{r.car.brand} {r.car.model}</span>
                      {r.serviceType && (
                        <span className="text-[10px] font-semibold bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                          {r.serviceType}
                        </span>
                      )}
                    </div>

                    {/* Row 2: description */}
                    <p className="text-sm text-foreground/80 line-clamp-1">{r.description}</p>

                    {/* Row 3: meta */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {/* Workshop */}
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        <Link
                          to={`/admin/oficinas/${r.workshop.id}`}
                          className="hover:text-accent transition-colors"
                        >
                          {r.workshop.name ?? "—"}
                        </Link>
                      </span>

                      {/* Mechanic */}
                      {r.mechanic && (
                        <span className="flex items-center gap-1">
                          <UserCog className="h-3 w-3" />
                          {r.mechanic.name}
                          {r.mechanic.specialty && (
                            <span className="text-muted-foreground/60">· {r.mechanic.specialty}</span>
                          )}
                        </span>
                      )}

                      {/* Mileage */}
                      <span className="flex items-center gap-1">
                        <Car className="h-3 w-3" />
                        {r.mileage.toLocaleString("pt-PT")} km
                      </span>

                      {/* Cost */}
                      {r.cost && (
                        <span className="font-semibold text-foreground">{r.cost.toLocaleString("pt-PT")} MT</span>
                      )}
                    </div>
                  </div>

                  {/* Date/Time column */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-1 shrink-0 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-medium text-foreground">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(r.date), "dd MMM yyyy", { locale: ptBR })}
                    </span>
                    <span className="text-muted-foreground/70">
                      Registado {format(new Date(r.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length > show && (
            <button
              onClick={() => setShow(s => s + 10)}
              className="mt-3 w-full rounded-lg border border-dashed border-border py-2.5 text-sm text-muted-foreground hover:text-accent hover:border-accent/50 transition-colors"
            >
              Ver mais {Math.min(10, filtered.length - show)} registos
            </button>
          )}
        </>
      )}
    </div>
  );
}

const AdminDashboard = () => {
  const { token } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => getAdminStats(token!),
    enabled: !!token,
  });

  const { data: finance, isLoading: financeLoading } = useQuery({
    queryKey: ["admin-finance"],
    queryFn: () => getAdminFinanceStats(token!),
    enabled: !!token,
  });

  const change = finance ? pctChange(finance.thisMonthRevenue, finance.lastMonthRevenue) : null;

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6 md:space-y-8">
        <h1 className="text-xl md:text-2xl font-semibold">Dashboard</h1>

        {/* ── Operações ── */}
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
                    <CardTitle className={`text-sm font-medium ${highlight ? "text-amber-700" : "text-muted-foreground"}`}>
                      {label}
                    </CardTitle>
                    <Icon className={`h-4 w-4 ${highlight ? "text-amber-500" : "text-muted-foreground"}`} />
                  </CardHeader>
                  <CardContent>
                    <p className={`text-3xl font-bold ${highlight ? "text-amber-700" : ""}`}>
                      {value.toLocaleString("pt")}
                    </p>
                    {highlight && <p className="text-xs text-amber-600 mt-1">Aguardam aprovação</p>}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Visão Geral de Utilizadores</CardTitle>
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
                        {COLORS.map((color, i) => <Cell key={i} fill={color} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* ── Histórico de Registos ── */}
            <RecentRecordsSection records={data.recentRecords} />
          </>
        ) : null}

        {/* ── Finanças ── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold">Finanças</h2>
          </div>

          {financeLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : finance ? (
            <div className="space-y-5">
              {/* Summary cards */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Receita Total</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{fmt(finance.totalRevenue)} MT</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {finance.totalRecordsWithCost} serviço{finance.totalRecordsWithCost !== 1 ? "s" : ""} com custo
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Este Mês</CardTitle>
                    {change !== null
                      ? change >= 0
                        ? <TrendingUp className="h-4 w-4 text-green-500" />
                        : <TrendingDown className="h-4 w-4 text-red-500" />
                      : <DollarSign className="h-4 w-4 text-muted-foreground" />
                    }
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{fmt(finance.thisMonthRevenue)} MT</p>
                    {change !== null && (
                      <p className={`text-xs mt-1 font-medium ${change >= 0 ? "text-green-600" : "text-red-500"}`}>
                        {change >= 0 ? "+" : ""}{change.toFixed(1)}% vs mês anterior
                      </p>
                    )}
                    {change === null && (
                      <p className="text-xs text-muted-foreground mt-1">{finance.thisMonthCount} registos</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Mês Anterior</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{fmt(finance.lastMonthRevenue)} MT</p>
                    <p className="text-xs text-muted-foreground mt-1">{finance.lastMonthCount} registos</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Custo Médio</CardTitle>
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{fmt(finance.avgCost)} MT</p>
                    <p className="text-xs text-muted-foreground mt-1">por serviço</p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts row */}
              <div className="grid gap-4 lg:grid-cols-3">
                {/* Monthly revenue bar chart */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Receita Mensal (últimos 6 meses)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {finance.monthlyRevenue.every(m => m.revenue === 0) ? (
                      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                        Sem dados de custo registados ainda.
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={finance.monthlyRevenue.map(m => ({ ...m, label: monthLabel(m.month) }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                          <Tooltip
                            formatter={(value: number) => [`${fmt(value)} MT`, "Receita"]}
                            labelFormatter={(label) => `Mês: ${label}`}
                          />
                          <Bar dataKey="revenue" name="Receita" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                {/* Revenue by service type */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Por Tipo de Serviço</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {finance.revenueByServiceType.length === 0 ? (
                      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                        Sem dados disponíveis.
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={finance.revenueByServiceType}
                            dataKey="revenue"
                            nameKey="serviceType"
                            cx="50%"
                            cy="50%"
                            outerRadius={75}
                            label={({ serviceType, percent }) =>
                              percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ""
                            }
                            labelLine={false}
                          >
                            {finance.revenueByServiceType.map((_, i) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v: number) => [`${fmt(v)} MT`, "Receita"]} />
                          <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Top workshops */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Top Oficinas por Receita</CardTitle>
                </CardHeader>
                <CardContent>
                  {finance.topWorkshops.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhuma oficina com custo registado.</p>
                  ) : (
                    <div className="space-y-3">
                      {finance.topWorkshops.map((w, i) => {
                        const maxRevenue = finance.topWorkshops[0]?.revenue ?? 1;
                        const pct = maxRevenue > 0 ? (w.revenue / maxRevenue) * 100 : 0;
                        return (
                          <div key={w.id}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                                <Link
                                  to={`/admin/oficinas/${w.id}`}
                                  className="text-sm font-medium hover:text-accent transition-colors"
                                >
                                  {w.name}
                                </Link>
                                <span className="text-xs text-muted-foreground">
                                  ({w.records} registo{w.records !== 1 ? "s" : ""})
                                </span>
                              </div>
                              <span className="text-sm font-semibold text-accent">{fmt(w.revenue)} MT</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-accent rounded-full transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
