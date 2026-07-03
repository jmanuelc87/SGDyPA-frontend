import { BoundedContextList } from '../shared/ui/BoundedContextList';
import { ComponentCatalog } from '../shared/ui/ComponentCatalog';
import { RequireAuth } from '../features/identity/RequireAuth';
import { useAuth } from '../features/identity/useAuth';
import { boundedContexts } from './boundedContexts';

function Workspace() {
  const { logout, session } = useAuth();

  return (
    <main className="app-shell">
      <section className="hero" aria-labelledby="page-title">
        <div className="session-bar">
          <span>
            Sesión OIDC activa{session?.profile?.email ? ` · ${session.profile.email}` : ''}
          </span>
          <button type="button" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
        <p className="eyebrow">SGDyPA · SPA</p>
        <h1 id="page-title">Workspace documental y procesos de auditoría</h1>
        <p>
          Scaffold React + TypeScript + Vite organizado feature-first por bounded context, listo
          para consumir la API DRF con TanStack Query.
        </p>
      </section>
      <BoundedContextList contexts={boundedContexts} />
      <ComponentCatalog />
    </main>
  );
}

export function App() {
  return (
    <RequireAuth>
      <Workspace />
    </RequireAuth>
  );
}
