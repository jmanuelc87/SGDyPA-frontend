import {
  getValidAccessToken,
  notifySessionExpired,
  SessionExpiredError,
} from '../../features/identity/oidc';
import { ApiError, isApiErrorEnvelope } from './errors';
import type { paths } from './openapi';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

type HttpMethod = 'get' | 'post' | 'patch' | 'delete';
type Operation<
  Path extends keyof paths,
  Method extends HttpMethod,
> = Method extends keyof paths[Path] ? paths[Path][Method] : never;
type JsonRequestBody<Op> = Op extends {
  requestBody: { content: { 'application/json': infer Body } };
}
  ? Body
  : never;
type JsonResponse<Op> = Op extends {
  responses: infer Responses;
}
  ? Responses extends Record<number, infer Response>
    ? Response extends { content: { 'application/json': infer Body } }
      ? Body
      : Response extends { content: { 'text/event-stream': infer StreamBody } }
        ? StreamBody
        : never
    : never
  : never;

type HeadersInitRecord = Record<string, string>;

export interface ApiFetchOptions<Body = never> extends Omit<RequestInit, 'body' | 'method'> {
  body?: Body;
  idempotencyKey?: string | false;
  organizationId?: string;
}

export async function apiFetch<
  Path extends keyof paths,
  Method extends keyof paths[Path] & HttpMethod,
>(
  path: Path,
  method: Method,
  init?: ApiFetchOptions<JsonRequestBody<Operation<Path, Method>>>,
): Promise<JsonResponse<Operation<Path, Method>>> {
  const token = await getValidAccessToken();
  const headers = buildHeaders({
    existing: init?.headers,
    hasJsonBody: init?.body !== undefined,
    idempotencyKey: method === 'post' ? init?.idempotencyKey : false,
    organizationId: init?.organizationId,
    token,
  });

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    body: init?.body === undefined ? undefined : JSON.stringify(init.body),
    headers,
    method: method.toUpperCase(),
  });

  if (response.status === 401) {
    notifySessionExpired();
    throw new SessionExpiredError();
  }

  if (!response.ok) {
    throw await buildApiError(response);
  }

  if (response.status === 204) {
    return undefined as JsonResponse<Operation<Path, Method>>;
  }

  const contentType = response.headers.get('Content-Type') ?? '';
  if (contentType.includes('text/event-stream')) {
    return response.body as JsonResponse<Operation<Path, Method>>;
  }

  return response.json() as Promise<JsonResponse<Operation<Path, Method>>>;
}

function buildHeaders({
  existing,
  hasJsonBody,
  idempotencyKey,
  organizationId,
  token,
}: {
  existing?: HeadersInit;
  hasJsonBody: boolean;
  idempotencyKey?: string | false;
  organizationId?: string;
  token: string | null;
}): HeadersInitRecord {
  const headers: HeadersInitRecord = {
    Accept: 'application/json',
    ...(hasJsonBody ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(organizationId ? { 'X-Organization-Id': organizationId } : {}),
    ...headersToRecord(existing),
  };

  if (idempotencyKey !== false) {
    headers['Idempotency-Key'] = idempotencyKey ?? crypto.randomUUID();
  }

  return headers;
}

function headersToRecord(headers?: HeadersInit): HeadersInitRecord {
  if (!headers) return {};
  if (headers instanceof Headers) return Object.fromEntries(headers.entries());
  if (Array.isArray(headers)) return Object.fromEntries(headers);
  return headers;
}

async function buildApiError(response: Response): Promise<Error> {
  const contentType = response.headers.get('Content-Type') ?? '';

  if (contentType.includes('application/json')) {
    const payload: unknown = await response.json();
    if (isApiErrorEnvelope(payload)) {
      return new ApiError(response.status, payload);
    }
  }

  return new Error(`API request failed with status ${response.status}`);
}
