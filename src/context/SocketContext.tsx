import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/hooks/useAuth";
import type { Message } from "@/api/messages";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000";

interface SocketContextValue {
  socket: Socket | null;
  connected: boolean;
  sendMessage: (receiverId: number, content: string) => Promise<Message | null>;
  markRead: (senderId: number) => void;
  onNewMessage: (cb: (msg: Message) => void) => () => void;
  onMessagesRead: (cb: (data: { by: number }) => void) => () => void;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  connected: false,
  sendMessage: async () => null,
  markRead: () => {},
  onNewMessage: () => () => {},
  onMessagesRead: () => () => {},
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnected(false);
      return;
    }

    const socket = io(`${SOCKET_URL}/messages`, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socketRef.current = socket;
    return () => { socket.disconnect(); socketRef.current = null; setConnected(false); };
  }, [token]);

  const sendMessage = (receiverId: number, content: string): Promise<Message | null> =>
    new Promise(resolve => {
      if (!socketRef.current?.connected) { resolve(null); return; }
      socketRef.current.emit("send_message", { receiverId, content }, (msg: Message) => resolve(msg));
    });

  const markRead = (senderId: number) => {
    socketRef.current?.emit("mark_read", { senderId });
  };

  const onNewMessage = (cb: (msg: Message) => void) => {
    socketRef.current?.on("new_message", cb);
    return () => { socketRef.current?.off("new_message", cb); };
  };

  const onMessagesRead = (cb: (data: { by: number }) => void) => {
    socketRef.current?.on("messages_read", cb);
    return () => { socketRef.current?.off("messages_read", cb); };
  };

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected, sendMessage, markRead, onNewMessage, onMessagesRead }}>
      {children}
    </SocketContext.Provider>
  );
}
