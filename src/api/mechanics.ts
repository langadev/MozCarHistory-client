import { apiFetch, withAuthToken } from "./client";

export interface Mechanic {
  id: number;
  name: string;
  specialty: string | null;
  phone: string | null;
  photo: string | null;
  active: boolean;
  workshopId: number;
  userId: number | null;
  user: { id: number; email: string } | null;
  createdAt: string;
}

function authHeader(token: string) {
  return { headers: withAuthToken(token) };
}

export const getMechanics = (token: string, active?: boolean): Promise<Mechanic[]> =>
  apiFetch(
    `/mechanics${active !== undefined ? `?active=${active}` : ""}`,
    authHeader(token),
  );

export const createMechanic = (token: string, data: FormData): Promise<Mechanic> =>
  apiFetch("/mechanics", {
    method: "POST",
    body: data,
    headers: withAuthToken(token),
  });

export const updateMechanic = (token: string, id: number, data: FormData): Promise<Mechanic> =>
  apiFetch(`/mechanics/${id}`, {
    method: "PATCH",
    body: data,
    headers: withAuthToken(token),
  });

export const updateMechanicStatus = (
  token: string,
  id: number,
  active: boolean,
): Promise<Mechanic> =>
  apiFetch(`/mechanics/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ active }),
    ...authHeader(token),
  });
