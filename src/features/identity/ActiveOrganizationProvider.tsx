import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import type { OrganizationOption } from '../../shared/ui/primitives';
import {
  getActiveOrganizationSelection,
  setActiveOrganizationSelection,
  type ActiveOrganizationSelection,
} from './activeOrganization';
import { ActiveOrganizationContext } from './activeOrganizationContext';
import { meQueryKey, useMe } from './api/useMe';
import { roleNames } from './roles';

type MeOrganization = {
  id: string;
  name?: string;
  label?: string;
};

export type ActiveOrganizationContextValue = {
  activeOrganizationId?: string;
  activeRole?: string;
  // Id de la fila activa (organización + rol); alimenta el valor del <select>.
  activeSelectionId?: string;
  isLoading: boolean;
  organizationOptions: OrganizationOption[];
  selectOrganization: (selectionId: string) => void;
};

function toSelection(option: OrganizationOption): ActiveOrganizationSelection {
  return { selectionId: option.id, organizationId: option.organizationId, role: option.role };
}

export function ActiveOrganizationProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const me = useMe();
  const organizationOptions = useMemo(() => buildOrganizationOptions(me.data), [me.data]);
  const [selection, setSelectionState] = useState<ActiveOrganizationSelection | undefined>(() =>
    getActiveOrganizationSelection(),
  );

  const persistSelection = (next: ActiveOrganizationSelection | undefined) => {
    setSelectionState(next);
    setActiveOrganizationSelection(next);
  };

  useEffect(() => {
    if (organizationOptions.length === 0) {
      // Only clear once /me has resolved: an empty list while loading is expected
      // and must not wipe the persisted selection.
      if (me.isSuccess && selection) {
        persistSelection(undefined);
      }
      return;
    }

    // Conserva la fila exacta (organización + rol) si sigue disponible; si el rol
    // ya no existe, cae a otra fila de la misma organización y, en último caso, a la primera.
    const nextOption =
      organizationOptions.find((option) => option.id === selection?.selectionId) ??
      organizationOptions.find((option) => option.organizationId === selection?.organizationId) ??
      organizationOptions[0];

    if (nextOption && nextOption.id !== selection?.selectionId) {
      persistSelection(toSelection(nextOption));
    }
  }, [selection, me.isSuccess, organizationOptions]);

  const value = useMemo<ActiveOrganizationContextValue>(
    () => ({
      activeOrganizationId: selection?.organizationId,
      activeRole: selection?.role,
      activeSelectionId: selection?.selectionId,
      isLoading: me.isLoading,
      organizationOptions,
      selectOrganization: (selectionId) => {
        if (selectionId === selection?.selectionId) return;

        const option = organizationOptions.find((candidate) => candidate.id === selectionId);
        if (!option) return;

        persistSelection(toSelection(option));
        void queryClient.invalidateQueries({
          predicate: (query) => query.queryKey[0] !== meQueryKey[0],
        });
      },
    }),
    [selection, me.isLoading, organizationOptions, queryClient],
  );

  return (
    <ActiveOrganizationContext.Provider value={value}>
      {children}
    </ActiveOrganizationContext.Provider>
  );
}

function buildOrganizationOptions(me: ReturnType<typeof useMe>['data']): OrganizationOption[] {
  const options: OrganizationOption[] = [];
  const seenRows = new Set<string>();
  const membershipOrganizationIds = new Set<string>();

  const pushRow = (row: OrganizationOption) => {
    if (seenRows.has(row.id)) return;
    seenRows.add(row.id);
    options.push(row);
  };

  me?.memberships.forEach((membership) => {
    // El backend puede exponer el id de la organización de forma anidada
    // (`organization.id`) o plana (`organization_id`). Sin un id no se puede
    // seleccionar ni usar como key, así que descartamos la membresía.
    const organizationId = membership.organization?.id ?? membership.organization_id;
    if (!organizationId) return;

    membershipOrganizationIds.add(organizationId);
    const label = membership.organization?.name ?? membership.organization_name ?? organizationId;
    const roles = roleNames(membership.roles);

    // Una línea por organización y rol. Sin roles, se cae al estado de la membresía.
    if (roles.length === 0) {
      pushRow({ id: `${organizationId}::${membership.status}`, organizationId, label });
      return;
    }

    roles.forEach((role) => {
      pushRow({
        id: `${organizationId}::${role}`,
        organizationId,
        role,
        label,
        meta: `Rol: ${role}`,
      });
    });
  });

  const explicitOrganizations = (me?.orgs ?? me?.organizations ?? []) as MeOrganization[];
  explicitOrganizations.forEach((organization) => {
    // Solo agregamos organizaciones sin membresía (la membresía ya aporta los roles).
    if (!organization.id || membershipOrganizationIds.has(organization.id)) return;

    pushRow({
      id: `${organization.id}::org`,
      organizationId: organization.id,
      label: organization.name ?? organization.label ?? organization.id,
    });
  });

  return options;
}
