import { createContext } from 'react';

import type { ActiveOrganizationContextValue } from './ActiveOrganizationProvider';

export const ActiveOrganizationContext = createContext<ActiveOrganizationContextValue | undefined>(
  undefined,
);
