import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserCog, Plus, Pencil, Phone, Loader2, Camera, X, Mail, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import {
  getMechanics,
  createMechanic,
  updateMechanic,
  updateMechanicStatus,
  type Mechanic,
} from "@/api/mechanics";

interface MechanicForm {
  name: string;
  email: string;
  password: string;
  specialty: string;
  phone: string;
  photo: File | null;
}

const emptyForm: MechanicForm = {
  name: "",
  email: "",
  password: "",
  specialty: "",
  phone: "",
  photo: null,
};

const MechanicAvatar = ({ mechanic, size = "lg" }: { mechanic: Mechanic; size?: "sm" | "lg" }) => {
  const dim = size === "lg" ? "h-16 w-16" : "h-10 w-10";
  const text = size === "lg" ? "text-xl" : "text-base";
  if (mechanic.photo) {
    return (
      <img
        src={mechanic.photo}
        alt={mechanic.name}
        className={`${dim} rounded-full object-cover border-2 border-border`}
      />
    );
  }
  return (
    <div
      className={`${dim} rounded-full bg-accent/10 border-2 border-accent/20 flex items-center justify-center shrink-0`}
    >
      <span className={`${text} font-bold text-accent`}>
        {mechanic.name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
};

const WorkshopMechanics = () => {
  const { token } = useAuth();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Mechanic | null>(null);
  const [form, setForm] = useState<MechanicForm>(emptyForm);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const { data: mechanics = [], isLoading } = useQuery({
    queryKey: ["mechanics"],
    queryFn: () => getMechanics(token!),
    enabled: !!token,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append("name", form.name);
      if (!editing) {
        fd.append("email", form.email);
        fd.append("password", form.password);
      }
      if (form.specialty) fd.append("specialty", form.specialty);
      if (form.phone) fd.append("phone", form.phone);
      if (form.photo) fd.append("photo", form.photo);
      if (editing) return updateMechanic(token!, editing.id, fd);
      return createMechanic(token!, fd);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mechanics"] });
      toast.success(editing ? "Mecânico atualizado." : "Mecânico adicionado com conta de acesso.");
      closeDialog();
    },
    onError: (e: any) => toast.error(e?.message || "Erro ao guardar mecânico."),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      updateMechanicStatus(token!, id, active),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mechanics"] }),
    onError: (e: any) => toast.error(e?.message || "Erro ao alterar estado."),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setPhotoPreview(null);
    setDialogOpen(true);
  };

  const openEdit = (m: Mechanic) => {
    setEditing(m);
    setForm({ ...emptyForm, name: m.name, specialty: m.specialty ?? "", phone: m.phone ?? "" });
    setPhotoPreview(m.photo ?? null);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
    setForm(emptyForm);
    setPhotoPreview(null);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((f) => ({ ...f, photo: file }));
    setPhotoPreview(URL.createObjectURL(file));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <UserCog className="h-6 w-6 text-accent" />
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">Mecânicos</h1>
                <p className="text-sm text-muted-foreground">Gerir a equipa da oficina</p>
              </div>
            </div>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Mecânico
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : mechanics.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <UserCog className="h-16 w-16 text-muted-foreground/20 mb-4" />
              <p className="text-muted-foreground">Nenhum mecânico registado ainda.</p>
              <Button variant="outline" className="mt-4" onClick={openCreate}>
                Adicionar o primeiro mecânico
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mechanics.map((m) => (
                <div
                  key={m.id}
                  className="bg-card border border-border rounded-lg p-5 shadow-card flex flex-col gap-4"
                >
                  <div className="flex items-start gap-4">
                    <MechanicAvatar mechanic={m} />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <p className="font-semibold text-foreground truncate">{m.name}</p>
                        <Badge
                          variant={m.active ? "default" : "secondary"}
                          className={m.active ? "bg-accent/10 text-accent border-accent/20" : ""}
                        >
                          {m.active ? "Ativo" : "Inativo"}
                        </Badge>
                        <Badge
                          variant={m.userId ? "default" : "outline"}
                          className={m.userId ? "bg-green-500/10 text-green-600 border-green-500/20" : "text-muted-foreground"}
                        >
                          {m.userId ? "Com conta" : "Sem conta"}
                        </Badge>
                      </div>
                      {m.specialty && (
                        <p className="text-sm text-muted-foreground truncate">{m.specialty}</p>
                      )}
                      {m.phone && (
                        <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          {m.phone}
                        </div>
                      )}
                      {m.user?.email && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {m.user.email}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEdit(m)}
                    >
                      <Pencil className="mr-1.5 h-3.5 w-3.5" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      disabled={toggleMutation.isPending}
                      onClick={() => toggleMutation.mutate({ id: m.id, active: !m.active })}
                    >
                      {m.active ? "Desativar" : "Ativar"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Mecânico" : "Novo Mecânico"}</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveMutation.mutate();
            }}
            className="space-y-4"
          >
            {/* Photo */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                {photoPreview ? (
                  <div className="relative h-20 w-20">
                    <img
                      src={photoPreview}
                      alt="Foto"
                      className="h-20 w-20 rounded-full object-cover border-2 border-border"
                    />
                    <button
                      type="button"
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                      onClick={() => {
                        setPhotoPreview(null);
                        setForm((f) => ({ ...f, photo: null }));
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <label className="h-20 w-20 rounded-full bg-muted border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-accent/50 transition-colors">
                    <Camera className="h-6 w-6 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground mt-1">Foto</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  </label>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="m-name">Nome *</Label>
              <Input
                id="m-name"
                className="mt-1"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>

            {/* Email and password — only on creation */}
            {!editing && (
              <>
                <div>
                  <Label htmlFor="m-email">Email de acesso *</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="m-email"
                      type="email"
                      className="pl-10"
                      placeholder="mecanico@email.com"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="m-password">Senha temporária *</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="m-password"
                      type="text"
                      className="pl-10 font-mono"
                      placeholder="Mínimo 6 caracteres"
                      value={form.password}
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                      required
                      minLength={6}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    O mecânico será obrigado a mudar esta senha no primeiro login.
                  </p>
                </div>
              </>
            )}

            <div>
              <Label htmlFor="m-specialty">Especialidade</Label>
              <Input
                id="m-specialty"
                className="mt-1"
                placeholder="Ex: Motor, Elétrica, Pintura…"
                value={form.specialty}
                onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="m-phone">Telefone</Label>
              <Input
                id="m-phone"
                className="mt-1"
                placeholder="+258 8X XXX XXXX"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editing ? "Guardar Alterações" : "Criar Conta e Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkshopMechanics;
