import { useMemo } from 'react';

import { useMe } from './api/useMe';
import { roleNames } from './roles';
import { useActiveOrganization } from './useActiveOrganization';

export const uiCapabilities = [
  'audit.plan.submit',
  'audit.close.decide',
  'disposition.request',
  'disposition.approve',
  'settings.view',
] as const;

export type UiCapability = (typeof uiCapabilities)[number];

type CapabilityPolicy = {
  roles: string[];
  deniedReason: string;
};

/**
 * Matriz de presentación para habilitar/ocultar controles; no reemplaza la autorización de la API.
 * La fuente autoritativa sigue siendo el backend: cada acción debe enviarse al endpoint correspondiente
 * y tratar errores 403/409 con la razón del envelope.
 */
const capabilityPolicies: Record<UiCapability, CapabilityPolicy> = {
  'audit.plan.submit': {
    roles: ['P1', 'auditor_lider'],
    deniedReason: 'Tu rol en esta organización no puede enviar el plan de auditoría.',
  },
  'audit.close.decide': {
    roles: ['P1', 'auditor_lider'],
    deniedReason: 'Solo P1 puede decidir la rama de cierre de la auditoría.',
  },
  'disposition.request': {
    roles: ['P4', 'document_controller'],
    deniedReason: 'Solo P4 puede solicitar la disposición documental.',
  },
  'disposition.approve': {
    roles: ['P5', 'approver'],
    deniedReason: 'No puedes aprobar esta solicitud con tu membresía actual.',
  },
  'settings.view': {
    roles: ['P6', 'tenant_admin'],
    deniedReason: 'Solo P6 administra la configuración del tenant.',
  },
};

export type UseCanResult = {
  allowed: boolean;
  disabledReason?: string;
  isLoading: boolean;
  source: 'api:/me';
};

export function useCan(capability: UiCapability, organizationId?: string): UseCanResult {
  const me = useMe();
  const { activeOrganizationId } = useActiveOrganization();

  return useMemo(() => {
    const policy = capabilityPolicies[capability];
    const memberships = me.data?.memberships ?? [];
    const activeMemberships = memberships.filter(
      (membership) =>
        ['active', 'activa'].includes(membership.status.toLowerCase()) &&
        membership.organization_id === (organizationId ?? activeOrganizationId),
    );
    const roles = new Set(activeMemberships.flatMap((membership) => roleNames(membership.roles)));
    const allowed = policy.roles.some((role) => roles.has(role));

    return {
      allowed,
      disabledReason: me.isLoading
        ? 'Validando permisos con la API.'
        : allowed
          ? undefined
          : policy.deniedReason,
      isLoading: me.isLoading,
      source: 'api:/me' as const,
    };
  }, [activeOrganizationId, capability, me.data?.memberships, me.isLoading, organizationId]);
}
