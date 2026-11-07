'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { PARENTS, person } from '@/lib/constants';
import { dayNum, weekDays, weekdayName } from '@/lib/dates';
import { eventsOn, hhmm } from '@/lib/helpers';
import SwipeRow from './SwipeRow';

export default function AgendaView({ monday, today, selected, data, openEvent, openAbsence, openAdd, removeWithUndo }) {
  return (
    <div className="agenda">
      <p className="muted hint">Toca para editar · desliza a la izquierda para borrar</p>
      {weekDays(monday).map((d) => {
        const evs = eventsOn(data.events, d);
        const abs = data.absences.filter((a) => a.start_date <= d && d <= a.end_date);
        const empty = !evs.length && !abs.length;
        return (
          <section key={d} className={`ag-day${d === today ? ' today' : ''}${d === selected ? ' sel' : ''}`}>
            <div className="ag-head">
              <span className="ag-num">{dayNum(d)}</span>
              <span className="ag-name">{weekdayName(d)}</span>
              <span className="grow" />
              <button type="button" className="round sm" aria-label="Añadir" onClick={() => openAdd(d)}>＋</button>
            </div>
            <AnimatePresence initial={false}>
              {abs.map((a) => (
                <SwipeRow key={a.id} className={`ag-item abs aw-${a.person}`} onClick={() => openAbsence(a)} onDelete={() => removeWithUndo('absences', a)}>
                  <span className="ag-ico">{person(a.person).emoji}</span>
                  <span className="ag-main"><b>{person(a.person).label} ausente</b>{a.note && <small>{a.note}</small>}</span>
                  {a.start_date !== a.end_date && <em>{a.start_date.slice(8)}/{a.start_date.slice(5, 7)} → {a.end_date.slice(8)}/{a.end_date.slice(5, 7)}</em>}
                </SwipeRow>
              ))}
              {evs.map((e) => (
                <SwipeRow key={e.id} className={`ag-item k-${e.kind}`} onClick={() => openEvent(e)} onDelete={() => removeWithUndo('events', e)}>
                  <span className="ag-ico">{e.emoji}</span>
                  <span className="ag-main"><b>{e.title}</b><small>{[e.kind === 'extraescolar' ? 'Extraescolar' : 'Evento', e.who, e.repeat === 'weekly' ? '🔁 semanal' : ''].filter(Boolean).join(' · ')}</small></span>
                  <em>{hhmm(e.time) || 'Todo el día'}</em>
                </SwipeRow>
              ))}
            </AnimatePresence>
            {empty && <p className="ag-empty">Sin planes</p>}
          </section>
        );
      })}
    </div>
  );
}
