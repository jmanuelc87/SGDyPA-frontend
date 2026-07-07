import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router';

import { useActiveOrganization } from '../features/identity/useActiveOrganization';
import { useAuth } from '../features/identity/useAuth';
import { AppShell, type NavItem } from '../shared/ui/primitives';

// Solo `auditorias` y `configuracion` tienen ruta propia; el resto de las
// entradas quedan como anclas presentacionales hasta que se construya su pantalla.
const routePathByKey: Record<string, string> = {
  auditorias: '/auditorias',
  configuracion: '/configuracion',
};

const navItems: NavItem[] = [
  { key: 'programa', label: 'Programa', href: '#programa', description: 'Portafolio anual' },
  {
    key: 'auditorias',
    label: 'Auditorías',
    href: '#/auditorias',
    description: 'Workspace FSM',
  },
  {
    key: 'seguimiento',
    label: 'Seguimiento',
    href: '#seguimiento',
    description: 'CAPA cross-auditoría',
  },
  {
    key: 'documentos',
    label: 'Documentos',
    href: '#documentos',
    description: 'Versiones y disposición',
  },
  { key: 'bitacora', label: 'Bitácora', href: '#bitacora', description: 'Registro inmutable' },
  {
    key: 'configuracion',
    label: 'Configuración',
    href: '#/configuracion',
    description: 'Políticas del tenant',
  },
];

export function RootLayout() {
  const { logout, session } = useAuth();
  const { activeSelectionId, organizationOptions, selectOrganization } = useActiveOrganization();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  const activeKey = Object.entries(routePathByKey).find(([, path]) => path === pathname)?.[0] ?? '';

  return (
    <AppShell
      activeKey={activeKey}
      navItems={navItems}
      organizationOptions={organizationOptions}
      activeSelectionId={activeSelectionId}
      sessionLabel={session?.profile?.email ?? 'Sesión OIDC activa'}
      onLogout={logout}
      onOrganizationChange={(event) => selectOrganization(event.currentTarget.value)}
      onNavigate={(item, event) => {
        const to = routePathByKey[item.key];
        if (!to) return;
        event.preventDefault();
        void navigate({ to });
      }}
    >
      <Outlet />
    </AppShell>
  );
}
