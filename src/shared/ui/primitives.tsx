import {
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  useEffect,
  useId,
  useRef,
} from 'react';

export type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export type ProcessState = {
  id: string;
  label: string;
  description?: string;
  status: 'completed' | 'current' | 'pending' | 'blocked';
};

export type NavItem = {
  key: string;
  label: string;
  href: string;
  description?: string;
};

export type OrganizationOption = {
  id: string;
  label: string;
  meta?: string;
};

export function OrganizationSelector({
  activeOrganizationId,
  className = '',
  options,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  activeOrganizationId: string;
  options: OrganizationOption[];
}) {
  return (
    <label className={`org-selector ${className}`.trim()}>
      <span>Organización activa</span>
      <select
        aria-label="Seleccionar organización activa"
        value={activeOrganizationId}
        onChange={props.onChange ?? (() => undefined)}
        {...props}
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
            {option.meta ? ` — ${option.meta}` : ''}
          </option>
        ))}
      </select>
    </label>
  );
}

export function AppShell({
  activeKey,
  activeOrganizationId,
  children,
  navItems,
  onLogout,
  organizationOptions,
  sessionLabel,
}: {
  activeKey: string;
  activeOrganizationId: string;
  children: ReactNode;
  navItems: NavItem[];
  onLogout?: () => void;
  organizationOptions: OrganizationOption[];
  sessionLabel?: string;
}) {
  return (
    <div className="workspace-shell">
      <aside className="global-sidebar" aria-label="Navegación principal">
        <a className="skip-link" href="#workspace-content">
          Saltar al contenido
        </a>
        <div className="global-sidebar__brand">
          <strong>SGDyPA</strong>
          <span>Gestión documental y auditoría</span>
        </div>
        <OrganizationSelector
          activeOrganizationId={activeOrganizationId}
          options={organizationOptions}
        />
        <nav aria-label="Secciones de primer nivel">
          {navItems.map((item) => (
            <a
              aria-current={item.key === activeKey ? 'page' : undefined}
              className="global-sidebar__link"
              href={item.href}
              key={item.key}
            >
              <strong>{item.label}</strong>
              {item.description ? <span>{item.description}</span> : null}
            </a>
          ))}
        </nav>
        <div className="global-sidebar__session">
          <span>{sessionLabel ?? 'Sesión activa'}</span>
          {onLogout ? (
            <Button type="button" variant="ghost" size="sm" onClick={onLogout}>
              Cerrar sesión
            </Button>
          ) : null}
        </div>
      </aside>
      <main className="app-shell" id="workspace-content">
        {children}
      </main>
    </div>
  );
}

export function WorkspaceHeader({
  badges = [],
  breadcrumb,
  frozenFields = [],
  subtitle,
  title,
}: {
  badges?: ReactNode[];
  breadcrumb: string[];
  frozenFields?: string[];
  subtitle?: string;
  title: string;
}) {
  const visibleTrail = breadcrumb.slice(0, 3);

  return (
    <header className="workspace-header" aria-labelledby="workspace-title">
      <nav aria-label="Ruta del workspace" className="workspace-header__breadcrumb">
        <ol>
          {visibleTrail.map((crumb, index) => (
            <li
              key={`${crumb}-${index}`}
              aria-current={index === visibleTrail.length - 1 ? 'page' : undefined}
            >
              {crumb}
            </li>
          ))}
        </ol>
      </nav>
      <div className="workspace-header__title-row">
        <div>
          <p className="eyebrow">Workspace</p>
          <h2 id="workspace-title">{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        <Tag
          tone={frozenFields.length > 0 ? 'warning' : 'success'}
          icon={frozenFields.length > 0 ? '🔒' : '✓'}
        >
          {frozenFields.length > 0
            ? `${frozenFields.length} campos congelados`
            : 'Sin campos congelados'}
        </Tag>
      </div>
      <div className="workspace-header__meta">
        <div className="workspace-header__badges" aria-label="Badges del workspace">
          {badges}
        </div>
        {frozenFields.length > 0 ? (
          <p className="workspace-header__frozen">
            Congelados: {frozenFields.join(', ')}. Los cambios se realizan por la ruta legítima de
            cambio de alcance.
          </p>
        ) : null}
      </div>
    </header>
  );
}

const stateStatusLabel: Record<ProcessState['status'], string> = {
  blocked: 'Bloqueado',
  completed: 'Completado',
  current: 'Estado actual',
  pending: 'Pendiente',
};

const stateStatusSymbol: Record<ProcessState['status'], string> = {
  blocked: '!',
  completed: '✓',
  current: '●',
  pending: '○',
};

type Size = 'sm' | 'md';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: Size;
  loading?: boolean;
  disabledReason?: string;
};

