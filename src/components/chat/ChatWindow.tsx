import { useEffect, useRef, useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/context/SocketContext";
import { getConversation, markRead, type Message, type Conversation } from "@/api/messages";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, WifiOff } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

function dayLabel(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return "Hoje";
  if (isYesterday(d)) return "Ontem";
  return format(d, "dd 'de' MMMM", { locale: ptBR });
}

function timeStr(dateStr: string) {
  return format(new Date(dateStr), "HH:mm");
}

interface ChatWindowProps {
  partner: Conversation["partner"];
  onBack?: () => void;
}

export function ChatWindow({ partner, onBack }: ChatWindowProps) {
  const { token, user } = useAuth();
  const { connected, connectError, sendMessage, onNewMessage, onMessagesRead, markRead: socketMarkRead } = useSocket();
  const qc = useQueryClient();
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: initial = [], isLoading } = useQuery({
    queryKey: ["conversation", partner.id],
    queryFn: () => getConversation(token!, partner.id),
    enabled: !!token,
  });

  // Merge REST messages with local (socket) additions
  const messages = useCallback(() => {
    const ids = new Set(localMessages.map(m => m.id));
    const merged = [...initial.filter(m => !ids.has(m.id)), ...localMessages];
    merged.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return merged;
  }, [initial, localMessages])();

  // Mark as read when conversation opens
  useEffect(() => {
    if (!token) return;
    markRead(token, partner.id).then(() => {
      qc.invalidateQueries({ queryKey: ["unread-count"] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    });
    socketMarkRead(partner.id);
  }, [partner.id, token]);

  // Listen for new messages
  useEffect(() => {
    const off = onNewMessage((msg) => {
      const relevant = msg.senderId === partner.id || msg.receiverId === partner.id;
      if (!relevant) return;
      setLocalMessages(prev => {
        if (prev.find(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      // Mark as read immediately if from partner
      if (msg.senderId === partner.id && token) {
        markRead(token, partner.id);
        socketMarkRead(partner.id);
        qc.invalidateQueries({ queryKey: ["unread-count"] });
        qc.invalidateQueries({ queryKey: ["conversations"] });
      }
    });
    return off;
  }, [partner.id, token]);

  // Listen for read receipts
  useEffect(() => {
    const off = onMessagesRead(({ by }) => {
      if (by !== partner.id) return;
      setLocalMessages(prev =>
        prev.map(m =>
          m.senderId === user?.id && m.receiverId === partner.id && !m.readAt
            ? { ...m, readAt: new Date().toISOString() }
            : m,
        ),
      );
    });
    return off;
  }, [partner.id, user?.id]);

  // Reset local messages when partner changes
  useEffect(() => { setLocalMessages([]); }, [partner.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async () => {
    const content = draft.trim();
    if (!content || sending) return;
    setSending(true);
    setDraft("");
    try {
      const msg = await sendMessage(partner.id, content);
      if (msg) {
        setLocalMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg]);
        qc.invalidateQueries({ queryKey: ["conversations"] });
      }
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // Group messages by day
  const groups: { day: string; msgs: Message[] }[] = [];
  for (const msg of messages) {
    const day = format(new Date(msg.createdAt), "yyyy-MM-dd");
    const last = groups[groups.length - 1];
    if (last?.day === day) last.msgs.push(msg);
    else groups.push({ day, msgs: [msg] });
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-4 py-3 bg-card shrink-0">
        {onBack && (
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground lg:hidden">
            ←
          </button>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{partner.name ?? partner.email}</p>
          <p className="text-xs text-muted-foreground truncate">{partner.email}</p>
        </div>
        {!connected && (
          <span className="flex items-center gap-1 text-xs text-amber-500" title={connectError ?? undefined}>
            <WifiOff className="h-3.5 w-3.5" />
            {connectError ? `Erro: ${connectError}` : "A conectar..."}
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
          </div>
        ) : groups.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground text-center">
              Nenhuma mensagem ainda.<br />
              Envie a primeira mensagem!
            </p>
          </div>
        ) : (
          groups.map(({ day, msgs }) => (
            <div key={day}>
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground shrink-0">{dayLabel(msgs[0].createdAt)}</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              {msgs.map((msg, i) => {
                const isMine = msg.senderId === user?.id;
                const prevMine = i > 0 && msgs[i - 1].senderId === user?.id;
                const compact = isMine === (i > 0 && msgs[i - 1].senderId === msg.senderId);
                return (
                  <div
                    key={msg.id}
                    className={cn("flex", isMine ? "justify-end" : "justify-start", compact ? "mt-0.5" : "mt-3")}
                  >
                    {!isMine && !prevMine && (
                      <div className="h-7 w-7 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent mr-2 shrink-0 mt-1">
                        {(partner.name ?? partner.email).charAt(0).toUpperCase()}
                      </div>
                    )}
                    {!isMine && prevMine && <div className="w-9 shrink-0" />}

                    <div className={cn("max-w-[75%]", isMine ? "items-end" : "items-start", "flex flex-col")}>
                      <div
                        className={cn(
                          "px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words",
                          isMine
                            ? "bg-accent text-accent-foreground rounded-br-sm"
                            : "bg-muted text-foreground rounded-bl-sm",
                        )}
                      >
                        {msg.content}
                      </div>
                      <div className={cn("flex items-center gap-1 mt-0.5", isMine ? "flex-row-reverse" : "flex-row")}>
                        <span className="text-[10px] text-muted-foreground">{timeStr(msg.createdAt)}</span>
                        {isMine && (
                          <span className={cn("text-[10px]", msg.readAt ? "text-accent" : "text-muted-foreground/50")}>
                            {msg.readAt ? "✓✓" : "✓"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t px-4 py-3 bg-card shrink-0">
        <div className="flex gap-2 items-end">
          <Textarea
            ref={textareaRef}
            rows={1}
            placeholder="Escreva uma mensagem..."
            className="resize-none min-h-[40px] max-h-32 flex-1"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={handleKey}
            disabled={!connected}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!draft.trim() || sending || !connected}
            className="shrink-0 h-10 w-10"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">Enter para enviar · Shift+Enter para nova linha</p>
      </div>
    </div>
  );
}
