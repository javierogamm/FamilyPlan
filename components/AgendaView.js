'use client';
import { AnimatePresence } from 'framer-motion';
import { SLOTS, person } from '@/lib/constants';
import { addDays, dayNum, fromISO, weekDays, weekdayName } from '@/lib/dates';
import { absLabel, absenceAt, buzz, eventsOn, hhmm, isPlanned, mealAt, mealEmoji, mealName } from '@/lib/helpers';
import { absenceIcon, eventIcons, personIcon } from '@/lib/icons';
import { Pic, PicStack } from './Pic';
import SwipeRow from './SwipeRow';

const CYCLE = [null, 'papa', 'mama'];

/** Platos de la semana siguiente marcados para cocinar el fin de semana (sábado: todos; domingo: solo pendientes). */
function weekendCooking(meals, d) {
  const dow = fromISO(d).getDay();
  if (dow !== 6 && dow !== 0) return [];
  const mon = addDays(d, dow === 6 ? 2 : 1);
  const list = [];
  for (let i = 0; i < 5; i++) for (const s of SLOTS) {
    const m = mealAt(meals, addDays(mon, i), s.id);
    if (isPlanned(m) && m.cook_when === 'weekend' && (dow === 6 || !m.done)) list.push({ m, slot: s });
  }
  return list;
}

export default function AgendaView({ save, monday, today, selected, data, me, openMeal, openEvent, openAbsence, openAdd, openSeries, removeWithUndo }) {
  const cycleTransport = (e) => {
    buzz(12);
    save('events', { ...e, transport: CYCLE[(CYCLE.indexOf(e.transport ?? null) + 1) % CYCLE.length] });
  };
  return (
    <div className="agenda-wrap">
      <div className="quick-row">
        <button type="button" className="quick" onClick={() => openSeries()}>🎒 Extraescolares</button>
        <button type="button" className="quick" onClick={() => openAdd(selected, null, { type: 'ausencia', kind: 'viaje' })}>✈️ Me voy de viaje</button>
        <button type="button" className="quick" onClick={() => openAdd(selected, null, { type: 'ausencia', kind: 'trabajo' })}>💻 Estoy trabajando</button>
      </div>
      <p className="muted hint">Toca para editar · desliza a la izquierda para borrar · toca el icono 🛵 para asignar quién lleva</p>
      <div className="agenda">
        {weekDays(monday, 7).map((d) => {
          const evs = eventsOn(data.events, d);
          const abs = data.absences.filter((a) => a.start_date <= d && d <= a.end_date);
          const cook = weekendCooking(data.meals, d);
          const empty = !evs.length && !abs.length && !cook.length;
          return (
            <section key={d} className={`ag-day${d === today ? ' today' : ''}${d === selected ? ' sel' : ''}`}>
              <div className="ag-head">
                <span className="ag-num">{dayNum(d)}</span>
                <span className="ag-name">{weekdayName(d)}</span>
                <span className="grow" />
                <button type="button" className="round sm" aria-label="Añadir" onClick={() => openAdd(d)}>＋</button>
              </div>
              {cook.length > 0 && (
                <div className="cook-block">
                  <h4>🍳 Cocinar este finde <small>para la semana que viene</small></h4>
                  {cook.map(({ m, slot }) => (
                    <div key={m.date + m.slot} className={`cook-item${m.done ? ' is-done' : ''}${m.cook && m.cook === me ? ' mine' : ''}`}>
                      <button type="button" className={`check${m.done ? ' on' : ''}`} aria-label={m.done ? 'Marcar pendiente' : 'Marcar hecha'} onClick={() => { buzz(18); save('meals', { ...m, done: !m.done }); }}>{m.done ? '✓' : ''}</button>
                      <button type="button" className="ck-main" onClick={() => openMeal(m.date, m.slot)}>
                        <span className="ag-ico">{mealEmoji(m)}</span>
                        <span className="ag-main"><b>{mealName(m)}</b><small>{weekdayName(m.date)} · {slot.label.toLowerCase()}{m.cook === me ? ' · te toca a ti' : ''}</small></span>
                        {m.cook ? <Pic icon={personIcon(m.cook === 'otros' ? null : m.cook, 'cocinar')} size={48} animate={false} /> : <span className="tr-empty small">🍳<b>?</b></span>}
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <AnimatePresence initial={false}>
                {abs.map((a) => (
                  <SwipeRow key={a.id} className={`ag-item abs aw-${a.person}`} onClick={() => openAbsence(a)} onDelete={() => removeWithUndo('absences', a)}>
                    <Pic icon={absenceIcon(a)} size={52} animate={false} />
                    <span className="ag-main"><b>{person(a.person).label} {absLabel(a, d)}</b>{a.note && <small>{a.note}</small>}</span>
                    {a.start_date !== a.end_date && <em>{a.start_date.slice(8)}/{a.start_date.slice(5, 7)} → {a.end_date.slice(8)}/{a.end_date.slice(5, 7)}</em>}
                  </SwipeRow>
                ))}
                {evs.map((e) => {
                  const icons = eventIcons(e);
                  const bad = e.needs_transport && e.transport ? absenceAt(data.absences, e.transport, d, hhmm(e.time)) : null;
                  return (
                    <SwipeRow key={e.id} className={`ag-item k-${e.kind}${e.needs_transport ? ' tr-need' : ''}${bad ? ' conflict' : ''}`} onClick={() => openEvent(e)} onDelete={() => removeWithUndo('events', e)}>
                      {icons.length ? <PicStack icons={icons} size={52} /> : <span className="ag-ico">{e.emoji}</span>}
                      <span className="ag-main">
                        <b>{e.title}</b>
                        <small>{[e.kind === 'extraescolar' ? `Extraescolar ${e.location === 'school' ? '🏫 cole' : '📍 fuera'}` : 'Evento', e.who, e.repeat === 'weekly' ? '🔁 semanal' : e.series_id ? '🔁 serie' : ''].filter(Boolean).join(' · ')}</small>
                        {bad && <small className="conf-text">🚨 {person(e.transport).label} está {absLabel(bad, d)}</small>}
                      </span>
                      <em>{hhmm(e.time) || 'Todo el día'}</em>
                      {e.needs_transport && (
                        <button type="button" className={`tr-btn${e.transport ? ' set' : ''}${bad ? ' conflict' : ''}`} aria-label="Asignar quién lleva o recoge" onClick={(ev) => { ev.stopPropagation(); cycleTransport(e); }}>
                          {e.transport ? <Pic key={e.transport} icon={personIcon(e.transport, 'transporte')} size={52} /> : <span className="tr-empty">🛵<b>?</b></span>}
                        </button>
                      )}
                    </SwipeRow>
                  );
                })}
              </AnimatePresence>
              {empty && <p className="ag-empty">Sin planes</p>}
            </section>
          );
        })}
      </div>
    </div>
  );
}