export function Button({
  children,
  className = '',
  disabled,
  disabledReason,
  loading = false,
  size = 'md',
  variant = 'primary',
  ...props
}: ButtonProps) {
  const reasonId = useId();
  const isDisabled = disabled || loading;

  return (
    <span className="button-wrap">
      <button
        className={`sgd-button sgd-button--${variant} sgd-button--${size} ${className}`.trim()}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        aria-describedby={disabledReason ? reasonId : undefined}
        {...props}
      >
        {loading ? <span aria-hidden="true">⏳</span> : null}
        {children}
      </button>
      {disabledReason ? (
        <span className="disabled-reason" id={reasonId}>
          {disabledReason}
        </span>
      ) : null}
    </span>
  );
}

export type TagProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: Tone;
  icon?: ReactNode;
};

const toneSymbol: Record<Tone, string> = {
  neutral: '•',
  info: 'i',
  success: '✓',
  warning: '!',
  danger: '×',
};

export function Tag({ children, className = '', icon, tone = 'neutral', ...props }: TagProps) {
  return (
    <span className={`tag tag--${tone} ${className}`.trim()} {...props}>
      <span className="tag__icon" aria-hidden="true">
        {icon ?? toneSymbol[tone]}
      </span>
      <span>{children}</span>
    </span>
  );
}

export type Metric = {
  label: string;
  value: string | number;
  unit?: string;
  tone?: Tone;
};

