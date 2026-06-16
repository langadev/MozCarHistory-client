import { apiFetch, withAuthToken } from "./client";

export interface MessageUser {
  id: number;
  name: string | null;
  email: string;
  role: { name: string } | null;
}

export interface Message {
  id: number;
  content: string;
  createdAt: string;
  readAt: string | null;
  senderId: number;
  receiverId: number;
  sender: MessageUser;
  receiver: MessageUser;
}

export interface Conversation {
  partner: { id: number; name: string | null; email: string; role: string | null };
  lastMessage: Message;
  unreadCount: number;
}

function auth(token: string) {
  return { headers: withAuthToken(token) };
}

export const getConversations = (token: string): Promise<Conversation[]> =>
  apiFetch("/messages/conversations", auth(token));

export const getConversation = (token: string, partnerId: number): Promise<Message[]> =>
  apiFetch(`/messages/conversation/${partnerId}`, auth(token));

export const getUnreadCount = (token: string): Promise<number> =>
  apiFetch("/messages/unread-count", auth(token));

export const markRead = (token: string, senderId: number): Promise<void> =>
  apiFetch(`/messages/read/${senderId}`, { method: "PATCH", ...auth(token) });
