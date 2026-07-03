import { BoundedContextList } from '../shared/ui/BoundedContextList';
import { ComponentCatalog } from '../shared/ui/ComponentCatalog';
import { RequireAuth } from '../features/identity/RequireAuth';
import { useAuth } from '../features/identity/useAuth';
import { AppShell, Tag, WorkspaceHeader, type NavItem } from '../shared/ui/primitives';
import { boundedContexts } from './boundedContexts';

const navItems: NavItem[] = [
  { key: 'programa', label: 'Programa', href: '#programa', description: 'Portafolio anual' },
  { key: 'auditorias', label: 'Auditorías', href: '#auditorias', description: 'Workspace FSM' },
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
    href: '#configuracion',
    description: 'Políticas del tenant',
  },
];

const organizationOptions = [
  { id: 'org-calidad', label: 'Calidad SGC Norte', meta: 'Tenant activo · rol Auditor líder' },
  { id: 'org-proveedores', label: 'Proveedores MX', meta: 'Tenant miembro · rol Observador' },
  { id: 'org-corporativo', label: 'Corporativo Brisa', meta: 'Tenant admin' },
];

function Workspace() {
  const { logout, session } = useAuth();

  return (
    <AppShell
      activeKey="auditorias"
      navItems={navItems}
      organizationOptions={organizationOptions}
      activeOrganizationId="org-calidad"
      sessionLabel={session?.profile?.email ?? 'Sesión OIDC activa'}
      onLogout={logout}
    >
      <WorkspaceHeader
        breadcrumb={['Auditorías', 'AUD-2026-009', 'Planificada']}
        title="Workspace documental y procesos de auditoría"
        subtitle="Navegación persistente para operar el hero journey con un máximo de 3 niveles: sección, auditoría y estado/hallazgo."
        badges={[
          <Tag tone="info" key="estado">
            Estado: Planificada
          </Tag>,
          <Tag tone="success" key="tipo">
            Auditoría interna
          </Tag>,
          <Tag tone="warning" key="rol">
            Rol: Auditor líder
          </Tag>,
        ]}
        frozenFields={['Objetivo', 'Alcance', 'Criterios']}
      />

      <section className="hero workspace-summary" aria-labelledby="page-title">
        <p className="eyebrow">SGDyPA · SPA</p>
        <h1 id="page-title">App shell de auditoría</h1>
        <p>
          Sidebar de primer nivel, header de workspace con breadcrumb y selector de organización
          activa preparados para consumir el bootstrap <code>/me</code> cuando esté disponible.
        </p>
      </section>
      <BoundedContextList contexts={boundedContexts} />
      <ComponentCatalog />
    </AppShell>
  );
}

export function App() {
  return (
    <RequireAuth>
      <Workspace />
    </RequireAuth>
  );
}
