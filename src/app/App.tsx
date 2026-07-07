import { ActiveOrganizationProvider } from '../features/identity/ActiveOrganizationProvider';
import { RequireAuth } from '../features/identity/RequireAuth';
import { useAuth } from '../features/identity/useAuth';
import { useActiveOrganization } from '../features/identity/useActiveOrganization';
import {
  AppShell,
  WorkspaceHeader,
  type NavItem,
  type ProcessState,
} from '../shared/ui/primitives';

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

// Estados del proceso de auditoría (FSM) representados en el riel superior (Variante B).
// La presentación marca el estado actual; la API es la que autoriza cada transición.
const auditStates: ProcessState[] = [
  { id: 'planificada', label: 'Planificada', status: 'completed' },
  { id: 'en-ejecucion', label: 'EnEjecución', status: 'current' },
  { id: 'en-cierre', label: 'EnCierre', description: '3 ramas', status: 'pending' },
  { id: 'informe-emitido', label: 'InformeEmitido', status: 'pending' },
  { id: 'en-seguimiento', label: 'EnSeguimiento', status: 'pending' },
  { id: 'cerrada', label: 'Cerrada', status: 'pending' },
];

function Workspace() {
  const { logout, session } = useAuth();
  const { activeSelectionId, organizationOptions, selectOrganization } = useActiveOrganization();

  return (
    <AppShell
      activeKey="auditorias"
      navItems={navItems}
      organizationOptions={organizationOptions}
      activeSelectionId={activeSelectionId}
      sessionLabel={session?.profile?.email ?? 'Sesión OIDC activa'}
      onLogout={logout}
      onOrganizationChange={(event) => selectOrganization(event.currentTarget.value)}
    >
      <WorkspaceHeader
        breadcrumb={['Auditorías', 'AUD-2026-014']}
        title="Auditoría interna SGC — Línea de producción 3"
        auditType="Interna"
        program="Programa 2026 · ISO 9001"
        frozenFields={['Objetivo', 'Alcance', 'Criterios']}
        subState="Plan: aprobado"
        states={auditStates}
        transition={{ label: '→ Pasar a cierre', hint: 'evidencia contrastada' }}
        exceptions={['Postergar', 'Cancelar']}
      />
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
