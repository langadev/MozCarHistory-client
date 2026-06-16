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
  engineType?: string | null;
  driveType?: string | null;
  bodyType?: string | null;
  importYear?: number | null;
  situation?: string | null;
  initialMileage?: number | null;
  approvalStatus?: string | null;
  approvalNote?: string | null;
  ownerId?: number | null;
  registeredById?: number | null;
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
  engineType?: string;
  driveType?: string;
  bodyType?: string;
  initialMileage?: number;
  importYear?: number;
  situation?: string;
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
  if (payload.engineType) formData.append("engineType", payload.engineType);
  if (payload.driveType) formData.append("driveType", payload.driveType);
  if (payload.bodyType) formData.append("bodyType", payload.bodyType);
  if (payload.initialMileage) formData.append("initialMileage", String(payload.initialMileage));
  if (payload.importYear) formData.append("importYear", String(payload.importYear));
  if (payload.situation) formData.append("situation", payload.situation);
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

export interface MyCar extends Car {
  _count: { records: number };
}

export async function getMyRegisteredCars(token: string): Promise<MyCar[]> {
  return apiFetch<MyCar[]>("/cars/my", { headers: withAuthToken(token) });
}

export interface UpdateCarPayload {
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  fuelType?: string;
  engineType?: string;
  driveType?: string;
  transmission?: string;
  engineSize?: string;
  bodyType?: string;
  initialMileage?: number;
  importYear?: number;
  situation?: string;
}

export async function updateCar(id: number, payload: UpdateCarPayload, token: string): Promise<Car> {
  return apiFetch<Car>(`/cars/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...withAuthToken(token) },
    body: JSON.stringify(payload),
  });
}

export async function deleteCar(id: number, token: string): Promise<void> {
  await apiFetch(`/cars/${id}`, { method: "DELETE", headers: withAuthToken(token) });
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

export async function getCarByVin(vin: string, token?: string): Promise<Car | null> {
  const cars = await apiFetch<Car[]>(`/cars?vin=${encodeURIComponent(vin)}`, {
    headers: withAuthToken(token),
  });
  return cars.length > 0 ? cars[0] : null;
}
