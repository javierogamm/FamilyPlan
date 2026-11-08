'use client';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { person } from '@/lib/constants';
import { dayNum, isWeekend, weekDays, weekdayName } from '@/lib/dates';
import { absLabel, absenceAt, buzz, eventsOn, hhmm, mealName } from '@/lib/helpers';
import { absenceIcon, eventIcons, personIcon } from '@/lib/icons';
import { agendaTasks } from '@/lib/tasks';
import { Pic, PicStack } from './Pic';
import SwipeRow from './SwipeRow';

const CYCLE = [null, 'papa', 'mama'];

export default function AgendaView({ save, monday, today, selected, data, me, openMeal, openShop, openList, openEvent, openAbsence, openAdd, openSeries, removeWithUndo }) {
  const [mine, setMine] = useState(false);
  const [showPast, setShowPast] = useState(false);
  const nowD = new Date();
  const nowHHMM = `${String(nowD.getHours()).padStart(2, '0')}:${String(nowD.getMinutes()).padStart(2, '0')}`;
  const cycleTransport = (e) => {
    buzz(12);
    save('events', { ...e, transport: CYCLE[(CYCLE.indexOf(e.transport ?? null) + 1) % CYCLE.length] });
  };
  return (
    <div className="agenda-wrap">
      <div className="quick-row">
        <button type="button" className={`quick${mine ? ' on' : ''}`} onClick={() => setMine((v) => !v)}>👤 Solo lo mío</button>
        <button type="button" className="quick" onClick={() => openSeries()}>🎒 Extraescolares</button>
        <button type="button" className="quick" onClick={() => openAdd(selected, null, { type: 'ausencia', kind: 'viaje' })}>✈️ Me voy de viaje</button>
        <button type="button" className="quick" onClick={() => openAdd(selected, null, { type: 'ausencia', kind: 'trabajo' })}>💻 Estoy trabajando</button>
      </div>
      <p className="muted hint">Desliza ← → para ver otros días · toca para editar · desliza una fila para borrarla</p>
      <div className="agenda">
        {weekDays(monday, 7).map((d) => {
          const allEv = eventsOn(data.events, d);
          // lo ya pasado de hoy se pliega para no ensuciar
          const pastEv = d === today ? allEv.filter((e) => e.time && hhmm(e.time) < nowHHMM) : [];
          const evs = allEv.filter((e) => !pastEv.includes(e));
          const shown = showPast ? [...pastEv, ...evs] : evs;
          const abs = data.absences.filter((a) => a.start_date <= d && d <= a.end_date);
          const tasks = agendaTasks(data, d, today).filter((t) => !mine || !t.person || t.person === me);
          const empty = !evs.length && !pastEv.length && !abs.length && !tasks.length;
          return (
            <section key={d} className={`ag-day${d === today ? ' today' : ''}${d === selected ? ' sel' : ''}${isWeekend(d) ? ' weekend' : ''}`}>
              <div className="ag-head">
                <span className="ag-num">{dayNum(d)}</span>
                <span className="ag-name">{weekdayName(d)}</span>
                <span className="grow" />
                <button type="button" className="round sm" aria-label="Añadir" onClick={() => openAdd(d)}>＋</button>
              </div>
              {tasks.length > 0 && (
                <div className="task-list">
                  {tasks.map((t) => {
                    const icon = t.person && t.person !== 'otros' ? personIcon(t.person, t.type === 'cook' ? 'cocinar' : 'comprar') : null;
                    const bad = t.person && t.person !== 'otros' && !t.done ? absenceAt(data.absences, t.person, d, null) : null;
                    const open = () => (t.type === 'cook' ? openMeal(t.meal.date, t.meal.slot) : t.type === 'buy' ? (t.task.list_id ? openList(t.task.list_id) : openShop({ edit: t.task })) : openShop({ prefill: { items: mealName(t.meal), date: d } }));
                    const toggle = () => {
                      buzz(18);
                      if (t.type === 'cook') save('meals', { ...t.meal, done: !t.meal.done });
                      else if (t.type === 'buy') save('shopping', { ...t.task, done: !t.task.done });
                      else save('meals', { ...t.meal, needs_buy: false });
                    };
                    const assign = () => {
                      buzz(12);
                      if (t.type === 'cook') save('meals', { ...t.meal, cook: CYCLE[(CYCLE.indexOf(t.meal.cook ?? null) + 1) % CYCLE.length] });
                      else if (t.type === 'buy') save('shopping', { ...t.task, shopper: CYCLE[(CYCLE.indexOf(t.task.shopper ?? null) + 1) % CYCLE.length] });
                      else open();
                    };
                    return (
                      <div key={t.key} className={`task t-${t.type === 'cook' ? 'cook' : 'buy'}${t.person && t.person === me ? ' mine' : ''}${bad ? ' conflict' : ''}${t.done ? ' is-done' : ''}`}>
                        <button type="button" className={`check${t.done ? ' on' : ''}`} aria-label={t.done ? 'Marcar pendiente' : 'Marcar hecha'} onClick={toggle}>{t.done ? '✓' : ''}</button>
                        <button type="button" className="task-main" onClick={open}>
                          <span className="ag-ico">{t.emoji}</span>
                          <span className="ag-main">
                            <small className="task-kind">{t.type === 'cook' ? '🍳 Cocinar' : t.type === 'buy' ? '🛒 Comprar en' : '🛒 Comprar para'}{t.person && t.person === me ? ' · te toca a ti' : ''}</small>
                            <b>{t.title}</b>
                            <small>{t.sub}</small>
                            {bad && <small className="conf-text">🚨 {person(t.person).label} está {absLabel(bad, d)}</small>}
                          </span>
                        </button>
                        {t.type === 'buy' && t.task.list_id && <button type="button" className="task-edit" aria-label="Editar la compra" onClick={() => openShop({ edit: t.task })}>✏️</button>}
                        <button type="button" className={`tr-btn${t.person ? ' set' : ''}${bad ? ' conflict' : ''}`} aria-label="Asignar responsable" onClick={assign}>
                          {icon ? <Pic key={t.person} icon={icon} size={52} /> : t.person === 'otros' ? <span className="as-emoji">🧑‍🍳</span> : <span className="tr-empty">{t.type === 'cook' ? '🍳' : '🛒'}<b>?</b></span>}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              {pastEv.length > 0 && <button type="button" className="past-toggle" onClick={() => setShowPast((v) => !v)}>🕘 {showPast ? 'Ocultar lo de antes' : `Ya pasado hoy (${pastEv.length})`}</button>}
              <AnimatePresence initial={false}>
                {abs.map((a) => (
                  <SwipeRow key={a.id} className={`ag-item abs aw-${a.person}`} onClick={() => openAbsence(a)} onDelete={() => removeWithUndo('absences', a)}>
                    <Pic icon={absenceIcon(a)} size={52} animate={false} />
                    <span className="ag-main"><b>{person(a.person).label} {absLabel(a, d)}</b>{a.note && <small>{a.note}</small>}</span>
                    {a.start_date !== a.end_date && <em>{a.start_date.slice(8)}/{a.start_date.slice(5, 7)} → {a.end_date.slice(8)}/{a.end_date.slice(5, 7)}</em>}
                  </SwipeRow>
                ))}
                {shown.map((e) => {
                  const icons = eventIcons(e);
                  const bad = e.needs_transport && e.transport ? absenceAt(data.absences, e.transport, d, hhmm(e.time)) : null;
                  return (
                    <SwipeRow key={e.id} className={`ag-item k-${e.kind}${e.needs_transport ? ' tr-need' : ''}${bad ? ' conflict' : ''}${pastEv.includes(e) ? ' past' : ''}`} onClick={() => openEvent(e)} onDelete={() => removeWithUndo('events', e)}>
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
