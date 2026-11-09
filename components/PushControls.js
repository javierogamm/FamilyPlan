'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { currentSubscription, disablePush, enablePush, pushSupported, testPush, VAPID_PUBLIC } from '@/lib/pushClient';

/** Activa o desactiva las notificaciones push de este dispositivo. */
export default function PushControls({ code, me }) {
  const [state, setState] = useState('loading'); // loading | unsupported | off | on | denied
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    (async () => {
      if (!pushSupported()) return setState('unsupported');
      if (Notification.permission === 'denied') return setState('denied');
      try { setState((await currentSubscription()) ? 'on' : 'off'); } catch { setState('off'); }
    })();
  }, []);

  const run = async (fn, ok) => {
    setBusy(true);
    setMsg(null);
    try { await fn(); if (ok) setMsg(ok); } catch (e) { setMsg(`⚠️ ${e.message}`); } finally { setBusy(false); }
  };

  if (state === 'loading') return null;
  if (state === 'unsupported') return <p className="muted hint">🔕 Este navegador no admite notificaciones push. En iPhone, instala la app: Compartir → «Añadir a pantalla de inicio» y ábrela desde el icono.</p>;
  if (state === 'denied') return <p className="muted hint">🔕 Las notificaciones están bloqueadas. Actívalas en los ajustes del navegador o del móvil para esta app.</p>;

  return (
    <div className="push-box">
      {state === 'off' ? (
        <motion.button type="button" className="notif-cta" whileTap={{ scale: 0.97 }} disabled={busy || !VAPID_PUBLIC} onClick={() => run(async () => { await enablePush(code, me); setState('on'); }, '✅ Activadas en este dispositivo')}>
          🔔 <span><b>Activar notificaciones push</b><small>{VAPID_PUBLIC ? 'Extraescolares 30 min antes, cenas de la noche anterior a las 19:30 y tareas del día a las 12:00 y 17:00. Llegan con la app cerrada.' : 'Falta configurar la clave VAPID en el servidor.'}</small></span>
        </motion.button>
      ) : (
        <div className="push-on">
          <span>✅ <b>Notificaciones activas</b> en este dispositivo</span>
          <button type="button" className="btn ghost sm" disabled={busy} onClick={() => run(() => testPush(code), '📨 Enviada una de prueba')}>Probar</button>
          <button type="button" className="btn ghost danger sm" disabled={busy} onClick={() => run(async () => { await disablePush(code); setState('off'); })}>Desactivar</button>
        </div>
      )}
      {msg && <p className="muted hint">{msg}</p>}
    </div>
  );
}
