import { db, handle, householdId, HttpError } from '@/lib/server';

export const dynamic = 'force-dynamic';

const PEOPLE = ['papa', 'mama', 'otros'];
const SCHEMA = {
  meals: {
    conflict: 'household_id,date,slot',
    required: ['date', 'slot'],
    fields: { date: 'date', slot: ['comida', 'cena'], dish: 's60', emoji: 's8', cook: [...PEOPLE, null], shopper: [...PEOPLE, null], shopping_ok: 'bool', done: 'bool', needs_buy: 'bool', cook_when: ['same', 'eve', 'weekend'], note: 's200' },
  },
  absences: {
    required: ['id', 'person', 'start_date', 'end_date'],
    fields: { id: 'uuid', person: ['papa', 'mama'], start_date: 'date', end_date: 'date', kind: ['viaje', 'trabajo', 'otro'], note: 's120' },
  },
  events: {
    required: ['id', 'date', 'title', 'kind'],
    fields: { id: 'uuid', date: 'date', time: 'time', title: 's80', kind: ['evento', 'extraescolar'], who: 's60', repeat: ['none', 'weekly'], emoji: 's8', series_id: 'uuid?', location: ['school', 'outside'], icon: 's30', needs_transport: 'bool', transport: ['papa', 'mama', null], activity: 's20' },
  },
  shopping: {
    required: ['id', 'store'],
    fields: { id: 'uuid', store: ['super', 'fruteria', 'carniceria', 'pascual', 'otros'], items: 's200', shopper: [...PEOPLE, null], date: 'date?', done: 'bool' },
  },
  dishes: {
    required: ['id', 'name'],
    fields: { id: 'uuid', name: 's60', emoji: 's8' },
  },
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function check(rule, v, name) {
  const bad = () => new HttpError(400, `Valor no válido: ${name}`);
  if (Array.isArray(rule)) {
    if (!rule.includes(v)) throw bad();
    return v;
  }
  if (rule === 'date') {
    if (typeof v !== 'string' || !DATE.test(v) || Number.isNaN(Date.parse(v))) throw bad();
    return v;
  }
  if (rule === 'date?') {
    if (v == null || v === '') return null;
    return check('date', v, name);
  }
  if (rule === 'time') {
    if (v == null || v === '') return null;
    if (typeof v !== 'string' || !/^\d{2}:\d{2}(:\d{2})?$/.test(v)) throw bad();
    return v.slice(0, 5);
  }
  if (rule === 'uuid?') {
    if (v == null || v === '') return null;
    return check('uuid', v, name);
  }
  if (rule === 'uuid') {
    if (typeof v !== 'string' || !UUID.test(v)) throw bad();
    return v.toLowerCase();
  }
  if (rule === 'bool') {
    if (typeof v !== 'boolean') throw bad();
    return v;
  }
  if (rule[0] === 's') {
    if (typeof v !== 'string') throw bad();
    return v.trim().slice(0, Number(rule.slice(1)));
  }
  throw bad();
}

function schemaFor(table) {
  const s = SCHEMA[table];
  if (!s) throw new HttpError(404, 'Recurso desconocido');
  return s;
}

function build(table, s, hid, body) {
  if (!body || typeof body !== 'object') throw new HttpError(400, 'Cuerpo no válido');
  for (const k of s.required) if (body[k] == null || body[k] === '') throw new HttpError(400, `Falta ${k}`);
  const row = { household_id: hid };
  for (const [k, rule] of Object.entries(s.fields)) if (k in body) row[k] = check(rule, body[k], k);
  if (table === 'absences' && row.end_date < row.start_date) throw new HttpError(400, 'La fecha final es anterior a la inicial');
  if ((table === 'dishes' || table === 'events') && !(row.name ?? row.title)) throw new HttpError(400, 'Nombre vacío');
  if (table === 'meals') row.updated_at = new Date().toISOString();
  return row;
}

export const POST = handle(async (request, { params }) => {
  const { table } = await params;
  const s = schemaFor(table);
  const hid = await householdId(request);
  const body = await request.json().catch(() => null);
  const list = Array.isArray(body) ? body : [body];
  if (list.length === 0 || list.length > 500) throw new HttpError(400, 'Lote no válido');
  const rows = list.map((b) => build(table, s, hid, b));
  const sb = db();
  if (!s.conflict) {
    // las tablas con id de cliente solo pueden modificar filas del propio hogar
    const { data: ex } = await sb.from(table).select('id,household_id').in('id', rows.map((r) => r.id));
    if (ex?.some((x) => x.household_id !== hid)) throw new HttpError(403, 'No permitido');
  }
  const { data, error } = await sb.from(table).upsert(rows, { onConflict: s.conflict || 'id' }).select();
  if (error) throw new HttpError(error.code === '23505' ? 409 : 500, error.message);
  return { row: data[0], rows: data };
});

export const DELETE = handle(async (request, { params }) => {
  const { table } = await params;
  schemaFor(table);
  const hid = await householdId(request);
  const sp = new URL(request.url).searchParams;
  let q = db().from(table).delete().eq('household_id', hid);
  if (table === 'events' && sp.get('series')) {
    q = q.eq('series_id', check('uuid', sp.get('series'), 'series')).gte('date', check('date', sp.get('from'), 'from'));
  } else if (table === 'meals') {
    const date = sp.get('date');
    const slot = sp.get('slot');
    check('date', date, 'date');
    check(['comida', 'cena'], slot, 'slot');
    q = q.eq('date', date).eq('slot', slot);
  } else q = q.eq('id', check('uuid', sp.get('id'), 'id'));
  const { error } = await q;
  if (error) throw new HttpError(500, error.message);
  return { ok: true };
});
