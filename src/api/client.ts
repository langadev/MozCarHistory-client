const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export interface ApiError {
  message: string;
  status?: number;
  details?: unknown;
}

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {},
  { ignoreJson = false }: { ignoreJson?: boolean } = {},
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const isFormData = options.body instanceof FormData;

  const response = await fetch(url, {
    ...options,
    headers: {
      // Only set JSON content-type for non-FormData bodies (browser sets multipart boundary automatically)
      ...(!isFormData ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = (body && (body.message || body.error)) || response.statusText;
    const error: ApiError = { message, status: response.status, details: body };
    throw error;
  }

  if (ignoreJson) {
    return {} as T;
  }

  return body as T;
}

export function withAuthToken(token?: string) {
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}
