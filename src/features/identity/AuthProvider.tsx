import { useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  clearSession,
  getStoredSession,
  handleCallback,
  isExpired,
  refreshSession,
  signIn,
  signOut,
  type OidcSession,
} from './oidc';
import { AuthContext } from './authContext';

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous' | 'expired' | 'error';

export type AuthContextValue = {
  session: OidcSession | null;
  status: AuthStatus;
  error?: string;
  login: () => Promise<void>;
  logout: () => void;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<OidcSession | null>(() => getStoredSession());
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [error, setError] = useState<string>();

  useEffect(() => {
    let mounted = true;

    async function boot() {
      try {
        if (window.location.pathname === '/auth/callback') {
          await handleCallback();
        }

        const current = getStoredSession();
        if (!current) {
          if (!mounted) return;
          setSession(null);
          setStatus('anonymous');
          return;
        }

        const active = isExpired(current) ? await refreshSession() : current;
        if (!mounted) return;
        setSession(active);
        setStatus('authenticated');
      } catch (caught) {
        clearSession();
        if (!mounted) return;
        setSession(null);
        setError(caught instanceof Error ? caught.message : 'Error de autenticación.');
        setStatus(
          caught instanceof Error && caught.name === 'SessionExpiredError' ? 'expired' : 'error',
        );
      }
    }

    void boot();
    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      status,
      error,
      login: () => signIn(),
      logout: signOut,
    }),
    [error, session, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
