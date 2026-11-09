import { api } from './api';

export const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

const b64ToBytes = (b64) => {
  const pad = '='.repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
};

export const pushSupported = () => typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

export async function currentSubscription() {
  const reg = await navigator.serviceWorker.ready;
  return reg.pushManager.getSubscription();
}

export async function enablePush(code, me) {
  if (!VAPID_PUBLIC) throw new Error('Falta configurar la clave pública VAPID en el servidor.');
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') throw new Error('Has bloqueado las notificaciones. Actívalas en los ajustes del navegador o del móvil.');
  const reg = await navigator.serviceWorker.ready;
  const sub = (await reg.pushManager.getSubscription()) || (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToBytes(VAPID_PUBLIC) }));
  await api(code, '/api/push/subscribe', { method: 'POST', body: { subscription: sub.toJSON(), person: me } });
  try { localStorage.setItem('fp_push', '1'); } catch {}
  return sub;
}

export async function disablePush(code) {
  const sub = await currentSubscription();
  if (sub) {
    await api(code, '/api/push/subscribe', { method: 'DELETE', body: { endpoint: sub.endpoint } }).catch(() => {});
    await sub.unsubscribe();
  }
  try { localStorage.removeItem('fp_push'); } catch {}
}

export async function testPush(code) {
  const sub = await currentSubscription();
  if (!sub) throw new Error('Este dispositivo no está suscrito.');
  await api(code, '/api/push/test', { method: 'POST', body: { endpoint: sub.endpoint } });
}
