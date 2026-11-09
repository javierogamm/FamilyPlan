import { db, handle, householdId, HttpError } from '@/lib/server';

export const dynamic = 'force-dynamic';

export const POST = handle(async (request) => {
  const hid = await householdId(request);
  const body = await request.json().catch(() => null);
  const sub = body?.subscription;
  if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) throw new HttpError(400, 'Suscripción no válida');
  if (!/^https:\/\//.test(sub.endpoint)) throw new HttpError(400, 'Endpoint no válido');
  const person = ['papa', 'mama'].includes(body.person) ? body.person : null;
  const { error } = await db()
    .from('push_subscriptions')
    .upsert({ household_id: hid, person, endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth }, { onConflict: 'endpoint' });
  if (error) throw new HttpError(500, error.message);
  return { ok: true };
});

export const DELETE = handle(async (request) => {
  const hid = await householdId(request);
  const body = await request.json().catch(() => null);
  if (!body?.endpoint) throw new HttpError(400, 'Falta el endpoint');
  const { error } = await db().from('push_subscriptions').delete().eq('household_id', hid).eq('endpoint', body.endpoint);
  if (error) throw new HttpError(500, error.message);
  return { ok: true };
});
