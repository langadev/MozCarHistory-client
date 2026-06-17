import { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { AppNotification } from "@/api/notifications";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || "http://localhost:3000";

interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  markRead: (id: number) => void;
  markAllRead: () => void;
  remove: (id: number) => void;
}

const NotificationsContext = createContext<NotificationsContextValue>({
  notifications: [],
  unreadCount: 0,
  markRead: () => {},
  markAllRead: () => {},
  remove: () => {},
});

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const qc = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Load existing notifications from API on mount
  useEffect(() => {
    if (!token) return;
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then((data: AppNotification[]) => {
        if (Array.isArray(data)) setNotifications(data);
      })
      .catch(() => {});
  }, [token]);

  // WebSocket for real-time delivery
  useEffect(() => {
    if (!token) return;

    const socket = io(`${SOCKET_URL}/notifications`, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    socket.on("notification", (notif: AppNotification) => {
      setNotifications(prev => [notif, ...prev]);
      // Invalidate unread-count query used by other components
      qc.invalidateQueries({ queryKey: ["unread-count"] });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, qc]);

  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const markRead = useCallback((id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    fetch(`${apiBase}/notifications/${id}/read`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }, [token, apiBase]);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    fetch(`${apiBase}/notifications/read-all`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }, [token, apiBase]);

  const remove = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    fetch(`${apiBase}/notifications/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }, [token, apiBase]);

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, remove }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationsContext);
}
