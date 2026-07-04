import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import type { OrganizationOption } from '../../shared/ui/primitives';
import { getActiveOrganizationId, setActiveOrganizationId } from './activeOrganization';
import { ActiveOrganizationContext } from './activeOrganizationContext';
import { meQueryKey, useMe } from './api/useMe';

type MeOrganization = {
  id: string;
  name?: string;
  label?: string;
};

export type ActiveOrganizationContextValue = {
  activeOrganizationId?: string;
  isLoading: boolean;
  organizationOptions: OrganizationOption[];
  selectOrganization: (organizationId: string) => void;
};

export function ActiveOrganizationProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const me = useMe();
  const organizationOptions = useMemo(() => buildOrganizationOptions(me.data), [me.data]);
  const [activeOrganizationId, setActiveOrganizationIdState] = useState<string | undefined>(() =>
    getActiveOrganizationId(),
  );

  useEffect(() => {
    if (organizationOptions.length === 0) {
      // Only clear once /me has resolved: an empty list while loading is expected
      // and must not wipe the persisted selection.
      if (me.isSuccess && activeOrganizationId) {
        setActiveOrganizationIdState(undefined);
        setActiveOrganizationId(undefined);
      }
      return;
    }

    const storedIsAvailable = organizationOptions.some(
      (option) => option.id === activeOrganizationId,
    );
    const nextOrganizationId = storedIsAvailable
      ? activeOrganizationId
      : organizationOptions[0]?.id;

    if (nextOrganizationId && nextOrganizationId !== activeOrganizationId) {
      setActiveOrganizationIdState(nextOrganizationId);
      setActiveOrganizationId(nextOrganizationId);
    }
  }, [activeOrganizationId, me.isSuccess, organizationOptions]);

  const value = useMemo<ActiveOrganizationContextValue>(
    () => ({
      activeOrganizationId,
      isLoading: me.isLoading,
      organizationOptions,
      selectOrganization: (organizationId) => {
        if (organizationId === activeOrganizationId) return;

        setActiveOrganizationIdState(organizationId);
        setActiveOrganizationId(organizationId);
        void queryClient.invalidateQueries({
          predicate: (query) => query.queryKey[0] !== meQueryKey[0],
        });
      },
    }),
    [activeOrganizationId, me.isLoading, organizationOptions, queryClient],
  );

  return (
    <ActiveOrganizationContext.Provider value={value}>
      {children}
    </ActiveOrganizationContext.Provider>
  );
}

function buildOrganizationOptions(me: ReturnType<typeof useMe>['data']): OrganizationOption[] {
  const organizations = new Map<string, OrganizationOption>();
  const explicitOrganizations = (me?.orgs ?? me?.organizations ?? []) as MeOrganization[];

  explicitOrganizations.forEach((organization) => {
    organizations.set(organization.id, {
      id: organization.id,
      label: organization.name ?? organization.label ?? organization.id,
    });
  });

  me?.memberships.forEach((membership) => {
    const roles = membership.roles.join(', ');
    const label =
      membership.organization?.name ?? membership.organization_name ?? membership.organization_id;
    organizations.set(membership.organization_id, {
      id: membership.organization_id,
      label,
      meta: roles ? `Rol(es): ${roles}` : membership.status,
    });
  });

  return [...organizations.values()];
}
