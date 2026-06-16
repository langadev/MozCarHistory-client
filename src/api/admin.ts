import { apiFetch, withAuthToken } from "./client";

export interface AdminStats {
  totalUsers: number;
  totalWorkshops: number;
  totalVehicles: number;
  totalRecords: number;
  pendingVehicles: number;
  recentRecords: {
    id: number;
    date: string;
    car: { plateNumber: string; brand: string; model: string };
    workshop: { name: string };
  }[];
}

export interface AdminUser {
  id: number;
  email: string;
  name: string | null;
  createdAt: string;
  suspended: boolean;
  role: { name: string } | null;
}

export interface AdminWorkshop {
  id: number;
  email: string;
  name: string | null;
  verified: boolean;
  suspended: boolean;
  createdAt: string;
  _count: { cars: number; records: number };
}

export interface AdminVehicle {
  id: number;
  plateNumber: string;
  vin: string | null;
  brand: string;
  model: string;
  year: number | null;
  approvalStatus: string;
  approvalNote: string | null;
  owner: { name: string | null } | null;
  _count: { records: number };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

function authHeader(token: string) {
  return { headers: withAuthToken(token) };
}

export const getAdminStats = (token: string): Promise<AdminStats> =>
  apiFetch("/admin/stats", authHeader(token));

export const getAdminUsers = (
  token: string,
  page: number,
  role?: string,
): Promise<{ users: AdminUser[]; total: number; page: number; pageSize: number }> =>
  apiFetch(
    `/admin/users?page=${page}${role ? `&role=${role}` : ""}`,
    authHeader(token),
  );

export const updateUserRole = (
  token: string,
  id: number,
  role: string,
): Promise<AdminUser> =>
  apiFetch(`/admin/users/${id}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
    ...authHeader(token),
  });

export const updateUserStatus = (
  token: string,
  id: number,
  suspended: boolean,
): Promise<AdminUser> =>
  apiFetch(`/admin/users/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ suspended }),
    ...authHeader(token),
  });

export const getAdminWorkshops = (
  token: string,
  page: number,
  verified?: boolean,
): Promise<{ workshops: AdminWorkshop[]; total: number; page: number; pageSize: number }> =>
  apiFetch(
    `/admin/workshops?page=${page}${verified !== undefined ? `&verified=${verified}` : ""}`,
    authHeader(token),
  );

export const updateWorkshopVerify = (
  token: string,
  id: number,
  verified: boolean,
): Promise<AdminWorkshop> =>
  apiFetch(`/admin/workshops/${id}/verify`, {
    method: "PATCH",
    body: JSON.stringify({ verified }),
    ...authHeader(token),
  });

export const updateWorkshopStatus = (
  token: string,
  id: number,
  suspended: boolean,
): Promise<AdminWorkshop> =>
  apiFetch(`/admin/workshops/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ suspended }),
    ...authHeader(token),
  });

export const getAdminVehicles = (
  token: string,
  page: number,
  search?: string,
  approvalStatus?: string,
): Promise<{ vehicles: AdminVehicle[]; total: number; page: number; pageSize: number }> =>
  apiFetch(
    `/admin/vehicles?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${approvalStatus ? `&approvalStatus=${approvalStatus}` : ""}`,
    authHeader(token),
  );

export const approveVehicle = (
  token: string,
  id: number,
  status: "aprovada" | "rejeitada",
  note?: string,
): Promise<{ id: number; plateNumber: string; approvalStatus: string }> =>
  apiFetch(`/admin/vehicles/${id}/approval`, {
    method: "PATCH",
    body: JSON.stringify({ status, note }),
    ...authHeader(token),
  });

export const deleteVehicle = (
  token: string,
  id: number,
): Promise<{ message: string }> =>
  apiFetch(`/admin/vehicles/${id}`, {
    method: "DELETE",
    ...authHeader(token),
  });

export interface CreateWorkshopPayload {
  name: string;
  email: string;
  phone?: string;
  nuit?: string;
  address?: string;
  password: string;
}

export const createWorkshop = (
  token: string,
  payload: CreateWorkshopPayload,
): Promise<{ id: number; email: string; name: string | null; verified: boolean }> =>
  apiFetch("/admin/workshops", {
    method: "POST",
    body: JSON.stringify(payload),
    ...authHeader(token),
  });

export const resetUserPassword = (
  token: string,
  id: number,
  password: string,
): Promise<{ id: number; email: string; name: string | null }> =>
  apiFetch(`/admin/users/${id}/reset-password`, {
    method: "PATCH",
    body: JSON.stringify({ password }),
    ...authHeader(token),
  });
