import {
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  useEffect,
  useId,
  useRef,
} from 'react';

export type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

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
