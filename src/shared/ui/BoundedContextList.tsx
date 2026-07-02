import type { BoundedContext } from '../types/boundedContext';

interface BoundedContextListProps {
  contexts: BoundedContext[];
}

export function BoundedContextList({ contexts }: BoundedContextListProps) {
  return (
    <section aria-labelledby="contexts-title" className="contexts-card">
      <h2 id="contexts-title">Bounded contexts</h2>
      <p>La estructura de carpetas espeja los módulos Django y evita organizar por tipo técnico.</p>
      <ul className="contexts-grid">
        {contexts.map((context) => (
          <li key={context.key}>
            <code>{context.key}</code>
            <strong>{context.label}</strong>
            <span>{context.description}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
