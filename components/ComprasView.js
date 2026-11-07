'use client';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SLOTS, STORES, person, store } from '@/lib/constants';
import { diffDays, fromISO, weekdayName } from '@/lib/dates';
import { buzz, mealAt } from '@/lib/helpers';
import { personIcon } from '@/lib/icons';
import { Pic } from './Pic';
import SwipeRow from './SwipeRow';

const CYCLE = [null, 'papa', 'mama'];

function dateTag(d, today) {
  if (!d) return { text: 'Sin fecha', late: false };
  const r = diffDays(d, today);
  const dm = `${d.slice(8)}/${d.slice(5, 7)}`;
  if (r < 0) return { text: `Atrasada · ${dm}`, late: true };
  if (r === 0) return { text: 'Hoy', late: false };
  if (r === 1) return { text: 'Mañana', late: false };
  return { text: `${weekdayName(d)} ${dm}`, late: false };
}

export default function ComprasView({ today, data, save, openShop, removeWithUndo }) {
  const [showDone, setShowDone] = useState(false);
  const pending = data.shopping.filter((t) => !t.done).sort((a, b) => (a.date || '9').localeCompare(b.date || '9'));
  const done = data.shopping.filter((t) => t.done).sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 15);
  const needs = data.meals
    .filter((m) => m.dish && m.needs_buy && !m.done && m.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.slot.localeCompare(b.slot));
  const count = (id) => pending.filter((t) => t.store === id).length;
  const assign = (t) => { buzz(12); save('shopping', { ...t, shopper: CYCLE[(CYCLE.indexOf(t.shopper ?? null) + 1) % CYCLE.length] }); };
  const toggle = (t) => { buzz(18); save('shopping', { ...t, done: !t.done }); };

  const row = (t) => {
    const st = store(t.store);
    const tag = dateTag(t.date, today);
    const icon = t.shopper && t.shopper !== 'otros' ? personIcon(t.shopper, 'comprar') : null;
    return (
      <SwipeRow key={t.id} className={`shop-item${t.done ? ' is-done' : ''}`} onClick={() => openShop({ edit: t })} onDelete={() => removeWithUndo('shopping', t)}>
        <button type="button" className={`check${t.done ? ' on' : ''}`} aria-label={t.done ? 'Marcar pendiente' : 'Marcar comprada'} onClick={() => toggle(t)}>
          <motion.span key={String(t.done)} initial={{ scale: 0.3 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 14 }}>{t.done ? '✓' : ''}</motion.span>
        </button>
        <span className="si-ico">{st.emoji}</span>
        <span className="ag-main"><b>{st.label}</b><small>{t.items || 'Sin detalle'}</small></span>
        <span className={`si-date${tag.late ? ' late' : ''}`}>{tag.text}</span>
        <button type="button" className={`tr-btn${t.shopper ? ' set' : ''}`} aria-label="Asignar quién compra" onClick={() => assign(t)}>
          {icon ? <Pic key={t.shopper} icon={icon} size={52} /> : t.shopper === 'otros' ? <span className="as-emoji">🧑‍🍳</span> : <span className="tr-empty">🛒<b>?</b></span>}
        </button>
      </SwipeRow>
    );
  };

  return (
    <div className="compras">
      <h1 className="page-title">Compras</h1>

      <div className="store-grid">
        {STORES.map((s) => (
          <motion.button key={s.id} type="button" className="store-tile" whileTap={{ scale: 0.94 }} onClick={() => openShop({ store: s.id })}>
            <span className="st-emoji">{s.emoji}</span>
            <b>{s.label}</b>
            <small>{count(s.id) ? `${count(s.id)} pendiente${count(s.id) > 1 ? 's' : ''}` : '＋ Añadir'}</small>
            {count(s.id) > 0 && <i className="st-badge">{count(s.id)}</i>}
          </motion.button>
        ))}
      </div>

      {needs.length > 0 && (
        <>
          <h3 className="section">🍽️ Comidas que necesitan compra</h3>
          <div className="chips no-top">
            {needs.map((m) => (
              <button key={m.date + m.slot} type="button" className="chip" onClick={() => openShop({ prefill: { items: m.dish, date: m.date } })}>
                {m.emoji} {m.dish} <small>{weekdayName(m.date).slice(0, 3)} {SLOTS.find((s) => s.id === m.slot).icon}</small>
              </button>
            ))}
          </div>
          <p className="muted hint left">Toca una comida para crear su compra. Se desmarca "Hay que comprar" en la comida cuando esté comprado.</p>
        </>
      )}

      <h3 className="section">Pendientes</h3>
      <div className="shop-list">
        <AnimatePresence initial={false}>{pending.map(row)}</AnimatePresence>
        {pending.length === 0 && <p className="muted pad">No hay compras pendientes. 🎉</p>}
      </div>

      {done.length > 0 && (
        <>
          <button type="button" className="link" onClick={() => setShowDone((v) => !v)}>{showDone ? 'Ocultar' : 'Ver'} hechas ({done.length})</button>
          {showDone && <div className="shop-list"><AnimatePresence initial={false}>{done.map(row)}</AnimatePresence></div>}
        </>
      )}
    </div>
  );
}
