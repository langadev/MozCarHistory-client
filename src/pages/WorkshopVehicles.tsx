import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getMyRegisteredCars, updateCar, deleteCar, type MyCar, type UpdateCarPayload } from "@/api/cars";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from "@/components/ui/sheet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Car, Pencil, Trash2, Loader2, Search, Plus } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const SELECT_CLASS =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const FUEL_TYPES = ["Gasolina", "Gasóleo", "Eléctrico", "Híbrido", "GPL"];
const ENGINE_TYPES = ["Aspirado", "Turbo", "Bi-Turbo", "Compressor", "Rotativo", "Eléctrico"];
const TRANSMISSIONS = ["Manual", "Automático", "CVT", "Semi-automático"];
const DRIVE_TYPES = ["Dianteira (FWD)", "Traseira (RWD)", "Integral (AWD)", "4x4 (4WD)"];
const BODY_TYPES = ["Sedan", "SUV", "Pickup", "Hatchback", "Comercial", "Caminhão", "Moto", "Outro"];
const SITUATIONS = ["Recém importado", "Em uso no país há menos de 5 anos", "Em uso no país há mais de 5 anos"];

const STATUS_STYLE: Record<string, string> = {
  pendente: "bg-amber-100 text-amber-700 border-amber-200",
  aprovada: "bg-green-100 text-green-700 border-green-200",
  rejeitada: "bg-red-100 text-red-700 border-red-200",
};
const STATUS_LABEL: Record<string, string> = {
  pendente: "Pendente", aprovada: "Aprovada", rejeitada: "Rejeitada",
};

function carToForm(car: MyCar): UpdateCarPayload & { brand: string; model: string } {
  return {
    brand: car.brand,
    model: car.model,
    year: car.year ?? undefined,
    color: car.color ?? undefined,
    fuelType: car.fuelType ?? undefined,
    engineType: car.engineType ?? undefined,
    driveType: car.driveType ?? undefined,
    transmission: car.transmission ?? undefined,
    engineSize: car.engineSize ?? undefined,
    bodyType: car.bodyType ?? undefined,
    initialMileage: car.initialMileage ?? undefined,
    importYear: car.importYear ?? undefined,
    situation: car.situation ?? undefined,
  };
}

