import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import {
  getMyProfile, updateMyProfile,
  getMyFavorites, removeFromFavorites,
  getSearchHistory, clearSearchHistory, deleteSearchHistoryItem,
} from "@/api/buyer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  User, Heart, Clock, Mail, Phone, MapPin, Calendar,
  Loader2, Car, ShieldCheck, Gauge, FileText, Search,
  Trash2, X, KeyRound, Fuel, Settings,
} from "lucide-react";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const SERVICE_TYPE_COLORS: Record<string, string> = {
  "Troca de Óleo": "bg-amber-500/10 text-amber-600 border-amber-200",
  "Revisão Geral": "bg-blue-500/10 text-blue-600 border-blue-200",
  "Travões / Freios": "bg-red-500/10 text-red-600 border-red-200",
  "Pneus": "bg-slate-500/10 text-slate-600 border-slate-200",
  "Motor": "bg-orange-500/10 text-orange-600 border-orange-200",
};

function serviceTypeBadge(type: string | null | undefined) {
  if (!type) return null;
  const cls = SERVICE_TYPE_COLORS[type] ?? "bg-accent/10 text-accent border-accent/20";
  return (
    <span className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full border ${cls}`}>
      {type}
    </span>
  );
}

export default function BuyerProfile() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editing, setEditing] = useState(false);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => getMyProfile(token!),
    enabled: !!token,
    onSuccess: (data: any) => {
      setEditName(data.name ?? "");
      setEditPhone(data.phone ?? "");
      setEditAddress(data.address ?? "");
    },
  } as any);

  const { data: favorites = [], isLoading: favsLoading } = useQuery({
    queryKey: ["my-favorites"],
    queryFn: () => getMyFavorites(token!),
    enabled: !!token,
  });

  const { data: history = [], isLoading: historyLoading } = useQuery({
    queryKey: ["search-history"],
    queryFn: () => getSearchHistory(token!),
    enabled: !!token,
  });

  const updateMutation = useMutation({
    mutationFn: () => updateMyProfile(token!, { name: editName.trim(), phone: editPhone.trim(), address: editAddress.trim() }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-profile"] });
      toast.success("Perfil actualizado");
      setEditing(false);
    },
    onError: (e: any) => toast.error(e.message ?? "Erro ao actualizar"),
  });

  const unfavoriteMutation = useMutation({
    mutationFn: (carId: number) => removeFromFavorites(token!, carId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-favorites"] }),
    onError: () => toast.error("Erro ao remover dos favoritos"),
  });

  const deleteHistoryMutation = useMutation({
    mutationFn: (id: number) => deleteSearchHistoryItem(token!, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["search-history"] }),
  });

  const clearHistoryMutation = useMutation({
    mutationFn: () => clearSearchHistory(token!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["search-history"] });
      toast.success("Histórico apagado");
    },
  });

  const startEditing = () => {
    setEditName(profile?.name ?? "");
    setEditPhone(profile?.phone ?? "");
    setEditAddress(profile?.address ?? "");
    setEditing(true);
  };

  const initial = (profile?.name ?? profile?.email ?? "C")[0].toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero header */}
      <div className="gradient-hero py-10 md:py-14">
        <div className="container mx-auto px-4 max-w-4xl">
          {profileLoading ? (
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-white/10 animate-pulse" />
              <div className="space-y-2">
                <div className="h-5 w-40 bg-white/10 rounded animate-pulse" />
                <div className="h-3 w-28 bg-white/10 rounded animate-pulse" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center text-2xl font-bold text-accent shrink-0">
                {initial}
              </div>
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-navy-foreground">
                  {profile?.name ?? "Sem nome"}
                </h1>
                <p className="text-navy-foreground/60 text-sm mt-0.5">{profile?.email}</p>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant="secondary" className="text-xs">{profile?.role?.name ?? "comprador"}</Badge>
                  <span className="text-[11px] text-navy-foreground/50">
                    Membro desde {profile?.createdAt ? format(new Date(profile.createdAt), "MMMM yyyy", { locale: ptBR }) : "—"}
                  </span>
                </div>
              </div>
              <div className="ml-auto hidden sm:flex items-center gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-navy-foreground">{profile?._count?.favorites ?? 0}</p>
                  <p className="text-[11px] text-navy-foreground/50">Favoritos</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div>
                  <p className="text-2xl font-bold text-navy-foreground">{history.length}</p>
                  <p className="text-[11px] text-navy-foreground/50">Pesquisas</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4 max-w-4xl py-6">
        <Tabs defaultValue="perfil">
          <TabsList className="mb-6">
            <TabsTrigger value="perfil" className="gap-2">
              <User className="h-4 w-4" /> Perfil
            </TabsTrigger>
            <TabsTrigger value="favoritos" className="gap-2">
              <Heart className="h-4 w-4" /> Favoritos
              {favorites.length > 0 && (
                <span className="ml-1 text-[10px] bg-accent text-accent-foreground rounded-full px-1.5 py-0.5 font-bold">
                  {favorites.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="historico" className="gap-2">
              <Clock className="h-4 w-4" /> Pesquisas
              {history.length > 0 && (
                <span className="ml-1 text-[10px] bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 font-bold">
                  {history.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── TAB: Perfil ─────────────────────────────────────────── */}
          <TabsContent value="perfil">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Edit form */}
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="font-semibold">Dados Pessoais</h2>
                    {!editing && (
                      <Button variant="outline" size="sm" onClick={startEditing}>Editar</Button>
                    )}
                  </div>

                  {editing ? (
                    <div className="space-y-3">
                      <div>
                        <Label>Nome</Label>
                        <Input className="mt-1" value={editName} onChange={e => setEditName(e.target.value)} placeholder="O seu nome" />
                      </div>
                      <div>
                        <Label>Telefone</Label>
                        <Input className="mt-1" value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="+258 8X XXX XXXX" />
                      </div>
                      <div>
                        <Label>Morada</Label>
                        <Input className="mt-1" value={editAddress} onChange={e => setEditAddress(e.target.value)} placeholder="Cidade, Bairro..." />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <Button className="flex-1" disabled={updateMutation.isPending} onClick={() => updateMutation.mutate()}>
                          {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Guardar
                        </Button>
                        <Button variant="outline" onClick={() => setEditing(false)}>Cancelar</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2.5 text-muted-foreground">
                        <Mail className="h-4 w-4 shrink-0" />
                        <span className="truncate">{profile?.email}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-muted-foreground">
                        <Phone className="h-4 w-4 shrink-0" />
                        <span>{profile?.phone ?? <span className="italic text-muted-foreground/50">Não definido</span>}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-muted-foreground">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span>{profile?.address ?? <span className="italic text-muted-foreground/50">Não definido</span>}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-muted-foreground">
                        <Calendar className="h-4 w-4 shrink-0" />
                        <span>
                          Membro desde {profile?.createdAt ? format(new Date(profile.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "—"}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick links */}
              <div className="space-y-3">
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="font-semibold mb-4">Acções</h2>
                    <div className="space-y-2">
                      <Link to="/alterar-senha">
                        <Button variant="outline" className="w-full justify-start gap-2">
                          <KeyRound className="h-4 w-4" /> Alterar Senha
                        </Button>
                      </Link>
                      <Link to="/consulta">
                        <Button variant="outline" className="w-full justify-start gap-2">
                          <Search className="h-4 w-4" /> Consultar Viatura
                        </Button>
                      </Link>
                      <Link to="/veiculos">
                        <Button variant="outline" className="w-full justify-start gap-2">
                          <Car className="h-4 w-4" /> Explorar Catálogo
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ── TAB: Favoritos ──────────────────────────────────────── */}
          <TabsContent value="favoritos">
            {favsLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
              </div>
            ) : favorites.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                <Heart className="h-12 w-12 opacity-20" />
                <p className="text-sm">Ainda não tem viaturas favoritas.</p>
                <Link to="/consulta">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Search className="h-4 w-4" /> Consultar viaturas
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {favorites.map(car => {
                  const lastRecord = car.records?.[0];
                  const recordCount = car._count?.records ?? 0;
                  return (
                    <div key={car.id} className="relative group">
                      <Link
                        to={`/historico?plate=${encodeURIComponent(car.plateNumber)}`}
                        className="block bg-card border border-border rounded-xl overflow-hidden shadow-card hover:shadow-card-hover hover:border-accent/40 transition-all"
                      >
                        <div className="aspect-video bg-muted relative overflow-hidden">
                          {car.photos?.[0] ? (
                            <img src={car.photos[0]} alt={`${car.brand} ${car.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                              <Car className="h-14 w-14" />
                            </div>
                          )}
                          <div className="absolute top-3 left-3">
                            <span className="bg-background/90 backdrop-blur-sm text-foreground px-2.5 py-1 rounded-md border border-border text-[10px] font-mono font-bold">
                              {car.plateNumber}
                            </span>
                          </div>
                          <div className="absolute top-3 right-3">
                            {recordCount > 0 ? (
                              <span className="bg-accent/90 text-accent-foreground px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1">
                                <ShieldCheck className="h-3 w-3" /> {recordCount} registo{recordCount !== 1 ? "s" : ""}
                              </span>
                            ) : (
                              <span className="bg-muted/90 text-muted-foreground px-2 py-1 rounded-md text-[10px] font-medium">Sem registos</span>
                            )}
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-display font-bold text-foreground leading-tight group-hover:text-accent transition-colors">
                            {car.brand} {car.model}
                          </h3>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                            {car.year && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{car.year}</span>}
                            {car.fuelType && <span className="flex items-center gap-1"><Fuel className="h-3 w-3" />{car.fuelType}</span>}
                            {car.transmission && <span className="flex items-center gap-1"><Settings className="h-3 w-3" />{car.transmission}</span>}
                          </div>
                          {lastRecord && (
                            <div className="mt-3 pt-3 border-t border-border space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-muted-foreground">Último serviço</span>
                                <span className="text-[10px] text-muted-foreground">{new Date(lastRecord.date).toLocaleDateString("pt-PT")}</span>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                {serviceTypeBadge(lastRecord.serviceType)}
                                <span className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                                  <Gauge className="h-3 w-3" />{lastRecord.mileage.toLocaleString("pt-PT")} km
                                </span>
                              </div>
                            </div>
                          )}
                          <div className="mt-3 flex items-center gap-1.5 text-accent text-xs font-medium">
                            <FileText className="h-3.5 w-3.5" /> Ver histórico completo →
                          </div>
                        </div>
                      </Link>

                      {/* Remove from favorites */}
                      <button
                        className="absolute top-2.5 right-14 z-10 bg-background/90 backdrop-blur-sm rounded-full p-1.5 shadow border border-border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10"
                        title="Remover dos favoritos"
                        onClick={e => { e.preventDefault(); unfavoriteMutation.mutate(car.id); }}
                      >
                        <X className="h-3.5 w-3.5 text-destructive" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ── TAB: Histórico de pesquisas ─────────────────────────── */}
          <TabsContent value="historico">
            {historyLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
              </div>
            ) : history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                <Clock className="h-12 w-12 opacity-20" />
                <p className="text-sm">Nenhuma pesquisa recente.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{history.length} pesquisa{history.length !== 1 ? "s" : ""} recente{history.length !== 1 ? "s" : ""}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive gap-1.5"
                    disabled={clearHistoryMutation.isPending}
                    onClick={() => clearHistoryMutation.mutate()}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Apagar tudo
                  </Button>
                </div>
                <div className="space-y-2">
                  {history.map(entry => (
                    <div key={entry.id} className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-3 group">
                      <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                      <button
                        className="flex-1 text-left text-sm font-mono font-medium hover:text-accent transition-colors"
                        onClick={() => navigate(`/consulta?q=${encodeURIComponent(entry.query)}`)}
                      >
                        {entry.query}
                      </button>
                      <span className="text-[10px] text-muted-foreground/60 hidden sm:block shrink-0">
                        {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true, locale: ptBR })}
                      </span>
                      <button
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/50 hover:text-destructive"
                        onClick={() => deleteHistoryMutation.mutate(entry.id)}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
