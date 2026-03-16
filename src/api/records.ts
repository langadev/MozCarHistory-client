import { apiFetch, withAuthToken } from "./client";

export interface VehicleSummary {
  id: number;
  car: {
    plateNumber: string;
    vin?: string;
    brandModel: string;
    photos?: string[];
  };
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
  carId: number;
  mileage: number;
  description: string;
  parts?: string;
  mechanic?: string;
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
      brandModel: car.brandModel,
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
