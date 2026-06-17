import { apiFetch, withAuthToken } from "./client";

export interface AppNotification {
  id: number;
  type: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

function authHeader(token: string) {
  return { headers: withAuthToken(token) };
}

export const getNotifications = (token: string): Promise<AppNotification[]> =>
  apiFetch("/notifications", authHeader(token));

export const getUnreadNotifCount = (token: string): Promise<{ count: number }> =>
  apiFetch("/notifications/unread-count", authHeader(token));

export const markNotifRead = (token: string, id: number): Promise<{ ok: boolean }> =>
  apiFetch(`/notifications/${id}/read`, { method: "PATCH", ...authHeader(token) });

export const markAllNotifsRead = (token: string): Promise<{ ok: boolean }> =>
  apiFetch("/notifications/read-all", { method: "PATCH", ...authHeader(token) });

export const deleteNotif = (token: string, id: number): Promise<{ ok: boolean }> =>
  apiFetch(`/notifications/${id}`, { method: "DELETE", ...authHeader(token) });
