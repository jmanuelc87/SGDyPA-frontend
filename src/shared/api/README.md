# Cliente API

El cliente compartido consume la API versionada `/api/v1` con tipos derivados del
contrato OpenAPI. Mientras AUR-8 publica el artefacto OpenAPI 3.1 definitivo, el
archivo `openapi.ts` conserva la forma esperada por `openapi-typescript` para que
los hooks de dominio dependan de `paths`/`components` y no de tipos ad-hoc.

## Convenciones transversales

- `apiFetch(path, method, options)` exige rutas y métodos declarados en `paths`.
- Todo `POST` adjunta `Idempotency-Key` automáticamente con `crypto.randomUUID()`;
  puede recibirse una llave explícita para reintentos coordinados o `false` solo
  para endpoints sin efectos laterales documentados.
- Los errores con envelope `{ error: { code, message, details, request_id } }` se
  normalizan como `ApiError`, exponiendo `uiMessage` para mensajes consistentes en
  español.
- `organizationId` se envía como `X-Organization-Id` cuando la pantalla ya conoce
  la organización activa.
