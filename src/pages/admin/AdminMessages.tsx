import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getConversations, type Conversation } from "@/api/messages";
import { getAdminWorkshops } from "@/api/admin";
import { ChatWindow } from "@/components/chat/ChatWindow";
import AdminLayout from "@/components/layout/AdminLayout";
import { Loader2, MessageSquare, PenSquare, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function relativeDate(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, "HH:mm");
  if (isYesterday(d)) return "Ontem";
  return format(d, "dd/MM/yy", { locale: ptBR });
}

interface Partner {
  id: number;
  name: string | null;
  email: string;
  role: string | null;
}

export default function AdminMessages() {
  const { token } = useAuth();
  const [selected, setSelected] = useState<Partner | null>(null);
  const [search, setSearch] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [newConvOpen, setNewConvOpen] = useState(false);
  const [workshopSearch, setWorkshopSearch] = useState("");

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => getConversations(token!),
    enabled: !!token,
    refetchInterval: 30_000,
  });

  const { data: workshopsRes } = useQuery({
    queryKey: ["admin-workshops-all"],
    queryFn: () => getAdminWorkshops(token!, 1),
    enabled: !!token && newConvOpen,
  });

  const workshops = workshopsRes?.workshops ?? [];

  const filtered = conversations.filter(c =>
    (c.partner.name ?? c.partner.email).toLowerCase().includes(search.toLowerCase()),
  );

  // Workshops not already in conversation list (or all, admin can re-open)
  const filteredWorkshops = workshops.filter(w =>
    (w.name ?? w.email).toLowerCase().includes(workshopSearch.toLowerCase()),
  );

  const handleSelect = (partner: Partner) => {
    setSelected(partner);
    setShowChat(true);
  };

  const handleSelectConv = (c: Conversation) => handleSelect(c.partner);

  const handleStartNew = (w: { id: number; name: string | null; email: string }) => {
    setSelected({ id: w.id, name: w.name, email: w.email, role: "oficina" });
    setShowChat(true);
    setNewConvOpen(false);
    setWorkshopSearch("");
  };

  return (
    <AdminLayout>
      <div className="flex h-full">
        {/* Sidebar */}
        <div className={cn(
          "flex flex-col border-r bg-card w-full lg:w-80 shrink-0",
          showChat && selected ? "hidden lg:flex" : "flex",
        )}>
          <div className="border-b px-4 py-4 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-base font-semibold">Mensagens</h1>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => setNewConvOpen(true)}
                title="Nova conversa"
              >
                <PenSquare className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar..."
                className="pl-9 h-9 text-sm"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-accent" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-2 text-center px-6">
                <MessageSquare className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  {search ? "Nenhuma conversa encontrada" : "Nenhuma mensagem ainda"}
                </p>
                {!search && (
                  <Button size="sm" variant="outline" onClick={() => setNewConvOpen(true)}>
                    Iniciar conversa
                  </Button>
                )}
              </div>
            ) : (
              filtered.map(c => (
                <button
                  key={c.partner.id}
                  onClick={() => handleSelectConv(c)}
                  className={cn(
                    "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors border-b border-border/50",
                    selected?.id === c.partner.id
                      ? "bg-accent/10"
                      : "hover:bg-muted",
                  )}
                >
                  <div className="h-9 w-9 rounded-full bg-accent/10 flex items-center justify-center text-sm font-bold text-accent shrink-0">
                    {(c.partner.name ?? c.partner.email).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium truncate">{c.partner.name ?? c.partner.email}</p>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {relativeDate(c.lastMessage.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {c.lastMessage.content}
                    </p>
                  </div>
                  {c.unreadCount > 0 && (
                    <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-bold text-accent-foreground shrink-0">
                      {c.unreadCount}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat panel */}
        <div className={cn(
          "flex-1 flex flex-col min-w-0",
          !showChat || !selected ? "hidden lg:flex" : "flex",
        )}>
          {selected ? (
            <ChatWindow
              partner={selected}
              onBack={() => setShowChat(false)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
              <MessageSquare className="h-12 w-12 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                Selecione uma conversa ou inicie uma nova
              </p>
              <Button variant="outline" size="sm" onClick={() => setNewConvOpen(true)}>
                <PenSquare className="h-4 w-4 mr-2" />
                Nova conversa
              </Button>
            </div>
          )}
        </div>

        {/* New conversation dialog */}
        <Dialog open={newConvOpen} onOpenChange={setNewConvOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Nova Conversa</DialogTitle>
            </DialogHeader>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                autoFocus
                placeholder="Pesquisar oficina..."
                className="pl-9"
                value={workshopSearch}
                onChange={e => setWorkshopSearch(e.target.value)}
              />
            </div>
            <div className="max-h-72 overflow-y-auto space-y-1">
              {filteredWorkshops.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  {workshopsRes ? "Nenhuma oficina encontrada" : <Loader2 className="h-5 w-5 animate-spin mx-auto text-accent" />}
                </p>
              ) : (
                filteredWorkshops.map(w => (
                  <button
                    key={w.id}
                    onClick={() => handleStartNew(w)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left hover:bg-muted transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-sm font-bold text-accent shrink-0">
                      {(w.name ?? w.email).charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{w.name ?? w.email}</p>
                      <p className="text-xs text-muted-foreground truncate">{w.email}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
