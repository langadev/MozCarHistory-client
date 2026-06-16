import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import {
  getAdminWorkshops, updateWorkshopVerify, updateWorkshopStatus,
  createWorkshop, type CreateWorkshopPayload,
} from "@/api/admin";
import AdminLayout from "@/components/layout/AdminLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search, ShieldCheck, ExternalLink, Plus, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";

function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

const EMPTY_FORM: CreateWorkshopPayload = {
  name: "", email: "", phone: "", nuit: "", address: "", password: "",
};

const AdminWorkshops = () => {
  const { token } = useAuth();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<CreateWorkshopPayload>({ ...EMPTY_FORM, password: generatePassword() });
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null);

  const verified = filter === "all" ? undefined : filter === "verified";

  const { data, isLoading } = useQuery({
    queryKey: ["admin-workshops", page, verified],
    queryFn: () => getAdminWorkshops(token!, page, verified),
    enabled: !!token,
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id, verified }: { id: number; verified: boolean }) =>
      updateWorkshopVerify(token!, id, verified),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-workshops"] });
      toast.success("Verificação actualizada");
    },
    onError: (e: any) => toast.error(e.message ?? "Erro"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, suspended }: { id: number; suspended: boolean }) =>
      updateWorkshopStatus(token!, id, suspended),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-workshops"] });
      toast.success("Estado actualizado");
    },
    onError: (e: any) => toast.error(e.message ?? "Erro"),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateWorkshopPayload) => createWorkshop(token!, payload),
    onSuccess: (_, payload) => {
      qc.invalidateQueries({ queryKey: ["admin-workshops"] });
      setCreatedCredentials({ email: payload.email, password: payload.password });
      setForm({ ...EMPTY_FORM, password: generatePassword() });
    },
    onError: (e: any) => toast.error(e.message ?? "Erro ao criar oficina"),
  });

  const filteredWorkshops = data?.workshops.filter((w) =>
    !search || w.name?.toLowerCase().includes(search.toLowerCase()),
  ) ?? [];

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 1;

  const handleOpenDialog = () => {
    setCreatedCredentials(null);
    setForm({ ...EMPTY_FORM, password: generatePassword() });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      toast.error("Nome, email e senha são obrigatórios");
      return;
    }
    createMutation.mutate(form);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Oficinas</h1>
          <Button onClick={handleOpenDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Oficina
          </Button>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por nome..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={filter} onValueChange={(v) => { setFilter(v); setPage(1); }}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="verified">Verificadas</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Verificada</TableHead>
                  <TableHead>Viaturas</TableHead>
                  <TableHead>Serviços</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acções</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkshops.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell className="font-medium">{w.name ?? "—"}</TableCell>
                    <TableCell>{w.email}</TableCell>
                    <TableCell>
                      {w.verified ? (
                        <Badge className="gap-1 bg-green-100 text-green-700 border-green-200">
                          <ShieldCheck className="h-3 w-3" /> Verificada
                        </Badge>
                      ) : (
                        <Badge variant="outline">Pendente</Badge>
                      )}
                    </TableCell>
                    <TableCell>{w._count.cars}</TableCell>
                    <TableCell>{w._count.records}</TableCell>
                    <TableCell>
                      <Badge variant={w.suspended ? "destructive" : "outline"}>
                        {w.suspended ? "Suspensa" : "Activa"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            {w.verified ? "Remover verificação" : "Verificar"}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {w.verified ? "Remover verificação?" : "Verificar oficina?"}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {w.verified
                                ? `${w.name ?? w.email} perderá o badge de oficina verificada.`
                                : `${w.name ?? w.email} receberá o badge de oficina verificada.`}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => verifyMutation.mutate({ id: w.id, verified: !w.verified })}>
                              Confirmar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <Button
                        variant="ghost"
                        size="sm"
                        className={w.suspended ? "text-green-600" : "text-destructive"}
                        onClick={() => statusMutation.mutate({ id: w.id, suspended: !w.suspended })}
                      >
                        {w.suspended ? "Activar" : "Suspender"}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/perfil-oficina?id=${w.id}`, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredWorkshops.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Nenhuma oficina encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Total: {data?.total ?? 0} oficinas</span>
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

      {/* Nova Oficina Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setCreatedCredentials(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova Oficina</DialogTitle>
          </DialogHeader>

          {createdCredentials ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-green-800">
                <p className="font-semibold text-sm mb-3">Oficina criada com sucesso! Partilhe estas credenciais:</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-white rounded border px-3 py-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-mono font-medium">{createdCredentials.email}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(createdCredentials.email)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded border px-3 py-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Senha temporária</p>
                      <p className="text-sm font-mono font-medium">{createdCredentials.password}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(createdCredentials.password)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs mt-3 text-green-700">A oficina será obrigada a alterar a senha no primeiro login.</p>
              </div>
              <DialogFooter>
                <Button onClick={() => setDialogOpen(false)}>Fechar</Button>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="w-name">Nome da Oficina *</Label>
                  <Input
                    id="w-name"
                    className="mt-1"
                    placeholder="Auto Serviço Central"
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="w-email">Email *</Label>
                  <Input
                    id="w-email"
                    type="email"
                    className="mt-1"
                    placeholder="oficina@exemplo.com"
                    value={form.email}
                    onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="w-phone">Telefone</Label>
                  <Input
                    id="w-phone"
                    className="mt-1"
                    placeholder="84 000 0000"
                    value={form.phone}
                    onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="w-nuit">NUIT</Label>
                  <Input
                    id="w-nuit"
                    className="mt-1"
                    placeholder="400000000"
                    value={form.nuit}
                    onChange={(e) => setForm(f => ({ ...f, nuit: e.target.value }))}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="w-address">Endereço</Label>
                  <Input
                    id="w-address"
                    className="mt-1"
                    placeholder="Av. Eduardo Mondlane, Maputo"
                    value={form.address}
                    onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="w-password">Senha Temporária *</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="w-password"
                      className="font-mono"
                      value={form.password}
                      onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      title="Gerar nova senha"
                      onClick={() => setForm(f => ({ ...f, password: generatePassword() }))}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    A oficina será obrigada a alterar esta senha no primeiro login.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar Oficina
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminWorkshops;
