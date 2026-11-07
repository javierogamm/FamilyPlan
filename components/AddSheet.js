'use client';
import { useMemo, useState } from 'react';
import { ABSENCE_NOTES, EVENT_EMOJIS, PARENTS } from '@/lib/constants';
import { buzz, hhmm, uid } from '@/lib/helpers';
import { ACTIVITIES, KIDS, kidsOf, personIcon, whoText } from '@/lib/icons';
import Sheet from './Sheet';
import { Pic } from './Pic';
import { PersonPick, Segmented, Switch } from './ui';

const TYPES = [
  { value: 'evento', label: '📌 Evento' },
  { value: 'extraescolar', label: '⚽ Extraesc.' },
  { value: 'ausencia', label: '🚫 Ausencia' },
];

/** `edit`: null (nuevo) | evento | ausencia. El componente se remonta con `key` en cada apertura. */
export default function AddSheet({ open, date, edit, save, onDelete, onClose }) {
  const isAbs = !!edit && 'person' in edit;
  const [type, setType] = useState(edit ? (isAbs ? 'ausencia' : edit.kind) : 'evento');
  const [title, setTitle] = useState(edit?.title ?? '');
  const [emoji, setEmoji] = useState(edit?.emoji ?? '📌');
  const [from, setFrom] = useState(edit?.date ?? edit?.start_date ?? date);
  const [to, setTo] = useState(edit?.end_date ?? date);
  const [time, setTime] = useState(hhmm(edit?.time));
  const [kids, setKids] = useState(kidsOf(edit?.who));
  const [activity, setActivity] = useState(edit?.activity ?? '');
  const [repeat, setRepeat] = useState(edit ? edit.repeat === 'weekly' : false);
  const [needsTransport, setNeedsTransport] = useState(!!edit?.needs_transport);
  const [transport, setTransport] = useState(edit?.transport ?? null);
  const [parent, setParent] = useState(edit?.person ?? 'papa');
  const [note, setNote] = useState(edit?.note ?? '');
  const abs = type === 'ausencia';
  const act = ACTIVITIES.find((a) => a.id === activity);
  const kidIcon = useMemo(() => Object.fromEntries(KIDS.map((k) => [k.id, personIcon(k.id)])), []);

  const changeType = (t) => {
    setType(t);
    if (t === 'extraescolar') { setRepeat(true); setNeedsTransport(true); if (emoji === '📌') setEmoji('⚽'); }
    if (t === 'evento') { setRepeat(false); setActivity(''); }
  };
  const pickActivity = (a) => {
    buzz();
    const same = activity === a?.id;
    const prev = ACTIVITIES.find((x) => x.id === activity);
    setActivity(same ? '' : a?.id ?? '');
    if (a && !same) {
      if (!title.trim() || title === prev?.label) setTitle(a.label);
      setEmoji(a.emoji);
    }
  };
  const toggleKid = (id) => { buzz(); setKids((k) => (k.includes(id) ? k.filter((x) => x !== id) : [...k, id])); };

  const valid = abs ? !!from : !!title.trim() && !!from;
  const submit = () => {
    if (!valid) return;
    buzz(15);
    if (abs) save('absences', { id: edit?.id ?? uid(), person: parent, start_date: from, end_date: to < from ? from : to, note: note.trim() });
    else
      save('events', {
        id: edit?.id ?? uid(), date: from, time: time || null, title: title.trim(), kind: type, who: whoText(kids),
        repeat: repeat ? 'weekly' : 'none', emoji, activity: type === 'extraescolar' ? activity : '',
        needs_transport: needsTransport, transport: needsTransport ? transport : null,
      });
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
          <PersonPick options={PARENTS} value={parent} onChange={(v) => v && setParent(v)} action={/trabaj/i.test(note) ? 'trabajar' : /viaj/i.test(note) ? 'viajar' : undefined} />
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
          {type === 'extraescolar' && (
            <>
              <h3 className="label">Actividad</h3>
              <div className="chips no-top">
                {ACTIVITIES.map((a) => (
                  <button key={a.id} type="button" className={`chip${activity === a.id ? ' on' : ''}`} onClick={() => pickActivity(a)}>{a.emoji} {a.label}</button>
                ))}
              </div>
            </>
          )}
          <h3 className="label">{type === 'extraescolar' ? 'Nombre' : '¿Qué es?'}</h3>
          <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={type === 'extraescolar' ? 'Ej.: Natación' : 'Ej.: Pediatra'} maxLength={80} autoFocus={!edit} />
          {!act && (
            <div className="emoji-row">
              {EVENT_EMOJIS.map((e) => <button key={e} type="button" className={e === emoji ? 'on' : ''} onClick={() => { buzz(); setEmoji(e); }}>{e}</button>)}
            </div>
          )}
          <div className="two">
            <label><h3 className="label">{repeat ? 'Desde el' : 'Día'}</h3><input type="date" className="field" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
            <label><h3 className="label">Hora</h3><input type="time" className="field" value={time} onChange={(e) => setTime(e.target.value)} /></label>
          </div>
          <h3 className="label">¿Para quién?</h3>
          <div className="people kids">
            {KIDS.map((k) => (
              <button key={k.id} type="button" className={`pp${kids.includes(k.id) ? ' on kid-on' : ''}`} onClick={() => toggleKid(k.id)}>
                <Pic icon={kidIcon[k.id]} size={64} animate={false} />
                <span>{k.label}</span>
              </button>
            ))}
          </div>
          <Switch checked={needsTransport} onChange={setNeedsTransport} label="Hay que llevar o recoger" hint="Asigna a Viero o Sonia y saldrá su icono" />
          {needsTransport && (
            <>
              <h3 className="label">🛵 ¿Quién lleva / recoge?</h3>
              <PersonPick options={PARENTS} action="transporte" value={transport} onChange={setTransport} />
            </>
          )}
          <Switch checked={repeat} onChange={setRepeat} label="Se repite cada semana" hint={repeat ? 'Mismo día de la semana, a partir de la fecha' : 'Solo este día'} />
        </>
      )}
    </Sheet>
  );
}
