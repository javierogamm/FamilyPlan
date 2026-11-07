'use client';
import { AnimatePresence } from 'framer-motion';
import { person } from '@/lib/constants';
import { dayNum, weekDays, weekdayName } from '@/lib/dates';
import { buzz, eventsOn, hhmm } from '@/lib/helpers';
import { absenceIcon, eventIcons, personIcon } from '@/lib/icons';
import { Pic, PicStack } from './Pic';
import SwipeRow from './SwipeRow';

const CYCLE = [null, 'papa', 'mama'];

export default function AgendaView({ save, monday, today, selected, data, me, openEvent, openAbsence, openAdd, openSeries, removeWithUndo }) {
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
                    <Pic icon={absenceIcon(a)} size={52} animate={false} />
                    <span className="ag-main"><b>{person(a.person).label} {a.kind === 'viaje' ? 'de viaje' : a.kind === 'trabajo' ? 'trabajando' : 'ausente'}</b>{a.note && <small>{a.note}</small>}</span>
                    {a.start_date !== a.end_date && <em>{a.start_date.slice(8)}/{a.start_date.slice(5, 7)} → {a.end_date.slice(8)}/{a.end_date.slice(5, 7)}</em>}
                  </SwipeRow>
                ))}
                {evs.map((e) => {
                  const icons = eventIcons(e);
                  return (
                    <SwipeRow key={e.id} className={`ag-item k-${e.kind}`} onClick={() => openEvent(e)} onDelete={() => removeWithUndo('events', e)}>
                      {icons.length ? <PicStack icons={icons} size={52} /> : <span className="ag-ico">{e.emoji}</span>}
                      <span className="ag-main">
                        <b>{e.title}</b>
                        <small>{[e.kind === 'extraescolar' ? `Extraescolar ${e.location === 'school' ? '🏫 cole' : '📍 fuera'}` : 'Evento', e.who, e.repeat === 'weekly' ? '🔁 semanal' : e.series_id ? '🔁 serie' : ''].filter(Boolean).join(' · ')}</small>
                      </span>
                      <em>{hhmm(e.time) || 'Todo el día'}</em>
                      {e.needs_transport && (
                        <button type="button" className={`tr-btn${e.transport ? ' set' : ''}`} aria-label="Asignar quién lleva o recoge" onClick={(ev) => { ev.stopPropagation(); cycleTransport(e); }}>
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
