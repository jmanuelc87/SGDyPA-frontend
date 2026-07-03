# SGDyPA Frontend

SPA para el Software de Gestión Documental y Procesos de Auditoría.

## Stack

- Vite + React + TypeScript.
- TanStack Query para estado de servidor contra la API versionada (`/api/v1`).
- Organización feature-first por bounded context, espejando los módulos Django.

## Estructura

```text
src/
  app/                 # bootstrap, providers y shell de la SPA
  shared/              # utilidades/primitivos sin dominio
    api/
    types/
    ui/
  features/            # bounded contexts del dominio
    program/
    audit-process/
    findings/
    capa/
    disposition/
    documents/
    trail/
    rag/
    identity/
```

## Autenticación (OIDC PKCE con Keycloak)

La SPA usa el flujo Authorization Code + PKCE contra Keycloak. La
configuración tiene dos lados: las variables de entorno del frontend y la
configuración del realm/cliente en Keycloak, que deben coincidir.

### Variables de entorno

Copia `.env.example` a `.env` y ajusta los valores:

| Variable              | Requerida | Ejemplo                                      | Notas                                                                                                   |
| --------------------- | --------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `VITE_OIDC_ISSUER`    | Sí        | `https://keycloak.example.com/realms/sgdypa` | URL base del realm. La app deriva los endpoints (`/protocol/openid-connect/auth`, `/token`, `/logout`). |
| `VITE_OIDC_CLIENT_ID` | Sí        | `sgdypa-spa`                                 | ID del cliente público en Keycloak.                                                                     |
| `VITE_OIDC_SCOPE`     | No        | `openid profile email`                       | Valor por defecto si no se define.                                                                      |
| `VITE_API_BASE_URL`   | No        | `/api/v1`                                    | Base de la API versionada.                                                                              |

Sin `VITE_OIDC_ISSUER` ni `VITE_OIDC_CLIENT_ID` la app lanza un error y no
habilita el login.

### Configuración del cliente en Keycloak

Crea un realm (p. ej. `sgdypa`) y un cliente que coincida con lo que envía la
SPA (`src/features/identity/oidc.ts`):

- **Client ID**: igual a `VITE_OIDC_CLIENT_ID` (`sgdypa-spa`).
- **Client type**: OpenID Connect, cliente **público** (sin secret; usa PKCE).
- **PKCE**: _Proof Key for Code Exchange Code Challenge Method_ = **S256**.
- **Standard flow enabled**: ON (Authorization Code, `response_type=code`).
- **Direct access grants**: OFF.
- **Valid redirect URIs**: origen de la app + `/auth/callback`, p. ej.
  `https://app.example.com/auth/callback` y `http://localhost:5173/auth/callback`
  para desarrollo.
- **Valid post-logout redirect URIs**: origen de la app, p. ej.
  `https://app.example.com`.
- **Web origins** (CORS): origen de la app (o `+`); el navegador hace POST
  directo al endpoint de token. En desarrollo agrega `http://localhost:5173`.
  Evita `*`, que deshabilita CORS con credenciales. Si falta este valor
  obtendrás `No 'Access-Control-Allow-Origin' header is present` al hacer login.

### Desarrollo local

Apunta el issuer a tu Keycloak local en `.env`:

```
VITE_OIDC_ISSUER=http://localhost:8080/realms/sgdypa
```

Y en el cliente `sgdypa-spa` agrega, para el origen `http://localhost:5173`:

- **Valid redirect URIs**: `http://localhost:5173/auth/callback`
- **Valid post-logout redirect URIs**: `http://localhost:5173`
- **Web origins**: `http://localhost:5173`

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run format:check
npm run typecheck
```

El hook de pre-commit ejecuta `format:check`, `lint` y `typecheck`.
