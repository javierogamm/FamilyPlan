'use client';
import { useState } from 'react';
import { PARENTS } from '@/lib/constants';
import { DAY_SHORT, addDays } from '@/lib/dates';
import { buzz, hhmm, uid } from '@/lib/helpers';
import { ACTIVITIES, KIDS, kidsOf, personIcon, whoText } from '@/lib/icons';
import { buildSeriesEvents, schoolYearEnd, seriesDates } from '@/lib/series';
import IconPicker from './IconPicker';
import Sheet from './Sheet';
import { Pic } from './Pic';
import { PersonPick, Segmented, Switch } from './ui';

const LOCATIONS = [{ value: 'school', label: '🏫 En el cole' }, { value: 'outside', label: '📍 Fuera' }];

/** Crea o edita una extraescolar recurrente: genera un evento por cada día entre las fechas. `edit` = grupo de lib/series. */
export default function SeriesSheet({ open, today, edit, saveMany, removeSeries, onClose }) {
  const rep = edit?.rep;
  const [title, setTitle] = useState(rep?.title ?? '');
  const [icon, setIcon] = useState(rep?.icon ?? '');
  const [activity, setActivity] = useState(rep?.activity ?? '');
  const [emoji, setEmoji] = useState(rep?.emoji ?? '⚽');
  const [kids, setKids] = useState(kidsOf(rep?.who));
  const [days, setDays] = useState(edit ? edit.days : []);
  const [time, setTime] = useState(hhmm(rep?.time));
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(edit?.last ?? schoolYearEnd(today));
  const [location, setLocation] = useState(rep?.location ?? 'outside');
  const [needsTransport, setNeedsTransport] = useState(rep ? !!rep.needs_transport : true);
  const [transport, setTransport] = useState(rep?.transport ?? null);

  const toggleKid = (id) => { buzz(); setKids((k) => (k.includes(id) ? k.filter((x) => x !== id) : [...k, id])); };
  const toggleDay = (n) => { buzz(); setDays((d) => (d.includes(n) ? d.filter((x) => x !== n) : [...d, n])); };
  const pick = (p) => {
    setIcon(p.icon); setActivity(p.activity);
    if (p.emoji) setEmoji(p.emoji);
    if (p.kids && !kids.length) setKids(p.kids);
    const act = ACTIVITIES.find((a) => a.id === p.activity);
    if (act && !title.trim()) setTitle(act.label);
  };

  const start = from > today ? from : today;
  const dates = seriesDates(start, to, days);
  const valid = title.trim() && dates.length > 0;
  const outside = location === 'outside';

  const submit = () => {
    if (!valid) return;
    buzz(20);
    const id = edit?.id ?? uid();
    const prev = new Map();
    if (edit) {
      for (const e of edit.events) if (e.date >= start) prev.set(e.date, e.transport);
      removeSeries(id, start);
    }
    const f = { title: title.trim(), icon, activity, emoji, who: whoText(kids), time, location, needsTransport: outside && needsTransport, transport };
    saveMany('events', buildSeriesEvents(id, f, dates, prev));
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={edit ? 'Editar extraescolar' : 'Nueva extraescolar'}
      footer={<button type="button" className="btn primary grow" disabled={!valid} onClick={submit}>{edit ? 'Guardar y regenerar' : `Crear ${dates.length ? `(${dates.length} eventos)` : ''}`}</button>}
    >
      <h3 className="label">¿Para quién?</h3>
      <div className="people kids">
        {KIDS.map((k) => (
          <button key={k.id} type="button" className={`pp${kids.includes(k.id) ? ' on kid-on' : ''}`} onClick={() => toggleKid(k.id)}>
            <Pic icon={personIcon(k.id)} size={64} animate={false} /><span>{k.label}</span>
          </button>
        ))}
      </div>
      <h3 className="label">Icono</h3>
      <IconPicker kids={kids} icon={icon} emoji={emoji} onPick={pick} />
      <h3 className="label">Nombre</h3>
      <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej.: Karate" maxLength={80} />
      <h3 className="label">Días de la semana</h3>
      <div className="day-pick">
        {DAY_SHORT.map((l, i) => <button key={l} type="button" className={days.includes((i + 1) % 7) ? 'on' : ''} onClick={() => toggleDay((i + 1) % 7)}>{l}</button>)}
      </div>
      <div className="two">
        <label><h3 className="label">Hora</h3><input type="time" className="field" value={time} onChange={(e) => setTime(e.target.value)} /></label>
        <label><h3 className="label">Desde</h3><input type="date" className="field" value={from} min={today} onChange={(e) => setFrom(e.target.value)} /></label>
      </div>
      <label><h3 className="label">Hasta (fin del curso)</h3><input type="date" className="field" value={to} min={from} onChange={(e) => setTo(e.target.value)} /></label>
      <h3 className="label">¿Dónde es?</h3>
      <Segmented name="loc" value={location} onChange={setLocation} options={LOCATIONS} />
      {outside && (
        <>
          <Switch checked={needsTransport} onChange={setNeedsTransport} label="Requiere transporte" hint="Hay que llevar y/o recoger a los niños" />
          {needsTransport && (
            <>
              <h3 className="label">🛵 ¿Quién los lleva por defecto?</h3>
              <PersonPick options={PARENTS} action="transporte" value={transport} onChange={setTransport} />
              <p className="muted hint left">Luego puedes cambiar quién lleva cada día desde la agenda.</p>
            </>
          )}
        </>
      )}
      {dates.length === 0 && <p className="form-error pad">Elige al menos un día y un rango de fechas válido.</p>}
    </Sheet>
  );
}
