'use client';
import { DAY_SHORT } from '@/lib/dates';
import { hhmm } from '@/lib/helpers';
import { eventIcons, personIcon } from '@/lib/icons';
import { seriesGroups } from '@/lib/series';
import Sheet from './Sheet';
import { Pic, PicStack } from './Pic';

export default function SeriesList({ open, today, events, onNew, onEdit, onDelete, onClose }) {
  const groups = seriesGroups(events, today);
  return (
    <Sheet open={open} onClose={onClose} title="🎒 Extraescolares" footer={<button type="button" className="btn primary grow" onClick={onNew}>＋ Nueva extraescolar</button>}>
      {groups.length === 0 && <p className="muted pad">Aún no hay extraescolares recurrentes. Crea una y se generarán los eventos de todo el curso.</p>}
      <div className="series-list">
        {groups.map((g) => {
          const e = g.rep;
          const icons = eventIcons(e);
          return (
            <div key={g.id} className="series-item">
              <button type="button" className="si-main" onClick={() => onEdit(g)}>
                {icons.length ? <PicStack icons={icons} size={52} /> : <span className="ag-ico">{e.emoji}</span>}
                <span className="ag-main">
                  <b>{e.title}</b>
                  <small>{g.days.map((d) => DAY_SHORT[d - 1]).join(' · ')}{e.time ? ` · ${hhmm(e.time)}` : ''} · {e.location === 'school' ? '🏫 Cole' : '📍 Fuera'}</small>
                  <small>{e.who || 'Sin niños'} · {g.upcoming.length} próximos</small>
                </span>
                {e.needs_transport && (e.transport ? <Pic icon={personIcon(e.transport, 'transporte')} size={44} animate={false} /> : <span className="tr-empty small">🛵<b>?</b></span>)}
              </button>
              <button type="button" className="btn ghost danger sm" onClick={() => onDelete(g)}>Borrar</button>
            </div>
          );
        })}
      </div>
    </Sheet>
  );
}
