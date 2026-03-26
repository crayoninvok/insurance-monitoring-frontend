export class ApiError extends Error {
  readonly status: number;
  readonly body?: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };

function getBaseUrl() {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error('NEXT_PUBLIC_API_URL belum diset di frontend/.env');
  }
  return url.replace(/\/+$/, '');
}

function isBrowser() {
  return typeof window !== 'undefined';
}

export function getAuthToken() {
  if (!isBrowser()) return null;
  return window.localStorage.getItem('auth_token');
}

export function setAuthToken(token: string | null) {
  if (!isBrowser()) return;
  if (!token) window.localStorage.removeItem('auth_token');
  else window.localStorage.setItem('auth_token', token);
}

export type ApiRequestOptions = Omit<RequestInit, 'body' | 'headers'> & {
  body?: JsonValue;
  headers?: Record<string, string>;
  auth?: boolean; // default true
};

export async function apiFetch<T>(
  path: string,
  opts: ApiRequestOptions = {},
): Promise<T> {
  const url = `${getBaseUrl()}${path.startsWith('/') ? '' : '/'}${path}`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(opts.headers ?? {}),
  };

  const authEnabled = opts.auth !== false;
  if (authEnabled) {
    const token = getAuthToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let body: BodyInit | undefined = undefined;
  if (opts.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(opts.body);
  }

  const res = await fetch(url, {
    ...opts,
    headers,
    body,
  });

  const contentType = res.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const parsed = isJson ? await res.json().catch(() => undefined) : undefined;

  if (!res.ok) {
    const message =
      (parsed && typeof parsed === 'object' && 'message' in parsed
        ? String((parsed as any).message)
        : `HTTP ${res.status}`) ?? `HTTP ${res.status}`;
    throw new ApiError(message, res.status, parsed);
  }

  return (parsed as T) ?? (undefined as T);
}

