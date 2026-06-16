import { apiFetch, withAuthToken } from "./client";

export interface Car {
  id: number;
  plateNumber: string;
  vin?: string;
  brand: string;
  model: string;
  year?: number | null;
  color?: string | null;
  fuelType?: string | null;
  transmission?: string | null;
  engineSize?: string | null;
  bodyType?: string | null;
  initialMileage?: number | null;
  approvalStatus?: string | null;
  approvalNote?: string | null;
  ownerId?: number | null;
  photos?: string[];
  records?: { mileage: number }[];
}

export function carName(car: Pick<Car, "brand" | "model">) {
  return `${car.brand} ${car.model}`;
}

export interface CreateCarPayload {
  plateNumber: string;
  brand: string;
  model: string;
  vin?: string;
  year?: number;
  color?: string;
  fuelType?: string;
  transmission?: string;
  engineSize?: string;
  bodyType?: string;
  initialMileage?: number;
  ownerId?: number;
  photos?: File[];
}

export async function createCar(payload: CreateCarPayload, token?: string) {
  const formData = new FormData();
  formData.append("plateNumber", payload.plateNumber);
  formData.append("brand", payload.brand);
  formData.append("model", payload.model);
  if (payload.vin) formData.append("vin", payload.vin);
  if (payload.year) formData.append("year", String(payload.year));
  if (payload.color) formData.append("color", payload.color);
  if (payload.fuelType) formData.append("fuelType", payload.fuelType);
  if (payload.transmission) formData.append("transmission", payload.transmission);
  if (payload.engineSize) formData.append("engineSize", payload.engineSize);
  if (payload.bodyType) formData.append("bodyType", payload.bodyType);
  if (payload.initialMileage) formData.append("initialMileage", String(payload.initialMileage));
  if (payload.ownerId) formData.append("ownerId", String(payload.ownerId));
  payload.photos?.forEach(file => formData.append("photos", file));

  return apiFetch("/cars", {
    method: "POST",
    headers: { ...withAuthToken(token) },
    body: formData,
  }, { ignoreJson: true });
}

export interface CarSearchResult extends Car {
  records: { mileage: number; date: string; serviceType: string | null; workshop: { name: string } | null }[];
  _count: { records: number };
}

export interface CarSearchResponse {
  cars: CarSearchResult[];
  total: number;
  page: number;
  pageSize: number;
}

export async function searchCars(q: string, page = 1, limit = 12): Promise<CarSearchResponse> {
  return apiFetch<CarSearchResponse>(
    `/cars/search?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`,
  );
}

export async function getAllCars(token?: string): Promise<Car[]> {
  return apiFetch<Car[]>("/cars", { headers: withAuthToken(token) });
}

export async function getCarByPlate(plateNumber: string, token?: string): Promise<Car | null> {
  const cars = await apiFetch<Car[]>(`/cars?plate=${encodeURIComponent(plateNumber)}`, {
    headers: withAuthToken(token),
  });
  return cars.length > 0 ? cars[0] : null;
}
