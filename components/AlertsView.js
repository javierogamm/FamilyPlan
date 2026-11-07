'use client';
import { AnimatePresence, motion } from 'framer-motion';
import SwipeRow from './SwipeRow';

const LEVEL = { high: 'Urgente', med: 'Pendiente', info: 'Recordatorio' };

export default function AlertsView({ alerts, onGo, onDismiss, notif, onEnableNotif, code, onLogout }) {
  return (
    <div className="alerts">
      <h1 className="page-title">Avisos</h1>
      {notif === 'default' && (
        <motion.button type="button" className="notif-cta" whileTap={{ scale: 0.97 }} onClick={onEnableNotif}>
          🔔 <span><b>Activar notificaciones</b><small>Te avisamos al abrir la app de lo urgente. En iPhone, primero añade la app a la pantalla de inicio.</small></span>
        </motion.button>
      )}
      <p className="muted hint">Desliza a la izquierda para descartar un aviso</p>
      <AnimatePresence initial={false}>
        {alerts.map((a) => (
          <SwipeRow key={a.id} className={`alert lv-${a.level}`} onClick={() => onGo(a)} onDelete={() => onDismiss(a.id)}>
            <span className="al-ico">{a.icon}</span>
            <span className="al-main"><small>{LEVEL[a.level]}</small><b>{a.title}</b><span>{a.text}</span></span>
            <span className="al-go">›</span>
          </SwipeRow>
        ))}
      </AnimatePresence>
      {alerts.length === 0 && (
        <motion.div className="all-good" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
          <motion.span animate={{ rotate: [0, -12, 12, -8, 8, 0] }} transition={{ duration: 1.2, delay: 0.3 }}>🎉</motion.span>
          <b>Todo en orden</b>
          <p>No hay nada pendiente en los próximos días.</p>
        </motion.div>
      )}
      <div className="family-foot">
        <span>Familia: <b>{code}</b></span>
        <button type="button" className="link" onClick={onLogout}>Cambiar de familia</button>
      </div>
    </div>
  );
}
