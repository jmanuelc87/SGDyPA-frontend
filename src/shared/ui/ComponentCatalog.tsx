import { useState } from 'react';
import {
  Button,
  Drawer,
  EmptyState,
  FilterBar,
  MetricStrip,
  Modal,
  Table,
  Tag,
  Timeline,
  type TableColumn,
} from './primitives';

type AuditRow = { id: string; auditoria: string; estado: string; riesgo: string };

const rows: AuditRow[] = [
  { id: 'aud-1', auditoria: 'Retención documental 2026', estado: 'Planificada', riesgo: 'Medio' },
  { id: 'aud-2', auditoria: 'CAPA hallazgo mayor', estado: 'En seguimiento', riesgo: 'Alto' },
];

const columns: TableColumn<AuditRow>[] = [
  { key: 'auditoria', header: 'Auditoría' },
  { key: 'estado', header: 'Estado', render: (row) => <Tag tone="info">{row.estado}</Tag> },
  {
    key: 'riesgo',
    header: 'Riesgo',
    render: (row) => <Tag tone={row.riesgo === 'Alto' ? 'danger' : 'warning'}>{row.riesgo}</Tag>,
  },
];

export function ComponentCatalog() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section className="catalog" aria-labelledby="catalog-title">
      <div className="catalog__header">
        <p className="eyebrow">Librería sin dominio</p>
        <h2 id="catalog-title">Catálogo navegable de primitivos base</h2>
        <p>
          Estados visuales con texto e icono, props tipadas y patrones responsive reutilizables.
        </p>
      </div>

      <article className="catalog-card">
        <h3>Button y Tag</h3>
        <div className="inline-demo">
          <Button>Primario</Button>
          <Button variant="secondary">Secundario</Button>
          <Button variant="destructive">Destructivo</Button>
          <Button disabled disabledReason="Requiere aprobación de P2">
            Deshabilitado
          </Button>
          <Tag tone="success">Aprobado</Tag>
          <Tag tone="warning">Pendiente</Tag>
          <Tag tone="danger">Bloqueado</Tag>
        </div>
      </article>

      <article className="catalog-card">
        <h3>MetricStrip</h3>
        <MetricStrip
          metrics={[
            { label: 'Hallazgos', value: 12, tone: 'info' },
            { label: 'CAPA vencidas', value: 3, unit: 'casos', tone: 'danger' },
            { label: 'Evidencia', value: 87, unit: '%', tone: 'success' },
          ]}
        />
      </article>

      <article className="catalog-card">
        <h3>FilterBar persistible</h3>
        <FilterBar
          persistKey="catalog.audit.filters"
          filters={[
            { id: 'estado', label: 'Estado', value: 'En seguimiento' },
            { id: 'riesgo', label: 'Riesgo', value: 'Alto' },
          ]}
        />
      </article>

      <article className="catalog-card">
        <h3>Table</h3>
        <Table columns={columns} rows={rows} />
      </article>

      <article className="catalog-card split-demo">
        <div>
          <h3>Drawer y Modal</h3>
          <p>
            Ambos activan focus-trap mientras están abiertos. El modal destructivo usa borde rojo y
            acciones explícitas.
          </p>
          <div className="inline-demo">
            <Button onClick={() => setDrawerOpen(true)}>Abrir drawer</Button>
            <Button variant="destructive" onClick={() => setModalOpen(true)}>
              Abrir modal destructivo
            </Button>
          </div>
        </div>
        <EmptyState
          title="Sin evidencias seleccionadas"
          body="Carga archivos o aplica filtros para comenzar la revisión."
          action={<Button variant="secondary">Agregar evidencia</Button>}
        />
      </article>

      <article className="catalog-card">
        <h3>Timeline</h3>
        <Timeline
          items={[
            { id: '1', title: 'Plan aprobado', meta: 'P2 · hace 2 horas', tone: 'success' },
            {
              id: '2',
              title: 'Hallazgo mayor registrado',
              meta: 'Auditor líder · ayer',
              tone: 'warning',
            },
            { id: '3', title: 'CAPA vencida', meta: 'Sistema · 2026-07-01', tone: 'danger' },
          ]}
        />
      </article>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Detalle lateral">
        <p>Panel lateral para lectura y edición contextual sin perder la pantalla actual.</p>
        <Button>Acción principal</Button>
      </Drawer>
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Confirmar acción irreversible"
        destructive
      >
        <p>
          Esta acción queda registrada en la bitácora y no puede revertirse sin una nueva entrada
          compensatoria.
        </p>
      </Modal>
    </section>
  );
}
