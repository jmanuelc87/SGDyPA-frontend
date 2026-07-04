/**
 * Tipos del cliente derivados del contrato OpenAPI 3.1 de `/api/v1`.
 *
 * Fuente de verdad: `docs/SGDyPA-docs/apis-requeridas-sgd.md` hasta que AUR-8
 * publique el artefacto OpenAPI versionado. Mantener este archivo como la capa
 * que `openapi-typescript` reemplazará sin cambiar consumidores.
 */
export interface paths {
  '/me': {
    get: {
      responses: {
        200: { content: { 'application/json': components['schemas']['MeResponse'] } };
      };
    };
  };
  '/organizations': {
    get: {
      responses: {
        200: { content: { 'application/json': components['schemas']['Organization'][] } };
      };
    };
  };
  '/audit-processes/{id}/transitions': {
    post: {
      requestBody: {
        content: { 'application/json': components['schemas']['AuditTransitionRequest'] };
      };
      responses: {
        200: { content: { 'application/json': components['schemas']['AuditTransitionResponse'] } };
        201: { content: { 'application/json': components['schemas']['AuditTransitionResponse'] } };
      };
    };
  };
  '/assistant/queries': {
    post: {
      requestBody: {
        content: { 'application/json': components['schemas']['AssistantQueryRequest'] };
      };
      responses: {
        200: { content: { 'text/event-stream': string } };
      };
    };
  };
}

export interface components {
  schemas: {
    ErrorEnvelope: {
      error: {
        code: ApiErrorCode;
        message: string;
        details: unknown[];
        request_id: string;
      };
    };
    MeResponse: {
      id: string;
      keycloak_sub: string;
      email: string;
      display_name: string;
      memberships: components['schemas']['Membership'][];
      organizations?: components['schemas']['Organization'][];
      orgs?: components['schemas']['Organization'][];
    };
    Membership: {
      organization_id: string;
      organization_name?: string;
      organization?: components['schemas']['Organization'];
      roles: string[];
      status: string;
    };
    Organization: {
      id: string;
      name: string;
      label?: string;
    };
    AuditTransitionRequest: {
      evento: string;
      [key: string]: unknown;
    };
    AuditTransitionResponse: {
      current_state: string;
      transition: {
        id: string;
        estado_origen: string;
        estado_destino: string;
        es_backlink: boolean;
        evento: string;
      };
    };
    AssistantQueryRequest: {
      question: string;
      context: {
        type: 'audit' | 'document' | 'program';
        id: string;
      };
    };
  };
}

export type ApiErrorCode =
  | 'forbidden'
  | 'illegal_transition'
  | 'idempotency_key_required'
  | 'legal_hold_active'
  | 'not_found'
  | 'scope_frozen'
  | 'self_approval_forbidden'
  | 'unauthorized'
  | 'validation_failed'
  | (string & {});
