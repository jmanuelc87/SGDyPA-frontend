import type { components } from '../../shared/api/openapi';

export type MembershipRole = components['schemas']['Membership']['roles'][number];

/**
 * El backend puede devolver los roles como cadenas simples o como objetos
 * (por ejemplo `{ name }`, `{ code }`, `{ role }`). Esta función normaliza cualquiera
 * de esas formas a su nombre legible para evitar renders como `[object Object]`.
 */
export function roleName(role: MembershipRole): string {
  if (typeof role === 'string') {
    return role;
  }
  if (role && typeof role === 'object') {
    const record = role as Record<string, unknown>;
    for (const key of ['name', 'role', 'code', 'label', 'id']) {
      const value = record[key];
      if (typeof value === 'string' && value.length > 0) {
        return value;
      }
    }
  }
  return String(role);
}

export function roleNames(roles: readonly MembershipRole[]): string[] {
  return roles.map(roleName);
}
