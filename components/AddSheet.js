'use client';
import { useMemo, useState } from 'react';
import { ABSENCE_NOTES, EVENT_EMOJIS, PARENTS } from '@/lib/constants';
import { addDays } from '@/lib/dates';
import { buzz, hhmm, uid } from '@/lib/helpers';
import Sheet from './Sheet';
import { Segmented, Switch } from './ui';

const TYPES = [
  { value: 'evento', label: '📌 Evento' },
  { value: 'extraescolar', label: '⚽ Extraesc.' },
  { value: 'ausencia', label: '🚫 Ausencia' },
];

/** `edit`: null (nuevo) | evento | ausencia. El componente se remonta con `key` en cada apertura. */
export default function AddSheet({ open, date, edit, data, save, onDelete, onClose }) {
  const isAbs = !!edit && 'person' in edit;
  const [type, setType] = useState(edit ? (isAbs ? 'ausencia' : edit.kind) : 'evento');
  const [title, setTitle] = useState(edit?.title ?? '');
  const [emoji, setEmoji] = useState(edit?.emoji ?? '📌');
  const [from, setFrom] = useState(edit?.date ?? edit?.start_date ?? date);
  const [to, setTo] = useState(edit?.end_date ?? date);
  const [time, setTime] = useState(hhmm(edit?.time));
  const [who, setWho] = useState(edit?.who ?? '');
  const [repeat, setRepeat] = useState(edit ? edit.repeat === 'weekly' : false);
  const [parent, setParent] = useState(edit?.person ?? 'papa');
  const [note, setNote] = useState(edit?.note ?? '');
  const abs = type === 'ausencia';
  const names = useMemo(() => [...new Set(data.events.map((e) => e.who).filter(Boolean))].slice(0, 6), [data.events]);

  const changeType = (t) => {
    setType(t);
    if (t === 'extraescolar') { setRepeat(true); if (emoji === '📌') setEmoji('⚽'); }
    if (t === 'evento') setRepeat(false);
  };
  const valid = abs ? !!from : !!title.trim() && !!from;
  const submit = () => {
    if (!valid) return;
    buzz(15);
    if (abs) save('absences', { id: edit?.id ?? uid(), person: parent, start_date: from, end_date: to < from ? from : to, note: note.trim() });
    else save('events', { id: edit?.id ?? uid(), date: from, time: time || null, title: title.trim(), kind: type, who: who.trim(), repeat: repeat ? 'weekly' : 'none', emoji });
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={edit ? 'Editar' : 'Añadir a la agenda'}
      footer={
        <>
          {edit && <button type="button" className="btn ghost danger" onClick={() => { onDelete(edit); onClose(); }}>Borrar</button>}
          <button type="button" className="btn primary grow" disabled={!valid} onClick={submit}>{edit ? 'Guardar' : 'Añadir'}</button>
        </>
      }
    >
      {!edit && <Segmented name="type" value={type} onChange={changeType} options={TYPES} />}

      {abs ? (
        <>
          <h3 className="label">¿Quién no está?</h3>
          <div className="people">
            {PARENTS.map((p) => (
              <button key={p.id} type="button" className={`pp pp-${p.id}${parent === p.id ? ' on' : ''}`} onClick={() => { buzz(); setParent(p.id); }}>
                <span className="pp-emoji">{p.emoji}</span><span>{p.label}</span>
              </button>
            ))}
          </div>
          <div className="two">
            <label><h3 className="label">Desde</h3><input type="date" className="field" value={from} onChange={(e) => { setFrom(e.target.value); if (to < e.target.value) setTo(e.target.value); }} /></label>
            <label><h3 className="label">Hasta</h3><input type="date" className="field" value={to} min={from} onChange={(e) => setTo(e.target.value)} /></label>
          </div>
          <h3 className="label">Motivo</h3>
          <input className="field" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Opcional" maxLength={120} />
          <div className="chips">
            {ABSENCE_NOTES.map((n) => <button key={n} type="button" className="chip" onClick={() => setNote(n)}>{n}</button>)}
          </div>
        </>
      ) : (
        <>
          <h3 className="label">¿Qué es?</h3>
          <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={type === 'extraescolar' ? 'Ej.: Natación' : 'Ej.: Pediatra'} maxLength={80} autoFocus={!edit} />
          <div className="emoji-row">
            {EVENT_EMOJIS.map((e) => <button key={e} type="button" className={e === emoji ? 'on' : ''} onClick={() => { buzz(); setEmoji(e); }}>{e}</button>)}
          </div>
          <div className="two">
            <label><h3 className="label">{repeat ? 'Desde el' : 'Día'}</h3><input type="date" className="field" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
            <label><h3 className="label">Hora</h3><input type="time" className="field" value={time} onChange={(e) => setTime(e.target.value)} /></label>
          </div>
          <h3 className="label">¿Para quién?</h3>
          <input className="field" value={who} onChange={(e) => setWho(e.target.value)} placeholder="Ej.: Lucía (opcional)" maxLength={60} />
          {names.length > 0 && <div className="chips">{names.map((n) => <button key={n} type="button" className="chip" onClick={() => setWho(n)}>{n}</button>)}</div>}
          <Switch checked={repeat} onChange={setRepeat} label="Se repite cada semana" hint={repeat ? 'Mismo día de la semana, a partir de la fecha' : 'Solo este día'} />
        </>
      )}
    </Sheet>
  );
}
