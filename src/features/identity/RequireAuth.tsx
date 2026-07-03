import type { ReactNode } from 'react';

import { Button } from '../../shared/ui/primitives';
import { useAuth } from './useAuth';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { error, login, status } = useAuth();

  if (status === 'loading') {
    return (
      <p className="auth-card" role="status">
        Validando sesión…
      </p>
    );
  }

  if (status !== 'authenticated') {
    return (
      <section className="auth-card" aria-labelledby="session-title">
        <p className="eyebrow">Sesión requerida</p>
        <h1 id="session-title">Inicia sesión para entrar al workspace</h1>
        <p>
          La autenticación usa Authorization Code + PKCE contra Keycloak. La API valida el JWT y
          resuelve permisos; el frontend solo protege navegación y estado visual.
        </p>
        {status === 'expired' ? (
          <p role="alert">Tu sesión expiró. Vuelve a iniciar sesión.</p>
        ) : null}
        {status === 'error' && error ? <p role="alert">{error}</p> : null}
        <Button onClick={() => void login()}>Iniciar sesión</Button>
      </section>
    );
  }

  return <>{children}</>;
}
