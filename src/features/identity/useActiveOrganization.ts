import { useContext } from 'react';

import { ActiveOrganizationContext } from './activeOrganizationContext';

export function useActiveOrganization() {
  const context = useContext(ActiveOrganizationContext);

  if (context === undefined) {
    throw new Error('useActiveOrganization debe usarse dentro de ActiveOrganizationProvider.');
  }

  return context;
}
