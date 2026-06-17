import { useNavigate } from "react-router-dom";
import { Bell, Check, Trash2, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/context/NotificationsContext";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const typeIcon: Record<string, string> = {
  vehicle_approved: "✅",
  vehicle_rejected: "❌",
  new_record: "🔧",
  workshop_verified: "✅",
  workshop_unverified: "⚠️",
  account_activated: "✅",
  new_message: "💬",
};

export default function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead, remove } = useNotifications();
  const navigate = useNavigate();

  const handleClick = (notif: { id: number; link: string | null; read: boolean }) => {
    if (!notif.read) markRead(notif.id);
    if (notif.link) navigate(notif.link);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative shrink-0">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-semibold">Notificações</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs text-muted-foreground" onClick={markAllRead}>
              <Check className="h-3 w-3" />
              Marcar tudo como lido
            </Button>
          )}
        </div>

        {/* List */}
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
            <BellOff className="h-8 w-8 opacity-30" />
            <p className="text-sm">Sem notificações</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[380px]">
            <div className="divide-y">
              {notifications.map(notif => (
                <div
                  key={notif.id}
                  className={cn(
                    "flex gap-3 px-4 py-3 transition-colors",
                    !notif.read ? "bg-accent/5" : "",
                    notif.link ? "cursor-pointer hover:bg-muted/50" : "",
                  )}
                  onClick={() => handleClick(notif)}
                >
                  <span className="text-base shrink-0 mt-0.5">{typeIcon[notif.type] ?? "🔔"}</span>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm leading-snug", !notif.read && "font-medium")}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{notif.body}</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    {!notif.read && (
                      <span className="h-2 w-2 rounded-full bg-accent" />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground/50 hover:text-destructive"
                      onClick={e => { e.stopPropagation(); remove(notif.id); }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}
