import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getConversations, type Conversation } from "@/api/messages";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { Loader2, MessageSquare, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";

function relativeDate(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, "HH:mm");
  if (isYesterday(d)) return "Ontem";
  return format(d, "dd/MM/yy", { locale: ptBR });
}

export default function Messages() {
  const { token } = useAuth();
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [search, setSearch] = useState("");
  const [showChat, setShowChat] = useState(false);

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => getConversations(token!),
    enabled: !!token,
    refetchInterval: 30_000,
  });

  const filtered = conversations.filter(c =>
    (c.partner.name ?? c.partner.email).toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelect = (c: Conversation) => {
    setSelected(c);
    setShowChat(true);
  };

  return (
    <div className="flex h-full">
      {/* Sidebar — conversation list */}
      <div className={cn(
        "flex flex-col border-r bg-card w-full lg:w-80 shrink-0",
        showChat && selected ? "hidden lg:flex" : "flex",
      )}>
        <div className="border-b px-4 py-4 shrink-0">
          <h1 className="text-base font-semibold mb-3">Mensagens</h1>
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
            </div>
          ) : (
            filtered.map(c => (
              <button
                key={c.partner.id}
                onClick={() => handleSelect(c)}
                className={cn(
                  "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors border-b border-border/50",
                  selected?.partner.id === c.partner.id
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
            partner={selected.partner}
            onBack={() => setShowChat(false)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
            <MessageSquare className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              Selecione uma conversa para começar
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
