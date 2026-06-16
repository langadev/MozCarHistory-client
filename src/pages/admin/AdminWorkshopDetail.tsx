import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch, withAuthToken } from "@/api/client";
import { updateWorkshopVerify, updateWorkshopStatus, resetUserPassword } from "@/api/admin";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChevronLeft, ShieldCheck, ShieldOff, Car, Wrench, UserCog,
  Mail, Phone, MapPin, Hash, Calendar, Loader2, ExternalLink,
  KeyRound, RefreshCw, Copy, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

const STATUS_BADGE: Record<string, string> = {
  pendente: "bg-amber-100 text-amber-700 border-amber-200",
  aprovada: "bg-green-100 text-green-700 border-green-200",
  rejeitada: "bg-red-100 text-red-700 border-red-200",
};

const TABS = ["Viaturas", "Registos", "Mecânicos"] as const;
type Tab = typeof TABS[number];

const AdminWorkshopDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("Viaturas");
  const [resetOpen, setResetOpen] = useState(false);
  const [resetPwd, setResetPwd] = useState(generatePassword());
  const [resetDone, setResetDone] = useState(false);

  const { data: workshop, isLoading } = useQuery({
    queryKey: ["admin-workshop-detail", id],
    queryFn: () => apiFetch<any>(`/admin/workshops/${id}`, { headers: withAuthToken(token!) }),
    enabled: !!token && !!id,
  });

  const verifyMutation = useMutation({
    mutationFn: (verified: boolean) => updateWorkshopVerify(token!, Number(id), verified),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-workshop-detail", id] });
      qc.invalidateQueries({ queryKey: ["admin-workshops"] });
      toast.success("Verificação actualizada");
    },
    onError: (e: any) => toast.error(e.message ?? "Erro"),
  });

  const statusMutation = useMutation({
    mutationFn: (suspended: boolean) => updateWorkshopStatus(token!, Number(id), suspended),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-workshop-detail", id] });
      qc.invalidateQueries({ queryKey: ["admin-workshops"] });
      toast.success("Estado actualizado");
    },
    onError: (e: any) => toast.error(e.message ?? "Erro"),
  });

  const resetMutation = useMutation({
    mutationFn: (password: string) => resetUserPassword(token!, Number(id), password),
    onSuccess: () => setResetDone(true),
    onError: (e: any) => toast.error(e.message ?? "Erro ao resetar senha"),
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </AdminLayout>
    );
  }

  if (!workshop) {
    return (
      <AdminLayout>
        <div className="p-6 text-center text-muted-foreground">Oficina não encontrada.</div>
      </AdminLayout>
    );
  }

  const cars = workshop.registeredCars ?? [];
  const records = workshop.records ?? [];
  const mechanics = workshop.workshopMechanics ?? [];

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate("/admin/oficinas")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar às oficinas
        </button>

        {/* Header card */}
        <div className="bg-card border border-border rounded-xl p-5 md:p-6 shadow-card">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <Wrench className="h-7 w-7 text-accent" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="font-display text-xl md:text-2xl font-bold text-foreground">
                    {workshop.name ?? "Sem nome"}
                  </h1>
                  {workshop.verified ? (
                    <Badge className="gap-1 bg-green-100 text-green-700 border-green-200">
                      <ShieldCheck className="h-3 w-3" /> Verificada
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1 text-amber-600 border-amber-300 bg-amber-50">
                      <AlertTriangle className="h-3 w-3" /> Não verificada
                    </Badge>
                  )}
                  {workshop.suspended && (
                    <Badge variant="destructive">Suspensa</Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{workshop.email}</span>
                  {workshop.phone && <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{workshop.phone}</span>}
                  {workshop.nuit && <span className="flex items-center gap-1.5"><Hash className="h-3.5 w-3.5" />NUIT: {workshop.nuit}</span>}
                  {workshop.address && <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{workshop.address}</span>}
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Registada em {format(new Date(workshop.createdAt), "dd MMM yyyy", { locale: ptBR })}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 shrink-0">
              <Button
                size="sm"
                variant={workshop.verified ? "outline" : "default"}
                className={workshop.verified ? "text-destructive border-destructive/30 hover:bg-destructive/5" : "bg-green-600 hover:bg-green-700 text-white"}
                disabled={verifyMutation.isPending}
                onClick={() => verifyMutation.mutate(!workshop.verified)}
              >
                {workshop.verified ? <ShieldOff className="mr-1.5 h-3.5 w-3.5" /> : <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />}
                {workshop.verified ? "Remover verificação" : "Verificar"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className={workshop.suspended ? "text-green-600" : "text-destructive"}
                disabled={statusMutation.isPending}
                onClick={() => statusMutation.mutate(!workshop.suspended)}
              >
                {workshop.suspended ? "Activar" : "Suspender"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => { setResetPwd(generatePassword()); setResetDone(false); setResetOpen(true); }}
              >
                <KeyRound className="mr-1.5 h-3.5 w-3.5" />
                Resetar Senha
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-border">
            {[
              { icon: Car, label: "Viaturas", value: workshop._count?.registeredCars ?? 0 },
              { icon: Wrench, label: "Registos", value: workshop._count?.records ?? 0 },
              { icon: UserCog, label: "Mecânicos", value: workshop._count?.workshopMechanics ?? 0 },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="text-center p-3 bg-muted/40 rounded-lg">
                <Icon className="h-5 w-5 text-accent mx-auto mb-1" />
                <p className="text-xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border flex gap-0">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === tab
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
              <span className="ml-1.5 text-xs text-muted-foreground">
                {tab === "Viaturas" && `(${cars.length})`}
                {tab === "Registos" && `(${records.length})`}
                {tab === "Mecânicos" && `(${mechanics.length})`}
              </span>
            </button>
          ))}
        </div>

        {/* Tab: Viaturas */}
        {activeTab === "Viaturas" && (
          <div>
            {cars.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Car className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p>Esta oficina ainda não registou nenhuma viatura.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cars.map((car: any) => (
                  <Link
                    key={car.id}
                    to={`/historico?plate=${encodeURIComponent(car.plateNumber)}`}
                    target="_blank"
                    className="bg-card border border-border rounded-lg overflow-hidden shadow-card hover:shadow-card-hover hover:border-accent/40 transition-all group block"
                  >
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      {car.photos?.[0] ? (
                        <img src={car.photos[0]} alt={`${car.brand} ${car.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                          <Car className="h-12 w-12" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2">
                        <span className="bg-background/90 backdrop-blur-sm text-foreground px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-border">
                          {car.plateNumber}
                        </span>
                      </div>
                      <div className="absolute top-2 right-2">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_BADGE[car.approvalStatus] ?? ""}`}>
                          {car.approvalStatus === "pendente" ? "Pendente" : car.approvalStatus === "aprovada" ? "Aprovada" : "Rejeitada"}
                        </span>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="font-semibold text-sm text-foreground group-hover:text-accent transition-colors">
                        {car.brand} {car.model}{car.year ? ` (${car.year})` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {car._count?.records ?? 0} registo{(car._count?.records ?? 0) !== 1 ? "s" : ""}
                        {car.color && ` · ${car.color}`}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Registos */}
        {activeTab === "Registos" && (
          <div>
            {records.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Wrench className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p>Esta oficina ainda não tem registos de manutenção.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {records.map((r: any) => (
                  <div key={r.id} className="bg-card border border-border rounded-lg p-4 shadow-card">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <Link
                            to={`/historico?plate=${encodeURIComponent(r.car?.plateNumber)}`}
                            target="_blank"
                            className="font-mono font-bold text-sm text-foreground hover:text-accent transition-colors"
                          >
                            {r.car?.plateNumber}
                          </Link>
                          <span className="text-muted-foreground text-sm">{r.car?.brand} {r.car?.model}</span>
                          {r.serviceType && (
                            <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">{r.serviceType}</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{r.description}</p>
                        {r.mechanic?.name && (
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                            <UserCog className="h-3 w-3" /> {r.mechanic.name}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0 text-xs text-muted-foreground">
                        <span>{format(new Date(r.date), "dd MMM yyyy", { locale: ptBR })}</span>
                        {r.cost && <span className="font-semibold text-foreground">{r.cost.toLocaleString("pt-PT")} MT</span>}
                        <span>{r.mileage.toLocaleString("pt-PT")} km</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Mecânicos */}
        {activeTab === "Mecânicos" && (
          <div>
            {mechanics.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <UserCog className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p>Esta oficina ainda não tem mecânicos registados.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mechanics.map((m: any) => (
                  <div key={m.id} className="bg-card border border-border rounded-lg p-4 shadow-card flex items-start gap-3">
                    {m.photo ? (
                      <img src={m.photo} alt={m.name} className="h-12 w-12 rounded-full object-cover border border-border shrink-0" />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                        <span className="text-lg font-bold text-accent">{m.name.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm text-foreground truncate">{m.name}</p>
                        <Badge
                          variant={m.active ? "default" : "secondary"}
                          className={m.active ? "text-[10px] bg-accent/10 text-accent border-accent/20" : "text-[10px]"}
                        >
                          {m.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      {m.specialty && <p className="text-xs text-muted-foreground mt-0.5">{m.specialty}</p>}
                      {m.phone && (
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {m.phone}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reset Password Dialog */}
      <Dialog open={resetOpen} onOpenChange={(open) => { if (!open) { setResetOpen(false); setResetDone(false); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Resetar Senha</DialogTitle>
          </DialogHeader>
          {resetDone ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-green-800">
                <p className="font-semibold text-sm mb-3">Senha redefinida com sucesso.</p>
                <div className="flex items-center justify-between bg-white rounded border px-3 py-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Nova senha temporária</p>
                    <p className="text-sm font-mono font-medium">{resetPwd}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(resetPwd)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs mt-3 text-green-700">A oficina será obrigada a alterar a senha no próximo login.</p>
              </div>
              <DialogFooter>
                <Button onClick={() => { setResetOpen(false); setResetDone(false); }}>Fechar</Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Nova senha temporária para <span className="font-medium text-foreground">{workshop.name ?? workshop.email}</span>.
              </p>
              <div>
                <Label>Senha Temporária</Label>
                <div className="flex gap-2 mt-1">
                  <Input className="font-mono" value={resetPwd} onChange={(e) => setResetPwd(e.target.value)} />
                  <Button type="button" variant="outline" size="icon" onClick={() => setResetPwd(generatePassword())}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setResetOpen(false)}>Cancelar</Button>
                <Button
                  disabled={!resetPwd.trim() || resetMutation.isPending}
                  onClick={() => resetMutation.mutate(resetPwd)}
                >
                  {resetMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Resetar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminWorkshopDetail;
