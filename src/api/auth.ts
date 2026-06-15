import { apiFetch, withAuthToken } from "./client";

export interface LoginPayload {
  email: string;
  password: string;
  role?: "oficina" | "comprador" | "mecanico";
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
    role: "oficina" | "comprador" | "admin" | "mecanico";
    mustChangePassword: boolean;
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

export async function changePassword(
  token: string,
  currentPassword: string,
  newPassword: string,
): Promise<{ message: string }> {
  return apiFetch("/auth/change-password", {
    method: "PATCH",
    body: JSON.stringify({ currentPassword, newPassword }),
    ...{ headers: withAuthToken(token) },
  });
}
