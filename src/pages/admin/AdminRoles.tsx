import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getRoles, createRole, updateRole, deleteRole, Role } from "@/api/admin";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, Plus, Pencil, Trash2, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";

const SYSTEM_ROLES = ["admin", "oficina", "comprador", "mecanico"];

const roleLabel: Record<string, string> = {
  admin: "Administrador",
  oficina: "Oficina",
  comprador: "Comprador",
  mecanico: "Mecânico",
};

const roleDescription: Record<string, string> = {
  admin: "Acesso total ao painel administrativo",
  oficina: "Regista viaturas e serviços de manutenção",
  comprador: "Consulta o histórico de viaturas",
  mecanico: "Executa serviços e regista manutenções",
};

const roleBadgeVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  admin: "default",
  oficina: "secondary",
  comprador: "outline",
  mecanico: "outline",
};

interface RoleFormState {
  name: string;
  description: string;
}

export default function AdminRoles() {
  const { token } = useAuth();
  const qc = useQueryClient();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Role | null>(null);
  const [form, setForm] = useState<RoleFormState>({ name: "", description: "" });

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: () => getRoles(token!),
    enabled: !!token,
  });

  const createMutation = useMutation({
    mutationFn: () => createRole(token!, form.name.trim(), form.description.trim() || undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Role criada com sucesso");
      setCreateOpen(false);
      setForm({ name: "", description: "" });
    },
    onError: (e: any) => toast.error(e.message ?? "Erro ao criar role"),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateRole(token!, editTarget!.id, {
        name: form.name.trim() || undefined,
        description: form.description.trim() || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Role actualizada");
      setEditTarget(null);
    },
    onError: (e: any) => toast.error(e.message ?? "Erro ao actualizar role"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteRole(token!, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Role eliminada");
    },
    onError: (e: any) => toast.error(e.message ?? "Erro ao eliminar role"),
  });

  const openCreate = () => {
    setForm({ name: "", description: "" });
    setCreateOpen(true);
  };

  const openEdit = (r: Role) => {
    setForm({ name: r.name, description: r.description ?? "" });
    setEditTarget(r);
  };

  const isSystem = (name: string) => SYSTEM_ROLES.includes(name);

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold">Gestão de Roles</h1>
            <p className="text-sm text-muted-foreground mt-1">Roles que definem as permissões dos utilizadores no sistema</p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Role
          </Button>
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => (
              <Card key={role.id} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <ShieldCheck className="h-4 w-4 text-accent shrink-0" />
                      <CardTitle className="text-base truncate">
                        {roleLabel[role.name] ?? role.name}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Badge variant={roleBadgeVariant[role.name] ?? "outline"} className="text-xs">
                        {role.name}
                      </Badge>
                      {isSystem(role.name) && (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground">
                          sistema
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {role.description ?? roleDescription[role.name] ?? "Sem descrição"}
                  </p>

                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    <span>{role._count?.users ?? 0} utilizador{(role._count?.users ?? 0) !== 1 ? "es" : ""}</span>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEdit(role)}
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1.5" />
                      Editar
                    </Button>
                    {!isSystem(role.name) && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Eliminar role "{role.name}"?</AlertDialogTitle>
                            <AlertDialogDescription>
                              {(role._count?.users ?? 0) > 0
                                ? `Existem ${role._count!.users} utilizador(es) com esta role. Eles ficarão sem role atribuída.`
                                : "Esta acção não pode ser desfeita."}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => deleteMutation.mutate(role.id)}
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Criar Role */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Nova Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Nome <span className="text-destructive">*</span></Label>
              <Input
                autoFocus
                className="mt-1"
                placeholder="ex: supervisor"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground mt-1">Apenas letras minúsculas e underscore</p>
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea
                className="mt-1 resize-none"
                rows={3}
                placeholder="Descreva as permissões desta role..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button
              disabled={!form.name.trim() || createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Editar Role */}
      <Dialog open={!!editTarget} onOpenChange={(open) => { if (!open) setEditTarget(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {editTarget && isSystem(editTarget.name) && (
              <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
                Role de sistema — pode editar a descrição mas não o nome.
              </div>
            )}
            <div>
              <Label>Nome</Label>
              <Input
                className="mt-1"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                disabled={editTarget ? isSystem(editTarget.name) : false}
              />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea
                className="mt-1 resize-none"
                rows={3}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>Cancelar</Button>
            <Button
              disabled={updateMutation.isPending}
              onClick={() => updateMutation.mutate()}
            >
              {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
