import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

let client;
export function db() {
  if (!client) {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new HttpError(500, 'Falta configurar SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en el servidor.');
    client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  return client;
}

export const normalizeCode = (c) => (c || '').trim().toLowerCase().replace(/\s+/g, '-');

function readCode(request, fromBody) {
  const code = normalizeCode(fromBody ?? request.headers.get('x-family-code'));
  if (code.length < 4 || code.length > 64) throw new HttpError(401, 'El código familiar debe tener entre 4 y 64 caracteres.');
  return code;
}

/** Id del hogar de la petición. Nunca crea: la familia debe existir (se crea solo en /api/household). */
export async function householdId(request) {
  const code = readCode(request);
  const { data, error } = await db().from('households').select('id').eq('code', code).maybeSingle();
  if (error) throw new HttpError(500, error.message);
  if (!data) throw new HttpError(401, 'No existe ninguna familia con ese código.');
  return data.id;
}

/** Entrar en una familia existente o crear una nueva (explícito). */
export async function enterHousehold(code, mode) {
  const c = readCode(null, code);
  const sb = db();
  const { data, error } = await sb.from('households').select('id').eq('code', c).maybeSingle();
  if (error) throw new HttpError(500, error.message);
  if (mode === 'create') {
    if (data) throw new HttpError(409, 'Ese código ya está en uso. Elige otro o entra con él.');
    const ins = await sb.from('households').insert({ code: c }).select('id').single();
    if (ins.error) throw new HttpError(ins.error.code === '23505' ? 409 : 500, ins.error.code === '23505' ? 'Ese código ya está en uso.' : ins.error.message);
  } else if (!data) throw new HttpError(404, 'No existe ninguna familia con ese código. ¿Quieres crearla?');
  return { code: c };
}

export function handle(fn) {
  return async (request, ctx) => {
    try {
      return NextResponse.json(await fn(request, ctx), { headers: { 'cache-control': 'no-store' } });
    } catch (e) {
      const status = e instanceof HttpError ? e.status : 500;
      if (!(e instanceof HttpError)) console.error(e);
      return NextResponse.json({ error: e.message || 'Error interno' }, { status });
    }
  };
}
