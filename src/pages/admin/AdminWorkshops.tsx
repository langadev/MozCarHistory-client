import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getAdminWorkshops, updateWorkshopVerify, updateWorkshopStatus } from "@/api/admin";
import AdminLayout from "@/components/layout/AdminLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search, ShieldCheck, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const AdminWorkshops = () => {
  const { token } = useAuth();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

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

  const filteredWorkshops = data?.workshops.filter((w) =>
    !search || w.name?.toLowerCase().includes(search.toLowerCase()),
  ) ?? [];

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 1;

  return (
    <AdminLayout>
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Oficinas</h1>

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
    </AdminLayout>
  );
};

export default AdminWorkshops;
