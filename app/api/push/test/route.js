import { db, handle, householdId, HttpError } from '@/lib/server';
import { sendPush } from '@/lib/push';

export const dynamic = 'force-dynamic';

/** Envía una notificación de prueba a la suscripción indicada (de la propia familia). */
export const POST = handle(async (request) => {
  const hid = await householdId(request);
  const body = await request.json().catch(() => null);
  const { data: sub } = await db().from('push_subscriptions').select('*').eq('household_id', hid).eq('endpoint', body?.endpoint || '').maybeSingle();
  if (!sub) throw new HttpError(404, 'Este dispositivo no está suscrito. Actívalas de nuevo.');
  const ok = await sendPush(sub, { title: '🔔 Notificaciones activadas', body: 'Plan Familiar te avisará de extraescolares, cenas y tareas del día.', tag: 'test', url: '/' });
  if (!ok) {
    await db().from('push_subscriptions').delete().eq('id', sub.id);
    throw new HttpError(410, 'La suscripción había caducado. Vuelve a activarlas.');
  }
  return { ok: true };
});
