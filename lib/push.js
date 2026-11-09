let webpush;
const wp = () => (webpush ||= require('web-push'));
import { HttpError } from './server';

let ready = false;
export function configurePush() {
  if (ready) return;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) throw new HttpError(500, 'Faltan NEXT_PUBLIC_VAPID_PUBLIC_KEY y VAPID_PRIVATE_KEY en el servidor.');
  wp().setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:admin@example.com', pub, priv);
  ready = true;
}

/** Envía un payload a una suscripción; devuelve false si ya no es válida (404/410). */
export async function sendPush(sub, payload) {
  configurePush();
  try {
    await wp().sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, JSON.stringify(payload), { TTL: 3600 });
    return true;
  } catch (e) {
    if (e.statusCode === 404 || e.statusCode === 410) return false;
    console.error('push error', e.statusCode, e.body);
    return true; // error transitorio: no borrar la suscripción
  }
}

/** Fecha y hora locales (zona de la familia) a partir del instante actual. */
export function localNow(tz = process.env.APP_TZ || 'Europe/Madrid') {
  const s = new Date().toLocaleString('sv-SE', { timeZone: tz }); // "YYYY-MM-DD HH:MM:SS"
  return { date: s.slice(0, 10), time: s.slice(11, 16) };
}
