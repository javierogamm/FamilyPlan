'use client';
import { motion } from 'framer-motion';
import { NO_SHOP, PARENTS, SLOTS } from '@/lib/constants';
import { dayNum, relativeLabel, weekDays, weekdayName } from '@/lib/dates';
import { absentOn, eventsOn, hhmm, mealAt } from '@/lib/helpers';
import { Avatar } from './ui';

const list = { show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 320, damping: 26 } } };

function Bar({ label, value, total, tone }) {
  const pct = total ? (value / total) * 100 : 0;
  return (
    <div className="sum">
      <div className="sum-top"><span>{label}</span><b>{value}/{total}</b></div>
      <div className="bar"><motion.i className={tone} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} /></div>
    </div>
  );
}

export default function WeekView({ monday, today, data, openMeal, openEvent, goDay }) {
  const days = weekDays(monday);
  let planned = 0, needBuy = 0, bought = 0;
  for (const d of days) for (const s of SLOTS) {
    const m = mealAt(data.meals, d, s.id);
    if (m?.dish) {
      planned++;
      if (!NO_SHOP.has(m.dish)) { needBuy++; if (m.shopping_ok) bought++; }
    }
  }
  return (
    <>
      <div className="summary">
        <Bar label="🍽️ Menú planificado" value={planned} total={days.length * SLOTS.length} tone="t-coral" />
        <Bar label="🛒 Compra lista" value={bought} total={needBuy} tone="t-green" />
      </div>
      <motion.div className="stack" variants={list} initial="hidden" animate="show">
        {days.map((d) => {
          const away = absentOn(data.absences, d);
          const evs = eventsOn(data.events, d);
          return (
            <motion.section key={d} variants={item} className={`day-card${d === today ? ' today' : ''}`}>
              <button type="button" className="dc-head" onClick={() => goDay(d)}>
                <span className="dc-num">{dayNum(d)}</span>
                <span className="dc-name">{weekdayName(d)}</span>
                {d === today && <span className="badge">Hoy</span>}
                <span className="grow" />
                {PARENTS.filter((p) => away.includes(p.id)).map((p) => (
                  <span key={p.id} className={`away-chip aw-${p.id}`}>{p.emoji} fuera</span>
                ))}
              </button>
              {SLOTS.map((s) => {
                const m = mealAt(data.meals, d, s.id);
                const buy = m?.dish && !NO_SHOP.has(m.dish) ? (m.shopping_ok ? 'ok' : 'pending') : null;
                return (
                  <button key={s.id} type="button" className={`meal-row${m?.dish ? '' : ' empty'}`} onClick={() => openMeal(d, s.id)}>
                    <span className="slot-ico" title={s.label}>{s.icon}</span>
                    <span className="mr-emoji">{m?.dish ? m.emoji : '＋'}</span>
                    <span className="mr-dish">{m?.dish || 'Sin planificar'}</span>
                    {m?.cook && <Avatar id={m.cook} size={24} />}
                    {buy && <span className={`buy-dot ${buy}`} title={buy === 'ok' ? 'Hay compra' : 'Falta compra'}>{buy === 'ok' ? '✓' : '🛒'}</span>}
                  </button>
                );
              })}
              {evs.length > 0 && (
                <div className="ev-list">
                  {evs.map((e) => (
                    <button key={e.id} type="button" className={`ev-chip k-${e.kind}`} onClick={() => openEvent(e, d)}>
                      <span>{e.emoji}</span>
                      <b>{hhmm(e.time)}</b>
                      <span className="ev-title">{e.title}</span>
                      {e.who && <em>{e.who}</em>}
                    </button>
                  ))}
                </div>
              )}
            </motion.section>
          );
        })}
      </motion.div>
    </>
  );
}
