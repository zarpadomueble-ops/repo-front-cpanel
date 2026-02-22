const DEFAULT_PROD_API_BASE = 'https://api.zarpadomueble.com';
const DEFAULT_LOCAL_API_BASE = 'http://localhost:3000';

function normalizeBase(url) {
  return String(url || '').trim().replace(/\/+$/, '');
}

function detectApiBase() {
  if (typeof window === 'undefined') return DEFAULT_PROD_API_BASE;

  if (window.ADMIN_FIN_API_BASE && String(window.ADMIN_FIN_API_BASE).trim()) {
    return normalizeBase(window.ADMIN_FIN_API_BASE);
  }

  const hostname = window.location.hostname;
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';

  return isLocal ? DEFAULT_LOCAL_API_BASE : DEFAULT_PROD_API_BASE;
}

export const API_BASE = detectApiBase();

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export class AuthError extends ApiError {
  constructor(message = 'No autenticado.') {
    super(message, 401);
    this.name = 'AuthError';
  }
}

let csrfToken = '';

function buildUrl(path) {
  const cleanPath = String(path || '').trim();
  if (!cleanPath) return API_BASE;
  if (/^https?:\/\//i.test(cleanPath)) return cleanPath;
  return `${API_BASE}${cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`}`;
}

function toQueryString(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.set(key, String(value));
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

async function parseResponse(response) {
  let payload = null;
  try {
    payload = await response.json();
  } catch (_error) {
    payload = null;
  }

  if (response.status === 401) {
    throw new AuthError(payload?.error || 'Sesión no válida.');
  }

  if (!response.ok || payload?.ok === false) {
    throw new ApiError(payload?.error || 'Error de API.', response.status, payload?.details);
  }

  return payload;
}

async function fetchCsrfToken(force = false) {
  if (csrfToken && !force) return csrfToken;

  const response = await fetch(buildUrl('/api/admin/auth/csrf'), {
    method: 'GET',
    credentials: 'include',
    headers: {
      Accept: 'application/json'
    }
  });

  const payload = await parseResponse(response);
  csrfToken = payload?.csrfToken || '';
  if (!csrfToken) {
    throw new ApiError('No se pudo obtener CSRF token.', response.status);
  }

  return csrfToken;
}

async function request(path, options = {}) {
  const method = String(options.method || 'GET').toUpperCase();
  const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

  if (!options.skipCsrf && (isMutation || !csrfToken)) {
    await fetchCsrfToken(false);
  }

  const headers = {
    Accept: 'application/json',
    ...(options.headers || {})
  };

  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  let body = options.body;
  if (options.json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.json);
  }

  const response = await fetch(buildUrl(path), {
    method,
    credentials: 'include',
    headers,
    body
  });

  return parseResponse(response);
}

export function formatMoneyFromCents(cents) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format((Number(cents) || 0) / 100);
}

export function moneyToCents(amountArs) {
  const normalized = Number(amountArs || 0);
  if (!Number.isFinite(normalized) || normalized <= 0) return 0;
  return Math.round(normalized * 100);
}

export async function getCsrfToken(force = false) {
  return fetchCsrfToken(force);
}

export async function login(username, password) {
  await fetchCsrfToken(false);
  return request('/api/admin/auth/login', {
    method: 'POST',
    json: { username, password }
  });
}

export async function logout() {
  return request('/api/admin/auth/logout', { method: 'POST' });
}

export async function authMe() {
  return request('/api/admin/auth/me', { method: 'GET' });
}

export async function getSummary(filters = {}) {
  const query = toQueryString(filters);
  return request(`/api/admin/finanzas/summary${query}`);
}

export async function listCustomers() {
  return request('/api/admin/finanzas/customers');
}

export async function createCustomer(payload) {
  return request('/api/admin/finanzas/customers', {
    method: 'POST',
    json: payload
  });
}

export async function updateCustomer(id, payload) {
  return request(`/api/admin/finanzas/customers/${encodeURIComponent(id)}`, {
    method: 'PUT',
    json: payload
  });
}

export async function deleteCustomer(id) {
  return request(`/api/admin/finanzas/customers/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
}

export async function getCustomerSummary(id, filters = {}) {
  const query = toQueryString(filters);
  return request(`/api/admin/finanzas/customers/${encodeURIComponent(id)}/summary${query}`);
}

export async function listCategories() {
  return request('/api/admin/finanzas/categories');
}

export async function createCategory(payload) {
  return request('/api/admin/finanzas/categories', {
    method: 'POST',
    json: payload
  });
}

export async function updateCategory(id, payload) {
  return request(`/api/admin/finanzas/categories/${encodeURIComponent(id)}`, {
    method: 'PUT',
    json: payload
  });
}

export async function deleteCategory(id) {
  return request(`/api/admin/finanzas/categories/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
}

export async function listTransactions(filters = {}) {
  const query = toQueryString(filters);
  return request(`/api/admin/finanzas/transactions${query}`);
}

export async function createTransaction(payload) {
  return request('/api/admin/finanzas/transactions', {
    method: 'POST',
    json: payload
  });
}

export async function updateTransaction(id, payload) {
  return request(`/api/admin/finanzas/transactions/${encodeURIComponent(id)}`, {
    method: 'PUT',
    json: payload
  });
}

export async function deleteTransaction(id) {
  return request(`/api/admin/finanzas/transactions/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
}

export async function exportJson() {
  return request('/api/admin/finanzas/export');
}

export async function importJson(payload) {
  return request('/api/admin/finanzas/import', {
    method: 'POST',
    json: payload
  });
}

export function clearCsrfCache() {
  csrfToken = '';
}