const WorkshopVehicles = () => {
  const { token } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editCar, setEditCar] = useState<MyCar | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MyCar | null>(null);
  const [form, setForm] = useState<ReturnType<typeof carToForm> | null>(null);

  const { data: cars = [], isLoading } = useQuery({
    queryKey: ["my-cars"],
    queryFn: () => getMyRegisteredCars(token!),
    enabled: !!token,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateCarPayload }) =>
      updateCar(id, payload, token!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-cars"] });
      toast.success("Viatura actualizada com sucesso");
      setEditCar(null);
    },
    onError: (e: any) => toast.error(e.message ?? "Erro ao actualizar"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCar(id, token!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-cars"] });
      toast.success("Viatura eliminada");
      setDeleteTarget(null);
    },
    onError: (e: any) => {
      toast.error(e.message ?? "Erro ao eliminar");
      setDeleteTarget(null);
    },
  });

  const filtered = cars.filter(c =>
    !search ||
    c.plateNumber.toLowerCase().includes(search.toLowerCase()) ||
    c.brand.toLowerCase().includes(search.toLowerCase()) ||
    c.model.toLowerCase().includes(search.toLowerCase()),
  );

  const openEdit = (car: MyCar) => {
    setEditCar(car);
    setForm(carToForm(car));
  };

  const handleFormChange = (key: keyof typeof form, value: string | number | undefined) => {
    setForm(prev => prev ? { ...prev, [key]: value } : prev);
  };

  const handleSave = () => {
    if (!editCar || !form) return;
    const payload: UpdateCarPayload = { ...form };
    updateMutation.mutate({ id: editCar.id, payload });
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">As Minhas Viaturas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {cars.length} viatura{cars.length !== 1 ? "s" : ""} registada{cars.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild>
          <Link to="/registar-viatura">
            <Plus className="mr-2 h-4 w-4" /> Registar Viatura
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar por matrícula, marca..."
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
          <Car className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p>{search ? "Nenhuma viatura encontrada." : "Ainda não registou nenhuma viatura."}</p>
          {!search && (
            <Button asChild className="mt-4" variant="outline">
              <Link to="/registar-viatura">Registar primeira viatura</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(car => (
            <div
              key={car.id}
              className="bg-card border border-border rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow"
            >
              {/* Photo */}
              <div className="aspect-video bg-muted relative overflow-hidden">
                {car.photos?.[0] ? (
                  <img src={car.photos[0]} alt={`${car.brand} ${car.model}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Car className="h-12 w-12 text-muted-foreground/20" />
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span className="bg-background/90 backdrop-blur-sm text-foreground px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-border">
                    {car.plateNumber}
                  </span>
                </div>
                <div className="absolute top-2 right-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLE[car.approvalStatus ?? "pendente"]}`}>
                    {STATUS_LABEL[car.approvalStatus ?? "pendente"]}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <p className="font-semibold text-sm text-foreground">
                  {car.brand} {car.model}{car.year ? ` (${car.year})` : ""}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {car.color && <Badge variant="outline" className="text-[10px]">{car.color}</Badge>}
                  {car.fuelType && <Badge variant="outline" className="text-[10px]">{car.fuelType}</Badge>}
                  {car.driveType && <Badge variant="outline" className="text-[10px]">{car.driveType}</Badge>}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {car._count.records} registo{car._count.records !== 1 ? "s" : ""} · Registada {format(new Date(car.createdAt!), "dd MMM yyyy", { locale: ptBR })}
                </p>

                {/* Actions */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                  <Button size="sm" variant="outline" className="flex-1 gap-1.5" onClick={() => openEdit(car)}>
                    <Pencil className="h-3.5 w-3.5" /> Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-destructive hover:text-destructive"
                    disabled={car._count.records > 0}
                    title={car._count.records > 0 ? "Não é possível eliminar uma viatura com registos" : "Eliminar viatura"}
                    onClick={() => setDeleteTarget(car)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Sheet */}
      <Sheet open={!!editCar} onOpenChange={open => { if (!open) setEditCar(null); }}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Editar Viatura — {editCar?.plateNumber}</SheetTitle>
          </SheetHeader>

          {form && (
            <div className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Marca *</Label>
                  <Input className="mt-1" value={form.brand ?? ""} onChange={e => handleFormChange("brand", e.target.value)} />
                </div>
                <div>
                  <Label>Modelo *</Label>
                  <Input className="mt-1" value={form.model ?? ""} onChange={e => handleFormChange("model", e.target.value)} />
                </div>
                <div>
                  <Label>Ano de Fabrico</Label>
                  <Input className="mt-1" type="number" min={1950} max={new Date().getFullYear() + 1}
                    value={form.year ?? ""} onChange={e => handleFormChange("year", e.target.value ? Number(e.target.value) : undefined)} />
                </div>
                <div>
                  <Label>Cor</Label>
                  <Input className="mt-1" placeholder="Branco, Prata..." value={form.color ?? ""} onChange={e => handleFormChange("color", e.target.value)} />
                </div>
                <div>
                  <Label>Combustível</Label>
                  <select className={SELECT_CLASS} value={form.fuelType ?? ""} onChange={e => handleFormChange("fuelType", e.target.value || undefined)}>
                    <option value="">-- Selecione --</option>
                    {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Tipo de Motor</Label>
                  <select className={SELECT_CLASS} value={form.engineType ?? ""} onChange={e => handleFormChange("engineType", e.target.value || undefined)}>
                    <option value="">-- Selecione --</option>
                    {ENGINE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Tracção</Label>
                  <select className={SELECT_CLASS} value={form.driveType ?? ""} onChange={e => handleFormChange("driveType", e.target.value || undefined)}>
                    <option value="">-- Selecione --</option>
                    {DRIVE_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Transmissão</Label>
                  <select className={SELECT_CLASS} value={form.transmission ?? ""} onChange={e => handleFormChange("transmission", e.target.value || undefined)}>
                    <option value="">-- Selecione --</option>
                    {TRANSMISSIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Cilindrada</Label>
                  <Input className="mt-1" placeholder="2.0L, 2500cc..." value={form.engineSize ?? ""} onChange={e => handleFormChange("engineSize", e.target.value)} />
                </div>
                <div>
                  <Label>Carroçaria</Label>
                  <select className={SELECT_CLASS} value={form.bodyType ?? ""} onChange={e => handleFormChange("bodyType", e.target.value || undefined)}>
                    <option value="">-- Selecione --</option>
                    {BODY_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Km Inicial</Label>
                  <Input className="mt-1" type="number" min={0} value={form.initialMileage ?? ""}
                    onChange={e => handleFormChange("initialMileage", e.target.value ? Number(e.target.value) : undefined)} />
                </div>
                <div>
                  <Label>Ano de Importação</Label>
                  <Input className="mt-1" type="number" min={1950} max={new Date().getFullYear() + 1}
                    value={form.importYear ?? ""} onChange={e => handleFormChange("importYear", e.target.value ? Number(e.target.value) : undefined)} />
                </div>
                <div className="col-span-2">
                  <Label>Situação</Label>
                  <select className={SELECT_CLASS} value={form.situation ?? ""} onChange={e => handleFormChange("situation", e.target.value || undefined)}>
                    <option value="">-- Selecione --</option>
                    {SITUATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          <SheetFooter className="mt-6 gap-2 flex-row">
            <Button variant="outline" className="flex-1" onClick={() => setEditCar(null)}>Cancelar</Button>
            <Button className="flex-1" disabled={updateMutation.isPending} onClick={handleSave}>
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
            <AlertDialogTitle>Eliminar viatura?</AlertDialogTitle>
            <AlertDialogDescription>
              A viatura <strong>{deleteTarget?.plateNumber}</strong> ({deleteTarget?.brand} {deleteTarget?.model}) será eliminada permanentemente.
              Esta acção não pode ser desfeita.
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

export default WorkshopVehicles;
