import { Tag } from '../../shared/ui/primitives';

const roles = [
  { key: 'p1', label: 'P1', name: 'Auditor líder' },
  { key: 'p2', label: 'P2', name: 'Auditor equipo' },
  { key: 'p3', label: 'P3', name: 'Auditado' },
  { key: 'p4', label: 'P4', name: 'Gestor documental' },
  { key: 'p5', label: 'P5', name: 'Calidad / sponsor' },
  { key: 'p6', label: 'P6', name: 'Admin tenant' },
  { key: 'p7', label: 'P7', name: 'Auditor externo' },
] as const;

type RoleKey = (typeof roles)[number]['key'];

type Capability = {
  id: string;
  area: string;
  capability: string;
  note: string;
  roles: Partial<Record<RoleKey, 'full' | 'read'>>;
};

const capabilities: Capability[] = [
  {
    id: 'program-plan',
    area: 'Programa',
    capability: 'Comisionar y mantener el programa de auditoría',
    note: 'P5 gobierna el portafolio; P1 recibe el cascarón para planificar.',
    roles: { p1: 'read', p5: 'full' },
  },
  {
    id: 'audit-plan',
    area: 'Auditoría',
    capability: 'Definir objetivo, alcance, criterios y plan de trabajo',
    note: 'Campos congelados al aprobar el plan.',
    roles: { p1: 'full', p2: 'read', p5: 'read' },
  },
  {
    id: 'finding-capture',
    area: 'Hallazgos',
    capability: 'Capturar hallazgos y citar evidencia',
    note: 'P2 captura en campo; P1 puede refinar la cita.',
    roles: { p1: 'full', p2: 'full', p3: 'read', p5: 'read', p7: 'read' },
  },
  {
    id: 'closing-gate',
    area: 'Auditoría',
    capability: 'Validar hechos y decidir la rama de cierre',
    note: 'P3 valida u objeta hechos; solo P1 decide la rama.',
    roles: { p1: 'full', p3: 'full', p5: 'read' },
  },
  {
    id: 'capa',
    area: 'Seguimiento',
    capability: 'Registrar CAPA y verificar eficacia',
    note: 'P3 remedia; P1/P5 verifican sin firmar su propia remediación.',
    roles: { p1: 'full', p3: 'full', p5: 'full', p7: 'read' },
  },
  {
    id: 'documents',
    area: 'Documentos',
    capability: 'Gestionar documentos, versiones, firma y disposición',
    note: 'P4 opera el ciclo documental; aprobaciones según política.',
    roles: { p1: 'read', p4: 'full', p5: 'full', p7: 'read' },
  },
  {
    id: 'trail',
    area: 'Bitácora',
    capability: 'Consultar registro inmutable y anclaje NOM-151',
    note: 'Lectura reconstruible para demostrar integridad dentro del alcance.',
    roles: { p1: 'read', p2: 'read', p3: 'read', p4: 'read', p5: 'read', p6: 'read', p7: 'read' },
  },
  {
    id: 'tenant-policy',
    area: 'Configuración',
    capability: 'Administrar roles, retención y tipos documentales',
    note: 'Configuración periférica y de baja frecuencia del tenant.',
    roles: { p6: 'full' },
  },
];

function CapabilityCell({ value }: { value?: 'full' | 'read' }) {
  const label = value === 'full' ? 'Editar' : value === 'read' ? 'Leer' : 'Sin acceso';
  return (
    <span className={`capability-mark capability-mark--${value ?? 'none'}`} aria-label={label}>
      {value === 'full' ? '●' : value === 'read' ? '◐' : '—'}
    </span>
  );
}

export function ConfigurationScreen() {
  return (
    <section className="config-card" id="configuracion" aria-labelledby="config-title">
      <div className="config-card__heading">
        <div>
          <p className="eyebrow">Pantalla 12A · Configuración</p>
          <h2 id="config-title">Roles y permisos</h2>
          <p>
            Matriz read-only de capacidades por rol P1–P7. Es una vista de referencia para P6; los
            permisos efectivos siguen viniendo de la API y no se editan desde esta tabla.
          </p>
        </div>
        <Tag tone="info" icon="🔒">
          Solo lectura
        </Tag>
      </div>

      <nav className="config-subnav" aria-label="Sub-navegación de Configuración">
        <a aria-current="page" href="#configuracion">
          Roles
        </a>
        <a href="#clases-retencion">Clases de retención</a>
        <a href="#tipos-documentales">Tipos documentales</a>
      </nav>

      <div className="config-legend" aria-label="Leyenda de permisos">
        <span>
          <CapabilityCell value="full" /> Editar / operar
        </span>
        <span>
          <CapabilityCell value="read" /> Leer
        </span>
        <span>
          <CapabilityCell /> Sin acceso
        </span>
      </div>

      <div className="capability-table-wrap">
        <table className="capability-table" aria-describedby="roles-note">
          <thead>
            <tr>
              <th scope="col">Capacidad</th>
              {roles.map((role) => (
                <th scope="col" key={role.key}>
                  <span>{role.label}</span>
                  <small>{role.name}</small>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {capabilities.map((capability) => (
              <tr key={capability.id}>
                <th scope="row">
                  <span>{capability.area}</span>
                  <strong>{capability.capability}</strong>
                  <small>{capability.note}</small>
                </th>
                {roles.map((role) => (
                  <td key={role.key}>
                    <CapabilityCell value={capability.roles[role.key]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="config-note" id="roles-note">
        P7 conserva solo lectura dentro del alcance de su invitación; lo que queda fuera de alcance
        no aparece en su navegación. P6 administra políticas del tenant, pero no opera el ciclo de
        auditoría/documentos desde esta matriz.
      </p>
    </section>
  );
}
