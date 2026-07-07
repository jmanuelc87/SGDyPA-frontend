import {
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router';

import { AuditsScreen } from '../features/audit-process/AuditsScreen';
import { ConfigurationScreen } from '../features/configuration/ConfigurationScreen';
import { RootLayout } from './RootLayout';

const rootRoute = createRootRoute({ component: RootLayout });

// La raíz redirige a Auditorías, que es la pantalla de trabajo por defecto.
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/auditorias' });
  },
});

const auditoriasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auditorias',
  component: AuditsScreen,
});

const configuracionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/configuracion',
  component: ConfigurationScreen,
});

const routeTree = rootRoute.addChildren([indexRoute, auditoriasRoute, configuracionRoute]);

export const router = createRouter({
  routeTree,
  history: createHashHistory(),
  defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
