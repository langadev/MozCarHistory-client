import { apiFetch, withAuthToken } from "./client";

export interface VehicleSummary {
  id: number;
  plateNumber: string;
  vin?: string;
  brandModel: string;
  mileage: number;
  description: string;
  parts?: string;
  mechanic?: string;
  date: string;
  workshopId: number;
  photos: string[];
  workshop?: { name: string };
}

export interface CreateRecordPayload {
  plateNumber: string;
  vin?: string;
  brandModel: string;
  mileage: number;
  description: string;
  parts?: string;
  mechanic?: string;
  workshopId: number;
  photos?: File[];
}

export async function getAllVehicles(): Promise<VehicleSummary[]> {
  return apiFetch<VehicleSummary[]>("/maintenance/all-vehicles");
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

  formData.append("plateNumber", payload.plateNumber);
  if (payload.vin) formData.append("vin", payload.vin);
  formData.append("brandModel", payload.brandModel);
  formData.append("mileage", String(payload.mileage));
  formData.append("description", payload.description);
  if (payload.parts) formData.append("parts", payload.parts);
  if (payload.mechanic) formData.append("mechanic", payload.mechanic);
  formData.append("workshopId", String(payload.workshopId));

  payload.photos?.forEach((file) => formData.append("photos", file));

  return apiFetch("/maintenance", {
    method: "POST",
    body: formData,
    headers: {
      ...withAuthToken(token),
      // Let fetch set Content-Type for multipart
    },
  }, { ignoreJson: true });
}