export function MetricStrip({ metrics }: { metrics: Metric[] }) {
  return (
    <dl className="metric-strip" aria-label="Métricas resumidas">
      {metrics.map((metric) => (
        <div className={`metric metric--${metric.tone ?? 'neutral'}`} key={metric.label}>
          <dt>{metric.label}</dt>
          <dd>
            <strong>{metric.value}</strong>
            {metric.unit ? <span>{metric.unit}</span> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export type FilterChip = {
  id: string;
  label: string;
  value: string;
};

export function FilterBar({
  filters,
  persistKey,
  onClear,
  onRemove,
}: {
  filters: FilterChip[];
  persistKey?: string;
  onClear?: () => void;
  onRemove?: (id: string) => void;
}) {
  return (
    <section className="filter-bar" aria-label="Filtros activos" data-persist-key={persistKey}>
      <span className="filter-bar__label">Filtros</span>
      <div className="filter-bar__chips">
        {filters.length === 0 ? <span className="muted">Sin filtros activos</span> : null}
        {filters.map((filter) => (
          <button className="filter-chip" key={filter.id} onClick={() => onRemove?.(filter.id)}>
            <span>{filter.label}:</span> {filter.value} <span aria-hidden="true">×</span>
          </button>
        ))}
      </div>
      <Button variant="ghost" size="sm" onClick={onClear} disabled={filters.length === 0}>
        Limpiar
      </Button>
    </section>
  );
}

export type TableColumn<T> = {
  key: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode;
};

export function ProcessStateRail({
  ariaLabel = 'Estado del proceso',
  states,
}: {
  states: ProcessState[];
  ariaLabel?: string;
}) {
  return (
    <nav aria-label={ariaLabel} className="state-rail">
      <ol>
        {states.map((state, index) => (
          <li
            aria-current={state.status === 'current' ? 'step' : undefined}
            className={`state-rail__item state-rail__item--${state.status}`}
            key={state.id}
          >
            <span className="state-rail__marker" aria-hidden="true">
              {stateStatusSymbol[state.status]}
            </span>
            <span className="state-rail__body">
              <span className="state-rail__position">
                Paso {index + 1} de {states.length}
              </span>
              <strong>{state.label}</strong>
              <span>{stateStatusLabel[state.status]}</span>
              {state.description ? <small>{state.description}</small> : null}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function DecisionGate({
  actions,
  children,
  title,
}: {
  title: string;
  children: ReactNode;
  actions: ReactNode;
}) {
  const reviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    reviewRef.current?.focus();
  }, []);

  return (
    <section className="decision-gate" aria-labelledby="decision-gate-title">
      <div
        className="decision-gate__review"
        ref={reviewRef}
        tabIndex={-1}
        aria-describedby="decision-gate-order"
      >
        <p className="eyebrow" id="decision-gate-order">
          Foco inicial: validación factual antes de decidir
        </p>
        <h3 id="decision-gate-title">{title}</h3>
        {children}
      </div>
      <div className="decision-gate__actions" aria-label="Acciones de decisión">
        {actions}
      </div>
    </section>
  );
}

export function Table<T extends { id: string }>({
  columns,
  emptyMessage = 'No hay registros para mostrar.',
  rows,
}: {
  columns: TableColumn<T>[];
  rows: T[];
  emptyMessage?: string;
}) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={String(column.key)} scope="col">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>{emptyMessage}</td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id}>
                {columns.map((column) => (
                  <td key={String(column.key)}>
                    {column.render ? column.render(row) : String(row[column.key as keyof T] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function useFocusTrap(active: boolean) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !ref.current) return;
    const container = ref.current;
    const focusable = Array.from(
      container.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      ),
    );
    const first = focusable[0];
    const last = focusable.at(-1);
    first?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Tab' || !first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    container.addEventListener('keydown', onKeyDown);
    return () => container.removeEventListener('keydown', onKeyDown);
  }, [active]);

  return ref;
}

export function Drawer({
  children,
  onClose,
  open,
  title,
}: {
  children: ReactNode;
  open: boolean;
  onClose: () => void;
  title: string;
}) {
  const ref = useFocusTrap(open);
  if (!open) return null;

  return (
    <div className="overlay" role="presentation">
      <aside
        aria-modal="true"
        className="drawer"
        ref={ref}
        role="dialog"
        aria-labelledby="drawer-title"
      >
        <header>
          <h2 id="drawer-title">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </header>
        {children}
      </aside>
    </div>
  );
}

export function Modal({
  children,
  destructive = false,
  onClose,
  open,
  title,
}: {
  children: ReactNode;
  destructive?: boolean;
  open: boolean;
  onClose: () => void;
  title: string;
}) {
  const ref = useFocusTrap(open);
  if (!open) return null;

  return (
    <div className="overlay overlay--center" role="presentation">
      <section
        aria-modal="true"
        className={`modal ${destructive ? 'modal--destructive' : ''}`}
        ref={ref}
        role="dialog"
        aria-labelledby="modal-title"
      >
        <h2 id="modal-title">{title}</h2>
        {children}
        <footer>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant={destructive ? 'destructive' : 'primary'}>Confirmar</Button>
        </footer>
      </section>
    </div>
  );
}

export function Timeline({
  items,
}: {
  items: { id: string; title: string; meta: string; tone?: Tone }[];
}) {
  return (
    <ol className="timeline">
      {items.map((item) => (
        <li className={`timeline__item timeline__item--${item.tone ?? 'neutral'}`} key={item.id}>
          <strong>{item.title}</strong>
          <span>{item.meta}</span>
        </li>
      ))}
    </ol>
  );
}

export function EmptyState({
  action,
  body,
  icon = '∅',
  title,
}: {
  action?: ReactNode;
  body: string;
  icon?: ReactNode;
  title: string;
}) {
  return (
    <section className="empty-state">
      <div aria-hidden="true" className="empty-state__icon">
        {icon}
      </div>
      <h2>{title}</h2>
      <p>{body}</p>
      {action}
    </section>
  );
}
