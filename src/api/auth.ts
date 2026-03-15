import { apiFetch, withAuthToken } from "./client";

export interface LoginPayload {
  email: string;
  password: string;
  role: "oficina" | "comprador";
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: "oficina" | "comprador";
  phone?: string;
  address?: string;
  nuit?: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: "oficina" | "comprador";
  };
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function refreshMe(token: string) {
  // Example endpoint if added; placeholder for future
  return apiFetch("/auth/me", {
    method: "GET",
    headers: withAuthToken(token),
  });
}
