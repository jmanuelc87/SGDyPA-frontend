import { WorkspaceHeader, type ProcessState } from '../../shared/ui/primitives';

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

export function AuditsScreen() {
  return (
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
  );
}
