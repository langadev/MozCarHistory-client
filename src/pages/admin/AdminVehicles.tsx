import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getAdminVehicles, deleteVehicle, approveVehicle } from "@/api/admin";
import AdminLayout from "@/components/layout/AdminLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search, Trash2, ExternalLink, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";

const STATUS_LABELS: Record<string, string> = {
  pendente: "Pendente",
  aprovada: "Aprovada",
  rejeitada: "Rejeitada",
};

const STATUS_BADGE: Record<string, string> = {
  pendente: "bg-amber-100 text-amber-700 border-amber-200",
  aprovada: "bg-green-100 text-green-700 border-green-200",
  rejeitada: "bg-red-100 text-red-700 border-red-200",
};

type RejectTarget = { id: number; plateNumber: string } | null;

const AdminVehicles = () => {
  const { token } = useAuth();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const debouncedSearch = useDebounce(search, 300);

  const [rejectTarget, setRejectTarget] = useState<RejectTarget>(null);
  const [rejectNote, setRejectNote] = useState("");

  const approvalStatusParam = statusFilter === "all" ? undefined : statusFilter;

  const { data, isLoading } = useQuery({
    queryKey: ["admin-vehicles", page, debouncedSearch, statusFilter],
    queryFn: () => getAdminVehicles(token!, page, debouncedSearch || undefined, approvalStatusParam),
    enabled: !!token,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteVehicle(token!, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-vehicles"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Viatura eliminada com sucesso");
    },
    onError: (e: any) => toast.error(e.message ?? "Erro ao eliminar viatura"),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, status, note }: { id: number; status: "aprovada" | "rejeitada"; note?: string }) =>
      approveVehicle(token!, id, status, note),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["admin-vehicles"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success(vars.status === "aprovada" ? "Viatura aprovada" : "Viatura rejeitada");
      setRejectTarget(null);
      setRejectNote("");
    },
    onError: (e: any) => toast.error(e.message ?? "Erro"),
  });

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 1;

  return (
    <AdminLayout>
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Viaturas</h1>

        <Tabs value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <TabsList>
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="pendente">Pendentes</TabsTrigger>
            <TabsTrigger value="aprovada">Aprovadas</TabsTrigger>
            <TabsTrigger value="rejeitada">Rejeitadas</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Pesquisar matrícula, marca ou modelo..."
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
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
                  <TableHead>Matrícula</TableHead>
                  <TableHead>VIN</TableHead>
                  <TableHead>Marca / Modelo</TableHead>
                  <TableHead>Oficina</TableHead>
                  <TableHead>Registos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acções</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.vehicles.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium font-mono">{v.plateNumber}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">{v.vin ?? "—"}</TableCell>
                    <TableCell>{v.brand} {v.model}{v.year ? ` (${v.year})` : ""}</TableCell>
                    <TableCell>{v.owner?.name ?? "—"}</TableCell>
                    <TableCell>{v._count.records}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge className={`text-xs border ${STATUS_BADGE[v.approvalStatus] ?? ""}`}>
                          {STATUS_LABELS[v.approvalStatus] ?? v.approvalStatus}
                        </Badge>
                        {v.approvalNote && (
                          <span className="text-xs text-muted-foreground italic max-w-[160px] truncate" title={v.approvalNote}>
                            {v.approvalNote}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {v.approvalStatus === "pendente" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              title="Aprovar viatura"
                              disabled={approveMutation.isPending}
                              onClick={() => approveMutation.mutate({ id: v.id, status: "aprovada" })}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-red-50"
                              title="Rejeitar viatura"
                              onClick={() => { setRejectTarget({ id: v.id, plateNumber: v.plateNumber }); setRejectNote(""); }}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {v.approvalStatus === "rejeitada" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700 text-xs"
                            disabled={approveMutation.isPending}
                            onClick={() => approveMutation.mutate({ id: v.id, status: "aprovada" })}
                          >
                            Aprovar
                          </Button>
                        )}
                        {v.approvalStatus === "aprovada" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-amber-600 hover:text-amber-700 text-xs"
                            onClick={() => { setRejectTarget({ id: v.id, plateNumber: v.plateNumber }); setRejectNote(""); }}
                          >
                            Revogar
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`/historico?plate=${v.plateNumber}`, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Eliminar viatura?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acção elimina a viatura <strong>{v.plateNumber}</strong> e todos os seus{" "}
                                <strong>{v._count.records} registos</strong> de manutenção. Não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => deleteMutation.mutate(v.id)}
                              >
                                Eliminar definitivamente
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(data?.vehicles.length ?? 0) === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Nenhuma viatura encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Total: {data?.total ?? 0} viaturas</span>
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

      {/* Reject / Revoke Dialog */}
      <Dialog open={!!rejectTarget} onOpenChange={(open) => { if (!open) setRejectTarget(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Rejeitar viatura</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Viatura <span className="font-mono font-medium text-foreground">{rejectTarget?.plateNumber}</span> será marcada como rejeitada.
            </p>
            <div>
              <Label>Motivo (opcional)</Label>
              <Textarea
                className="mt-1 resize-none"
                rows={3}
                placeholder="Ex: Dados da matrícula não coincidem com os documentos..."
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              disabled={approveMutation.isPending}
              onClick={() => rejectTarget && approveMutation.mutate({
                id: rejectTarget.id,
                status: "rejeitada",
                note: rejectNote || undefined,
              })}
            >
              {approveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Rejeitar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminVehicles;
