import type { BoundedContext } from '../shared/types/boundedContext';

export const boundedContexts: BoundedContext[] = [
  {
    key: 'program',
    label: 'Programa',
    description: 'Planeación y seguimiento del programa de auditoría.',
  },
  {
    key: 'audit-process',
    label: 'Proceso de auditoría',
    description: 'FSM, gates y transiciones gobernadas por la API.',
  },
  {
    key: 'findings',
    label: 'Hallazgos',
    description: 'Registro de hallazgos y evidencia asociada.',
  },
  { key: 'capa', label: 'CAPA', description: 'Acciones correctivas y preventivas.' },
  {
    key: 'disposition',
    label: 'Disposición',
    description: 'Solicitudes y aprobación de disposición documental.',
  },
  {
    key: 'documents',
    label: 'Documentos',
    description: 'Versiones, evidencia y metadatos documentales.',
  },
  { key: 'trail', label: 'Bitácora', description: 'Lectura del trail y pruebas de integridad.' },
  {
    key: 'rag',
    label: 'Asistente RAG',
    description: 'Consultas con citas a evidencia autorizada.',
  },
  {
    key: 'identity',
    label: 'Identidad',
    description: 'Selección de organización activa y contexto OIDC.',
  },
];
