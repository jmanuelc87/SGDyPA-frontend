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

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run format:check
npm run typecheck
```

El hook de pre-commit ejecuta `format:check`, `lint` y `typecheck`.
