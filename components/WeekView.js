'use client';
import { motion } from 'framer-motion';
import { COOK_WHEN_TAG, SLOTS, person } from '@/lib/constants';
import { dayNum, relativeLabel, weekDays, weekdayName } from '@/lib/dates';
import { absLabel, absenceAt, awayList, eventsOn, hhmm, hasDishes, isPlanned, isSuggested, mealAt, mealEmoji, mealName } from '@/lib/helpers';
import { absenceIcon, personIcon, eventIcons } from '@/lib/icons';
import { Pic, PicStack } from './Pic';

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
  let planned = 0, done = 0;
  for (const d of days) for (const s of SLOTS) {
    const m = mealAt(data.meals, d, s.id);
    if (isPlanned(m)) { planned++; if (m.done) done++; }
  }
  const trips = data.shopping.filter((t) => t.date && days.includes(t.date));
  const tripsDone = trips.filter((t) => t.done).length;
  return (
    <>
      <div className="summary">
        <Bar label="🍽️ Menú planificado" value={planned} total={days.length * SLOTS.length} tone="t-coral" />
        <Bar label="🍽️ Comidas hechas" value={done} total={planned} tone="t-sun" />
        <Bar label="🛒 Compras de la semana" value={tripsDone} total={trips.length} tone="t-green" />
      </div>
      <motion.div className="stack" variants={list} initial="hidden" animate="show">
        {days.map((d) => {
          const away = awayList(data.absences, d);
          const evs = eventsOn(data.events, d);
          return (
            <motion.section key={d} variants={item} className={`day-card${d === today ? ' today' : ''}`}>
              <button type="button" className="dc-head" onClick={() => goDay(d)}>
                <span className="dc-num">{dayNum(d)}</span>
                <span className="dc-name">{weekdayName(d)}</span>
                {d === today && <span className="badge">Hoy</span>}
                <span className="grow" />
                {away.map((a) => (
                  <span key={a.id} className={`away-chip aw-${a.person}`}><Pic icon={absenceIcon(a)} size={30} animate={false} />{absLabel(a, d)}</span>
                ))}
              </button>
              {SLOTS.map((s) => {
                const m = mealAt(data.meals, d, s.id);
                const buy = isPlanned(m) && !m.done && m.needs_buy;
                return (
                  <button key={s.id} type="button" className={`meal-row${hasDishes(m) ? '' : ' empty'}${m?.done ? ' done' : ''}${isSuggested(m) ? ' suggested' : ''}`} onClick={() => openMeal(d, s.id)}>
                    <span className="slot-ico" title={s.label}>{s.icon}</span>
                    <span className="mr-emoji">{hasDishes(m) ? mealEmoji(m) : '＋'}</span>
                    <span className="mr-dish">{hasDishes(m) ? mealName(m) : 'Sin planificar'}</span>
                    {isSuggested(m) && <span className="sug-chip">💡 {person(m.suggested_by)?.label || 'Sugerido'}</span>}
                    {m?.done && <span className="done-chip">✓ Hecha</span>}
                    {m?.cook && <Pic icon={personIcon(m.cook === 'otros' ? null : m.cook, 'cocinar')} size={40} animate={false} className="row-pic" />}
                    {isPlanned(m) && !m.done && m.cook_when && m.cook_when !== 'same' && <span className="when-ico" title={COOK_WHEN_TAG[m.cook_when]}>{m.cook_when === 'eve' ? '🌙' : '📅'}</span>}
                    {buy && <span className="buy-dot pending" title="Hay que comprar">🛒</span>}
                  </button>
                );
              })}
              {evs.length > 0 && (
                <div className="ev-list">
                  {evs.map((e) => (
                    <button key={e.id} type="button" className={`ev-chip k-${e.kind}${e.needs_transport ? ' tr-need' : ''}${e.needs_transport && e.transport && absenceAt(data.absences, e.transport, d, hhmm(e.time)) ? ' conflict' : ''}`} onClick={() => openEvent(e, d)}>
                      {eventIcons(e).length ? <PicStack icons={eventIcons(e)} size={30} /> : <span>{e.emoji}</span>}
                      <b>{hhmm(e.time)}</b>
                      {e.needs_transport && <span className={`tr-tag${e.transport ? ' set' : ''}`}>{e.transport ? <Pic icon={personIcon(e.transport, 'transporte')} size={30} animate={false} /> : '🛵?'}</span>}
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
