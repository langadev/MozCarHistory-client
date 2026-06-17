import { apiFetch, withAuthToken } from "./client";
import { CarSearchResult } from "./cars";

export interface BuyerProfile {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  address: string | null;
  createdAt: string;
  role: { name: string } | null;
  _count: { favorites: number };
}

export interface SearchHistoryEntry {
  id: number;
  query: string;
  createdAt: string;
}

function auth(token: string) {
  return { headers: withAuthToken(token) };
}

// ── Profile ──────────────────────────────────────────────────────────────────
export const getMyProfile = (token: string): Promise<BuyerProfile> =>
  apiFetch("/users/me", auth(token));

export const updateMyProfile = (
  token: string,
  data: { name?: string; phone?: string; address?: string },
): Promise<BuyerProfile> =>
  apiFetch("/users/me", { method: "PATCH", body: JSON.stringify(data), ...auth(token) });

// ── Favorites ─────────────────────────────────────────────────────────────────
export const getMyFavorites = (token: string): Promise<CarSearchResult[]> =>
  apiFetch("/users/me/favorites", auth(token));

export const getMyFavoriteIds = (token: string): Promise<number[]> =>
  apiFetch("/users/me/favorites/ids", auth(token));

export const addToFavorites = (token: string, carId: number): Promise<{ ok: boolean }> =>
  apiFetch(`/users/me/favorites/${carId}`, { method: "POST", ...auth(token) });

export const removeFromFavorites = (token: string, carId: number): Promise<{ ok: boolean }> =>
  apiFetch(`/users/me/favorites/${carId}`, { method: "DELETE", ...auth(token) });

// ── Search History ────────────────────────────────────────────────────────────
export const getSearchHistory = (token: string): Promise<SearchHistoryEntry[]> =>
  apiFetch("/users/me/search-history", auth(token));

export const addToSearchHistory = (token: string, query: string): Promise<{ ok: boolean }> =>
  apiFetch("/users/me/search-history", { method: "POST", body: JSON.stringify({ query }), ...auth(token) });

export const clearSearchHistory = (token: string): Promise<{ ok: boolean }> =>
  apiFetch("/users/me/search-history", { method: "DELETE", ...auth(token) });

export const deleteSearchHistoryItem = (token: string, id: number): Promise<{ ok: boolean }> =>
  apiFetch(`/users/me/search-history/${id}`, { method: "DELETE", ...auth(token) });
