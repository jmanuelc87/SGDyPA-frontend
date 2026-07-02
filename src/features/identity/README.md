# identity

Bounded context feature-first para el módulo Django `identity`.

- `api/`: hooks y clientes TanStack Query específicos del dominio.
- Componentes, tipos y utilidades deben vivir junto a la feature que los usa.
- Reutilizables sin dominio pertenecen a `src/shared/`.
