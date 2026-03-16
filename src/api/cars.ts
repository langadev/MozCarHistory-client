import { apiFetch, withAuthToken } from "./client";

export interface Car {
    id: number;
    plateNumber: string;
    vin?: string;
    brandModel: string;
    ownerId?: number;
    photos?: string[];
}

export interface CreateCarPayload {
    plateNumber: string;
    vin?: string;
    brandModel: string;
    ownerId?: number;
    photos?: File[];
}

export async function createCar(payload: CreateCarPayload, token?: string) {
    const formData = new FormData();
    formData.append("plateNumber", payload.plateNumber);
    if (payload.vin) formData.append("vin", payload.vin);
    formData.append("brandModel", payload.brandModel);
    if (payload.ownerId) formData.append("ownerId", String(payload.ownerId));

    if (payload.photos) {
        payload.photos.forEach(file => {
            formData.append("photos", file);
        });
    }

    return apiFetch("/cars", {
        method: "POST",
        headers: {
            ...withAuthToken(token),
        },
        body: formData,
    }, { ignoreJson: true });
}

export async function getAllCars(token?: string): Promise<Car[]> {
    return apiFetch<Car[]>("/cars", {
        headers: withAuthToken(token),
    });
}

export async function getCarByPlate(plateNumber: string, token?: string): Promise<Car | null> {
    const cars = await apiFetch<Car[]>(`/cars?plate=${encodeURIComponent(plateNumber)}`, {
        headers: withAuthToken(token),
    });
    return cars.length > 0 ? cars[0] : null;
}
