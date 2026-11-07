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

/** Devuelve el id del hogar para el código familiar (lo crea si no existe). */
export async function householdId(request) {
  const code = (request.headers.get('x-family-code') || '').trim().toLowerCase().replace(/\s+/g, '-');
  if (code.length < 4 || code.length > 64) throw new HttpError(401, 'El código familiar debe tener al menos 4 caracteres.');
  const sb = db();
  const find = () => sb.from('households').select('id').eq('code', code).maybeSingle();
  let { data, error } = await find();
  if (error) throw new HttpError(500, error.message);
  if (!data) {
    const ins = await sb.from('households').insert({ code }).select('id').single();
    if (ins.error) {
      ({ data, error } = await find()); // carrera: otro dispositivo lo creó a la vez
      if (error || !data) throw new HttpError(500, ins.error.message);
    } else data = ins.data;
  }
  return data.id;
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
