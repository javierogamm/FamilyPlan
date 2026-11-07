import { db, handle, householdId, HttpError } from '@/lib/server';

export const dynamic = 'force-dynamic';

export const GET = handle(async (request) => {
  const hid = await householdId(request);
  const from = new URL(request.url).searchParams.get('from') || '1970-01-01';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from)) throw new HttpError(400, 'Fecha no válida');
  const sb = db();
  const [meals, absences, events, dishes] = await Promise.all([
    sb.from('meals').select('*').eq('household_id', hid).gte('date', from),
    sb.from('absences').select('*').eq('household_id', hid).gte('end_date', from),
    sb.from('events').select('*').eq('household_id', hid).or(`date.gte.${from},repeat.eq.weekly`),
    sb.from('dishes').select('*').eq('household_id', hid).order('name'),
  ]);
  for (const r of [meals, absences, events, dishes]) if (r.error) throw new HttpError(500, r.error.message);
  return { meals: meals.data, absences: absences.data, events: events.data, dishes: dishes.data };
});
