import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getAdminUsers, updateUserRole, updateUserStatus, resetUserPassword, AdminUser } from "@/api/admin";
import AdminLayout from "@/components/layout/AdminLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search, KeyRound, RefreshCw, Copy } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useDebounce } from "@/hooks/use-debounce";

function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

const roleBadgeVariant: Record<string, "default" | "secondary" | "outline"> = {
  admin: "default",
  oficina: "secondary",
  comprador: "outline",
};

const roleLabel: Record<string, string> = {
  admin: "Admin",
  oficina: "Oficina",
  comprador: "Comprador",
  mecanico: "Mecânico",
};

const AdminUsers = () => {
  const { token, user: authUser } = useAuth();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const [resetTarget, setResetTarget] = useState<AdminUser | null>(null);
  const [resetPassword, setResetPassword] = useState(generatePassword());
  const [resetDone, setResetDone] = useState(false);

  const role = roleFilter === "all" ? undefined : roleFilter;
  const debouncedSearch = useDebounce(search, 350);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page, role, debouncedSearch],
    queryFn: () => getAdminUsers(token!, page, role, debouncedSearch || undefined),
    enabled: !!token,
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, newRole }: { id: number; newRole: string }) =>
      updateUserRole(token!, id, newRole),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Role actualizado com sucesso");
    },
    onError: (e: any) => toast.error(e.message ?? "Erro ao actualizar role"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, suspended }: { id: number; suspended: boolean }) =>
      updateUserStatus(token!, id, suspended),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Estado actualizado com sucesso");
    },
    onError: (e: any) => toast.error(e.message ?? "Erro ao actualizar estado"),
  });

  const resetMutation = useMutation({
    mutationFn: ({ id, password }: { id: number; password: string }) =>
      resetUserPassword(token!, id, password),
    onSuccess: () => setResetDone(true),
    onError: (e: any) => toast.error(e.message ?? "Erro ao resetar senha"),
  });

  const users = data?.users ?? [];
  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 1;

  const openResetDialog = (u: AdminUser) => {
    setResetTarget(u);
    setResetPassword(generatePassword());
    setResetDone(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-4">
        <h1 className="text-xl md:text-2xl font-semibold">Utilizadores</h1>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por nome ou email..."
              className="pl-9"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1); }}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="comprador">Comprador</SelectItem>
              <SelectItem value="oficina">Oficina</SelectItem>
              <SelectItem value="mecanico">Mecânico</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden md:table-cell">Registado em</TableHead>
                  <TableHead className="hidden sm:table-cell">Estado</TableHead>
                  <TableHead className="text-right">Acções</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">
                      <div>{u.name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground sm:hidden">{u.email}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant={roleBadgeVariant[u.role?.name ?? "comprador"]}>
                        {roleLabel[u.role?.name ?? "comprador"] ?? u.role?.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                      {format(new Date(u.createdAt), "dd MMM yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={u.suspended ? "destructive" : "outline"}>
                        {u.suspended ? "Suspenso" : "Activo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {u.id !== authUser?.id && (
                        <>
                          {u.role?.name !== "admin" && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">Promover a Admin</Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Promover a Admin?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {u.name ?? u.email} terá acesso total ao painel administrativo.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => roleMutation.mutate({ id: u.id, newRole: "admin" })}>
                                    Confirmar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                          {u.role?.name === "admin" && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">Despromover</Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Despromover Admin?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {u.name ?? u.email} perderá acesso ao painel administrativo.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => roleMutation.mutate({ id: u.id, newRole: "comprador" })}>
                                    Confirmar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            title="Resetar senha"
                            onClick={() => openResetDialog(u)}
                          >
                            <KeyRound className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className={u.suspended ? "text-green-600" : "text-destructive"}
                            onClick={() => statusMutation.mutate({ id: u.id, suspended: !u.suspended })}
                          >
                            {u.suspended ? "Activar" : "Suspender"}
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Nenhum utilizador encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Total: {data?.total ?? 0} utilizadores</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  Anterior
                </Button>
                <span className="px-2 py-1">{page} / {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                  Próximo
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Reset Senha Dialog */}
      <Dialog open={!!resetTarget} onOpenChange={(open) => { if (!open) { setResetTarget(null); setResetDone(false); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Resetar Senha</DialogTitle>
          </DialogHeader>

          {resetDone ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-green-800">
                <p className="font-semibold text-sm mb-3">
                  Senha de <span className="font-mono">{resetTarget?.email}</span> foi redefinida.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-white rounded border px-3 py-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Nova senha temporária</p>
                      <p className="text-sm font-mono font-medium">{resetPassword}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(resetPassword)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs mt-3 text-green-700">O utilizador será obrigado a alterar a senha no próximo login.</p>
              </div>
              <DialogFooter>
                <Button onClick={() => { setResetTarget(null); setResetDone(false); }}>Fechar</Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                A definir nova senha temporária para <span className="font-medium text-foreground">{resetTarget?.name ?? resetTarget?.email}</span>.
              </p>
              <div>
                <Label>Nova Senha Temporária</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    className="font-mono"
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    title="Gerar nova senha"
                    onClick={() => setResetPassword(generatePassword())}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  O utilizador terá de alterar esta senha no próximo login.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setResetTarget(null)}>Cancelar</Button>
                <Button
                  disabled={!resetPassword.trim() || resetMutation.isPending}
                  onClick={() => resetTarget && resetMutation.mutate({ id: resetTarget.id, password: resetPassword })}
                >
                  {resetMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Resetar Senha
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminUsers;
