export async function api(code, url, { method = 'GET', body } = {}) {
  const res = await fetch(url, {
    method,
    cache: 'no-store',
    headers: { 'x-family-code': code, ...(body ? { 'content-type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const e = new Error(json.error || 'Error de conexión');
    e.status = res.status;
    throw e;
  }
  return json;
}
