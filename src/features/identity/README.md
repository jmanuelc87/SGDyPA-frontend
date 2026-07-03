# identity

Bounded context feature-first para el módulo Django `identity`.

- `api/`: hooks y clientes TanStack Query específicos del dominio.
- Componentes, tipos y utilidades deben vivir junto a la feature que los usa.
- Reutilizables sin dominio pertenecen a `src/shared/`.

## Permisos de presentación

- `api/useMe.ts` consulta `GET /me` mediante el cliente tipado compartido y deja que TanStack Query gestione caché/reintentos.
- `useCan(capability, organizationId)` consume exclusivamente ese bootstrap para decidir si un control se muestra habilitado o con `disabledReason`.
- El hook es una ayuda de presentación: **no autoriza negocio en el cliente**. Cada operación debe invocar su endpoint y aceptar `403`/`409` como decisión autoritativa de la API.
