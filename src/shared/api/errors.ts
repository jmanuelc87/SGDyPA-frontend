import type { components } from './openapi';

export type ApiErrorEnvelope = components['schemas']['ErrorEnvelope'];
export type ApiErrorCode = ApiErrorEnvelope['error']['code'];

const ERROR_MESSAGES: Partial<Record<ApiErrorCode, string>> = {
  forbidden: 'No tienes permisos para realizar esta acción.',
  illegal_transition: 'La transición solicitada no es válida para el estado actual.',
  idempotency_key_required:
    'No se pudo confirmar la operación de forma segura. Inténtalo de nuevo.',
  legal_hold_active: 'El documento tiene una retención legal activa.',
  not_found: 'El recurso solicitado no existe o no está disponible.',
  scope_frozen: 'El alcance de la auditoría está congelado y no admite este cambio.',
  self_approval_forbidden: 'No puedes aprobar tu propia solicitud (segregación de funciones).',
  unauthorized: 'Tu sesión expiró. Inicia sesión nuevamente.',
  validation_failed: 'Revisa los datos capturados e inténtalo de nuevo.',
};

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly details: unknown[];
  readonly requestId: string;
  readonly status: number;
  readonly uiMessage: string;

  constructor(status: number, envelope: ApiErrorEnvelope) {
    super(envelope.error.message);
    this.name = 'ApiError';
    this.code = envelope.error.code;
    this.details = envelope.error.details;
    this.requestId = envelope.error.request_id;
    this.status = status;
    this.uiMessage = ERROR_MESSAGES[this.code] ?? envelope.error.message;
  }
}

export function isApiErrorEnvelope(payload: unknown): payload is ApiErrorEnvelope {
  if (!payload || typeof payload !== 'object' || !('error' in payload)) return false;

  const error = (payload as { error: unknown }).error;
  return (
    !!error &&
    typeof error === 'object' &&
    typeof (error as { code?: unknown }).code === 'string' &&
    typeof (error as { message?: unknown }).message === 'string' &&
    Array.isArray((error as { details?: unknown }).details) &&
    typeof (error as { request_id?: unknown }).request_id === 'string'
  );
}
