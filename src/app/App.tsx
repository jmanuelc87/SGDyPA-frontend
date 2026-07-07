import { RouterProvider } from '@tanstack/react-router';

import { ActiveOrganizationProvider } from '../features/identity/ActiveOrganizationProvider';
import { RequireAuth } from '../features/identity/RequireAuth';
import { router } from './router';

export function App() {
  return (
    <RequireAuth>
      <ActiveOrganizationProvider>
        <RouterProvider router={router} />
      </ActiveOrganizationProvider>
    </RequireAuth>
  );
}
