import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import {
  getMyRecords, updateRecord, deleteRecord,
  isRecordEditable, hoursUntilLocked, type MyRecord, type UpdateRecordPayload,
} from "@/api/records";
import { getMechanics } from "@/api/mechanics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from "@/components/ui/sheet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Wrench, Pencil, Trash2, Loader2, Search, Lock, Clock, Plus } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const SERVICE_TYPES = [
  "Troca de Óleo", "Revisão Geral", "Travões", "Pneus", "Suspensão",
  "Motor", "Caixa de Velocidades", "Electricidade", "Ar Condicionado",
  "Embraiagem", "Escape", "Injecção", "Outro",
];

function EditableTimer({ createdAt }: { createdAt: string }) {
  const hours = hoursUntilLocked(createdAt);
  if (hours <= 0) return null;
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  return (
    <span className="flex items-center gap-1 text-[10px] text-amber-600 font-medium">
      <Clock className="h-3 w-3" />
      Bloqueado em {h > 0 ? `${h}h ` : ""}{m}min
    </span>
  );
}

const WorkshopRecords = () => {
  const { token } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editRecord, setEditRecord] = useState<MyRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MyRecord | null>(null);
  const [form, setForm] = useState<UpdateRecordPayload & { description: string }>({
    description: "",
  });

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["my-records"],
    queryFn: () => getMyRecords(token!),
    enabled: !!token,
  });

  const { data: mechanics = [] } = useQuery({
    queryKey: ["mechanics"],
    queryFn: () => getMechanics(token!, true),
    enabled: !!token,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateRecordPayload }) =>
      updateRecord(id, payload, token!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-records"] });
      toast.success("Registo actualizado");
      setEditRecord(null);
    },
    onError: (e: any) => toast.error(e.message ?? "Erro ao actualizar"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteRecord(id, token!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-records"] });
      toast.success("Registo eliminado");
      setDeleteTarget(null);
    },
    onError: (e: any) => {
      toast.error(e.message ?? "Erro ao eliminar");
      setDeleteTarget(null);
    },
  });

  const filtered = records.filter(r =>
    !search ||
    r.car.plateNumber.toLowerCase().includes(search.toLowerCase()) ||
    r.car.brand.toLowerCase().includes(search.toLowerCase()) ||
    (r.serviceType ?? "").toLowerCase().includes(search.toLowerCase()) ||
    r.description.toLowerCase().includes(search.toLowerCase()),
  );

  const openEdit = (r: MyRecord) => {
    setEditRecord(r);
    setForm({
      mileage: r.mileage,
      serviceType: r.serviceType ?? undefined,
      description: r.description,
      parts: r.parts ?? undefined,
      cost: r.cost ?? undefined,
      nextServiceMileage: r.nextServiceMileage ?? undefined,
      mechanicId: r.mechanic?.id ?? undefined,
    });
  };

  const handleSave = () => {
    if (!editRecord) return;
    updateMutation.mutate({ id: editRecord.id, payload: form });
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Os Meus Registos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {records.length} registo{records.length !== 1 ? "s" : ""} de manutenção
          </p>
        </div>
        <Button asChild>
          <Link to="/registar-servico">
            <Plus className="mr-2 h-4 w-4" /> Novo Registo
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar por matrícula, serviço..."
          className="pl-9"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Wrench className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p>{search ? "Nenhum registo encontrado." : "Ainda não registou nenhum serviço."}</p>
          {!search && (
            <Button asChild className="mt-4" variant="outline">
              <Link to="/registar-servico">Criar primeiro registo</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => {
            const editable = isRecordEditable(r.createdAt);
            return (
              <div
                key={r.id}
                className="bg-card border border-border rounded-xl p-4 shadow-card hover:shadow-card-hover transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  {/* Car photo thumbnail */}
                  {r.car.photos?.[0] && (
                    <div className="h-14 w-20 rounded-lg overflow-hidden shrink-0 bg-muted hidden sm:block">
                      <img src={r.car.photos[0]} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
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
                    <p className="text-sm text-foreground line-clamp-1">{r.description}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      <span>{format(new Date(r.date), "dd MMM yyyy", { locale: ptBR })}</span>
                      <span>{r.mileage.toLocaleString("pt-PT")} km</span>
                      {r.cost && <span className="font-semibold text-foreground">{r.cost.toLocaleString("pt-PT")} MT</span>}
                      {r.mechanic && <span>{r.mechanic.name}</span>}
                      {editable ? (
                        <EditableTimer createdAt={r.createdAt} />
                      ) : (
                        <span className="flex items-center gap-1 text-muted-foreground/60">
                          <Lock className="h-3 w-3" /> Bloqueado
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0 self-start">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      disabled={!editable}
                      title={!editable ? "Prazo de edição expirado (48h)" : "Editar registo"}
                      onClick={() => openEdit(r)}
                    >
                      {editable ? <Pencil className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                      <span className="hidden sm:inline">{editable ? "Editar" : "Bloqueado"}</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-destructive hover:text-destructive"
                      disabled={!editable}
                      title={!editable ? "Prazo de eliminação expirado (48h)" : "Eliminar registo"}
                      onClick={() => setDeleteTarget(r)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info banner */}
      {records.length > 0 && (
        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 border border-border">
          <Lock className="h-4 w-4 shrink-0 mt-0.5" />
          <span>Os registos só podem ser editados ou eliminados nas primeiras <strong>48 horas</strong> após a criação. Após esse prazo ficam permanentes.</span>
        </div>
      )}

      {/* Edit Sheet */}
      <Sheet open={!!editRecord} onOpenChange={open => { if (!open) setEditRecord(null); }}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              Editar Registo — {editRecord?.car.plateNumber}
            </SheetTitle>
            {editRecord && (
              <p className="text-sm text-muted-foreground">
                {editRecord.car.brand} {editRecord.car.model} · {format(new Date(editRecord.date), "dd MMM yyyy", { locale: ptBR })}
              </p>
            )}
          </SheetHeader>

          <div className="space-y-4 mt-6">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Quilometragem *</Label>
                <Input
                  className="mt-1" type="number" min={0}
                  value={form.mileage ?? ""}
                  onChange={e => setForm(f => ({ ...f, mileage: e.target.value ? Number(e.target.value) : undefined }))}
                />
              </div>
              <div>
                <Label>Tipo de Serviço</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.serviceType ?? ""}
                  onChange={e => setForm(f => ({ ...f, serviceType: e.target.value || undefined }))}
                >
                  <option value="">-- Selecione --</option>
                  {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <Label>Descrição *</Label>
              <Textarea
                className="mt-1 resize-none" rows={3}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div>
              <Label>Peças Utilizadas</Label>
              <Textarea
                className="mt-1 resize-none" rows={2}
                placeholder="Filtro de óleo, pastilhas..."
                value={form.parts ?? ""}
                onChange={e => setForm(f => ({ ...f, parts: e.target.value || undefined }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Custo (MT)</Label>
                <Input
                  className="mt-1" type="number" min={0}
                  value={form.cost ?? ""}
                  onChange={e => setForm(f => ({ ...f, cost: e.target.value ? Number(e.target.value) : undefined }))}
                />
              </div>
              <div>
                <Label>Próx. Serviço (km)</Label>
                <Input
                  className="mt-1" type="number" min={0}
                  value={form.nextServiceMileage ?? ""}
                  onChange={e => setForm(f => ({ ...f, nextServiceMileage: e.target.value ? Number(e.target.value) : undefined }))}
                />
              </div>
            </div>

            {mechanics.length > 0 && (
              <div>
                <Label>Mecânico</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.mechanicId ?? ""}
                  onChange={e => setForm(f => ({ ...f, mechanicId: e.target.value ? Number(e.target.value) : undefined }))}
                >
                  <option value="">-- Sem mecânico --</option>
                  {mechanics.map(m => <option key={m.id} value={m.id}>{m.name}{m.specialty ? ` — ${m.specialty}` : ""}</option>)}
                </select>
              </div>
            )}
          </div>

          <SheetFooter className="mt-6 gap-2 flex-row">
            <Button variant="outline" className="flex-1" onClick={() => setEditRecord(null)}>Cancelar</Button>
            <Button
              className="flex-1"
              disabled={updateMutation.isPending || !form.description?.trim()}
              onClick={handleSave}
            >
              {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar registo?</AlertDialogTitle>
            <AlertDialogDescription>
              O registo de <strong>{deleteTarget?.serviceType ?? "serviço"}</strong> na viatura{" "}
              <strong>{deleteTarget?.car.plateNumber}</strong> será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            >
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WorkshopRecords;
