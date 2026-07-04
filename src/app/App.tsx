import { BoundedContextList } from '../shared/ui/BoundedContextList';
import { ComponentCatalog } from '../shared/ui/ComponentCatalog';
import { ActiveOrganizationProvider } from '../features/identity/ActiveOrganizationProvider';
import { RequireAuth } from '../features/identity/RequireAuth';
import { useAuth } from '../features/identity/useAuth';
import { useActiveOrganization } from '../features/identity/useActiveOrganization';
import { useCan } from '../features/identity/useCan';
import { AppShell, Button, Tag, WorkspaceHeader, type NavItem } from '../shared/ui/primitives';
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

function Workspace() {
  const { logout, session } = useAuth();
  const { activeOrganizationId, organizationOptions, selectOrganization } = useActiveOrganization();
  const closeDecision = useCan('audit.close.decide');

  return (
    <AppShell
      activeKey="auditorias"
      navItems={navItems}
      organizationOptions={organizationOptions}
      activeOrganizationId={activeOrganizationId}
      sessionLabel={session?.profile?.email ?? 'Sesión OIDC activa'}
      onLogout={logout}
      onOrganizationChange={(event) => selectOrganization(event.currentTarget.value)}
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
            Org:{' '}
            {organizationOptions.find((option) => option.id === activeOrganizationId)?.label ??
              'Cargando'}
          </Tag>,
        ]}
        frozenFields={['Objetivo', 'Alcance', 'Criterios']}
      />

      <section className="hero workspace-summary" aria-labelledby="page-title">
        <p className="eyebrow">SGDyPA · SPA</p>
        <h1 id="page-title">App shell de auditoría</h1>
        <p>
          Sidebar de primer nivel, header de workspace con breadcrumb y selector de organización
          activa preparados para consumir el bootstrap <code>/me</code> como fuente de presentación.
          La autorización final nunca ocurre en el cliente: la API valida cada transición y devuelve
          la razón autoritativa si rechaza la operación.
        </p>
        <div className="permission-demo">
          <Button
            disabled={!closeDecision.allowed || closeDecision.isLoading}
            disabledReason={closeDecision.disabledReason}
          >
            Decidir cierre
          </Button>
          <span>
            Control mostrado por <code>useCan('audit.close.decide')</code> alimentado por{' '}
            <code>{closeDecision.source}</code>; solo afecta presentación.
          </span>
        </div>
      </section>
      <BoundedContextList contexts={boundedContexts} />
      <ComponentCatalog />
    </AppShell>
  );
}

export function App() {
  return (
    <RequireAuth>
      <ActiveOrganizationProvider>
        <Workspace />
      </ActiveOrganizationProvider>
    </RequireAuth>
  );
}
