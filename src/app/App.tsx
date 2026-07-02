import { BoundedContextList } from '../shared/ui/BoundedContextList';
import { boundedContexts } from './boundedContexts';

export function App() {
  return (
    <main className="app-shell">
      <section className="hero" aria-labelledby="page-title">
        <p className="eyebrow">SGDyPA · SPA</p>
        <h1 id="page-title">Workspace documental y procesos de auditoría</h1>
        <p>
          Scaffold React + TypeScript + Vite organizado feature-first por bounded context, listo
          para consumir la API DRF con TanStack Query.
        </p>
      </section>
      <BoundedContextList contexts={boundedContexts} />
    </main>
  );
}
