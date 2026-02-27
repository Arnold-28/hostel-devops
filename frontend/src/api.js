import { getToken } from './auth';

const API_BASE = import.meta.env.VITE_API_BASE || '';

export async function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) {
    const message = body?.message || `Request failed (${res.status})`;
    const details = typeof body?.details === 'string' ? body.details.trim() : '';
    throw new Error(details ? `${message}: ${details}` : message);
  }

  return body;
}
