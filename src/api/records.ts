import { apiFetch, withAuthToken } from "./client";

export interface MyRecord {
  id: number;
  carId: number;
  mileage: number;
  serviceType: string | null;
  description: string;
  parts: string | null;
  cost: number | null;
  nextServiceMileage: number | null;
  date: string;
  createdAt: string;
  workshopId: number;
  photos: string[];
  car: { plateNumber: string; brand: string; model: string; photos: string[] };
  mechanic: { id: number; name: string; specialty: string | null } | null;
}

export async function getMyRecords(token: string): Promise<MyRecord[]> {
  return apiFetch<MyRecord[]>("/maintenance/my", { headers: withAuthToken(token) });
}

export interface UpdateRecordPayload {
  mileage?: number;
  serviceType?: string;
  description?: string;
  parts?: string;
  cost?: number;
  nextServiceMileage?: number;
  mechanicId?: number;
}

export async function updateRecord(id: number, payload: UpdateRecordPayload, token: string): Promise<MyRecord> {
  return apiFetch<MyRecord>(`/maintenance/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...withAuthToken(token) },
    body: JSON.stringify(payload),
  });
}

export async function deleteRecord(id: number, token: string): Promise<void> {
  await apiFetch(`/maintenance/${id}`, { method: "DELETE", headers: withAuthToken(token) });
}

export function isRecordEditable(createdAt: string): boolean {
  const created = new Date(createdAt);
  const diffHours = (Date.now() - created.getTime()) / (1000 * 60 * 60);
  return diffHours <= 48;
}

export function hoursUntilLocked(createdAt: string): number {
  const created = new Date(createdAt);
  const diffHours = (Date.now() - created.getTime()) / (1000 * 60 * 60);
  return Math.max(0, 48 - diffHours);
}

export interface VehicleSummary {
  id: number;
  car: {
    plateNumber: string;
    vin?: string;
    brand: string;
    model: string;
    year?: number | null;
    color?: string | null;
    fuelType?: string | null;
    photos?: string[];
  };
  mileage: number;
  serviceType?: string | null;
  description: string;
  parts?: string | null;
  cost?: number | null;
  nextServiceMileage?: number | null;
  mechanic?: { id: number; name: string; specialty: string | null; photo: string | null } | null;
  date: string;
  workshopId: number;
  photos: string[];
  workshop?: { name: string };
}

export interface CreateRecordPayload {
  carId: number;
  mileage: number;
  description: string;
  serviceType?: string;
  parts?: string;
  cost?: number;
  nextServiceMileage?: number;
  mechanicId?: number;
  workshopId: number;
  photos?: File[];
}

export async function getAllVehicles(): Promise<VehicleSummary[]> {
  const result = await apiFetch<any[]>("/maintenance/all-vehicles");
  // Map Car objects to VehicleSummary
  return result.map(car => ({
    id: car.id,
    car: {
      plateNumber: car.plateNumber,
      vin: car.vin,
      brand: car.brand,
      model: car.model,
      photos: car.photos,
    },
    mileage: car.records?.[0]?.mileage || 0,
    description: car.records?.[0]?.description || "Sem descrição disponível",
    date: car.records?.[0]?.date || car.createdAt,
    workshopId: car.records?.[0]?.workshopId || 0,
    photos: car.records?.[0]?.photos || [],
    workshop: car.records?.[0]?.workshop,
  }));
}

export async function searchRecordsByPlate(plate: string): Promise<VehicleSummary[]> {
  return apiFetch<VehicleSummary[]>(`/maintenance/search?plate=${encodeURIComponent(plate)}`);
}

export async function searchRecordsByVin(vin: string): Promise<VehicleSummary[]> {
  return apiFetch<VehicleSummary[]>(`/maintenance/search?vin=${encodeURIComponent(vin)}`);
}

export async function getWorkshopRecords(workshopId: number, token?: string): Promise<VehicleSummary[]> {
  return apiFetch<VehicleSummary[]>(`/maintenance/workshop/${workshopId}`, {
    headers: withAuthToken(token),
  });
}

export async function createRecord(payload: CreateRecordPayload, token?: string) {
  const formData = new FormData();

  formData.append("carId", String(payload.carId));
  formData.append("mileage", String(payload.mileage));
  formData.append("description", payload.description);
  if (payload.serviceType) formData.append("serviceType", payload.serviceType);
  if (payload.parts) formData.append("parts", payload.parts);
  if (payload.cost) formData.append("cost", String(payload.cost));
  if (payload.nextServiceMileage) formData.append("nextServiceMileage", String(payload.nextServiceMileage));
  if (payload.mechanicId) formData.append("mechanicId", String(payload.mechanicId));
  formData.append("workshopId", String(payload.workshopId));

  payload.photos?.forEach((file) => formData.append("photos", file));

  return apiFetch("/maintenance", {
    method: "POST",
    body: formData,
    headers: { ...withAuthToken(token) },
  }, { ignoreJson: true });
}
