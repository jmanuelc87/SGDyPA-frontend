import {
  getValidAccessToken,
  notifySessionExpired,
  SessionExpiredError,
} from '../../features/identity/oidc';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

export async function apiFetch<TResponse>(path: string, init?: RequestInit): Promise<TResponse> {
  const token = await getValidAccessToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (response.status === 401) {
    notifySessionExpired();
    throw new SessionExpiredError();
  }

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json() as Promise<TResponse>;
}
