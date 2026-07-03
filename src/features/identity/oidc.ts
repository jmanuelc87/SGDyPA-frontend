export type OidcProfile = {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  preferred_username?: string;
};

export type OidcSession = {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresAt: number;
  profile?: OidcProfile;
};

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in: number;
};

const STORAGE_KEY = 'sgdypa.oidc.session';
const CALLBACK_PATH = '/auth/callback';
const SKEW_SECONDS = 45;

const issuer = import.meta.env.VITE_OIDC_ISSUER as string | undefined;
const clientId = import.meta.env.VITE_OIDC_CLIENT_ID as string | undefined;
const scope = import.meta.env.VITE_OIDC_SCOPE ?? 'openid profile email';

export class SessionExpiredError extends Error {
  constructor() {
    super('La sesión expiró. Inicia sesión nuevamente.');
    this.name = 'SessionExpiredError';
  }
}

function requireConfig() {
  if (!issuer || !clientId) {
    throw new Error('Configura VITE_OIDC_ISSUER y VITE_OIDC_CLIENT_ID para habilitar OIDC PKCE.');
  }

  return {
    authorizationEndpoint: `${issuer}/protocol/openid-connect/auth`,
    tokenEndpoint: `${issuer}/protocol/openid-connect/token`,
    endSessionEndpoint: `${issuer}/protocol/openid-connect/logout`,
    clientId,
    redirectUri: `${window.location.origin}${CALLBACK_PATH}`,
  };
}

function base64UrlEncode(bytes: ArrayBuffer | Uint8Array) {
  const value = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const binary = String.fromCharCode(...value);

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function randomString() {
  return base64UrlEncode(crypto.getRandomValues(new Uint8Array(32)));
}

async function sha256(value: string) {
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
}

function decodeJwtPayload<T>(token?: string): T | undefined {
  if (!token) return undefined;
  const [, payload] = token.split('.');
  if (!payload) return undefined;

  return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as T;
}

function persistSession(tokenResponse: TokenResponse): OidcSession {
  const session: OidcSession = {
    accessToken: tokenResponse.access_token,
    refreshToken: tokenResponse.refresh_token,
    idToken: tokenResponse.id_token,
    expiresAt: Date.now() + tokenResponse.expires_in * 1000,
    profile: decodeJwtPayload<OidcProfile>(tokenResponse.id_token),
  };

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  return session;
}

export function getStoredSession(): OidcSession | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as OidcSession) : null;
}

export function clearSession() {
  sessionStorage.removeItem(STORAGE_KEY);
}

const SESSION_EXPIRED_EVENT = 'sgdypa:session-expired';

export function onSessionExpired(listener: () => void) {
  window.addEventListener(SESSION_EXPIRED_EVENT, listener);
  return () => window.removeEventListener(SESSION_EXPIRED_EVENT, listener);
}

// Drop the invalid session and let the AuthProvider transition the UI to the
// expired state instead of continuing to attach a rejected bearer token.
export function notifySessionExpired() {
  clearSession();
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}

export function isExpired(session: OidcSession) {
  return Date.now() >= session.expiresAt - SKEW_SECONDS * 1000;
}

export async function signIn(returnTo = window.location.pathname + window.location.search) {
  const config = requireConfig();
  const state = randomString();
  const codeVerifier = randomString();
  const codeChallenge = base64UrlEncode(await sha256(codeVerifier));

  sessionStorage.setItem(`oidc.${state}`, JSON.stringify({ codeVerifier, returnTo }));

  const params = new URLSearchParams({
    client_id: config.clientId,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope,
    state,
  });

  window.location.assign(`${config.authorizationEndpoint}?${params.toString()}`);
}

let callbackInFlight: Promise<void> | null = null;

export function handleCallback(search = window.location.search) {
  // In React StrictMode the boot effect runs twice; without this guard the
  // second call finds the one-time state already consumed and fails. Share the
  // in-flight exchange so both invocations resolve from the same result.
  if (callbackInFlight) return callbackInFlight;
  callbackInFlight = doHandleCallback(search).finally(() => {
    callbackInFlight = null;
  });
  return callbackInFlight;
}

async function doHandleCallback(search: string) {
  const config = requireConfig();
  const params = new URLSearchParams(search);
  const code = params.get('code');
  const state = params.get('state');

  if (!code || !state) throw new Error('Callback OIDC inválido.');

  const stored = sessionStorage.getItem(`oidc.${state}`);
  if (!stored) throw new Error('Estado OIDC no reconocido.');
  sessionStorage.removeItem(`oidc.${state}`);
  const { codeVerifier, returnTo } = JSON.parse(stored) as {
    codeVerifier: string;
    returnTo: string;
  };

  const body = new URLSearchParams({
    client_id: config.clientId,
    code,
    code_verifier: codeVerifier,
    grant_type: 'authorization_code',
    redirect_uri: config.redirectUri,
  });

  const response = await fetch(config.tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) throw new Error('No fue posible completar el inicio de sesión.');

  persistSession((await response.json()) as TokenResponse);
  window.history.replaceState(null, '', returnTo || '/');
}

export async function refreshSession() {
  const config = requireConfig();
  const current = getStoredSession();
  if (!current?.refreshToken) throw new SessionExpiredError();

  const response = await fetch(config.tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.clientId,
      grant_type: 'refresh_token',
      refresh_token: current.refreshToken,
    }),
  });

  if (!response.ok) {
    clearSession();
    throw new SessionExpiredError();
  }

  return persistSession((await response.json()) as TokenResponse);
}

export async function getValidAccessToken() {
  const session = getStoredSession();
  if (!session) return null;
  if (!isExpired(session)) return session.accessToken;

  return (await refreshSession()).accessToken;
}

export function signOut() {
  const config = requireConfig();
  const session = getStoredSession();
  clearSession();

  const params = new URLSearchParams({ post_logout_redirect_uri: window.location.origin });
  if (session?.idToken) params.set('id_token_hint', session.idToken);
  window.location.assign(`${config.endSessionEndpoint}?${params.toString()}`);
}
