'use client';
import { useMemo, useState } from 'react';
import { EVENT_EMOJIS, PARENTS } from '@/lib/constants';
import { buzz, hhmm, uid } from '@/lib/helpers';
import { KIDS, kidsOf, personIcon, whoText, ACTIVITIES } from '@/lib/icons';
import IconPicker from './IconPicker';
import Sheet from './Sheet';
import { Pic } from './Pic';
import { PersonPick, Segmented, Switch } from './ui';

const TYPES = [
  { value: 'evento', label: '📌 Evento' },
  { value: 'extraescolar', label: '⚽ Extraesc.' },
  { value: 'ausencia', label: '🧳 Viaje / trabajo' },
];
const ABS_KINDS = [
  { value: 'viaje', label: '✈️ De viaje' },
  { value: 'trabajo', label: '💻 Trabajando' },
  { value: 'otro', label: '🚫 Otro' },
];
const ACTION = { viaje: 'viajar', trabajo: 'trabajar' };
const LOCATIONS = [{ value: 'school', label: '🏫 En el cole' }, { value: 'outside', label: '📍 Fuera' }];

/** `edit`: null | evento | ausencia. `preset`: {type, kind}. Se remonta con `key` en cada apertura. */
export default function AddSheet({ open, date, edit, preset, me, save, onDelete, onClose }) {
  const isAbs = !!edit && 'person' in edit;
  const [type, setType] = useState(edit ? (isAbs ? 'ausencia' : edit.kind) : preset?.type ?? 'evento');
  const [title, setTitle] = useState(edit?.title ?? '');
  const [emoji, setEmoji] = useState(edit?.emoji ?? '📌');
  const [icon, setIcon] = useState(edit?.icon ?? '');
  const [activity, setActivity] = useState(edit?.activity ?? '');
  const [from, setFrom] = useState(edit?.date ?? edit?.start_date ?? date);
  const [to, setTo] = useState(edit?.end_date ?? date);
  const [time, setTime] = useState(hhmm(edit?.time));
  const [kids, setKids] = useState(kidsOf(edit?.who));
  const [repeat, setRepeat] = useState(edit ? edit.repeat === 'weekly' : false);
  const [location, setLocation] = useState(edit?.location ?? 'outside');
  const [needsTransport, setNeedsTransport] = useState(!!edit?.needs_transport);
  const [transport, setTransport] = useState(edit?.transport ?? null);
  const [parent, setParent] = useState(edit?.person ?? (me === 'mama' ? 'mama' : 'papa'));
  const [absKind, setAbsKind] = useState(edit?.kind ?? preset?.kind ?? 'viaje');
  const [note, setNote] = useState(edit?.note ?? '');
  const [startTime, setStartTime] = useState(hhmm(edit?.start_time));
  const abs = type === 'ausencia';
  const extra = type === 'extraescolar';
  const outside = !extra || location === 'outside';
  const kidIcon = useMemo(() => Object.fromEntries(KIDS.map((k) => [k.id, personIcon(k.id)])), []);

  const changeType = (t) => {
    setType(t);
    if (t === 'extraescolar') { setNeedsTransport(true); if (emoji === '📌') setEmoji('⚽'); }
  };
  const pick = (p) => {
    setIcon(p.icon); setActivity(p.activity);
    if (p.emoji) setEmoji(p.emoji);
    if (p.kids && !kids.length) setKids(p.kids);
    const act = ACTIVITIES.find((a) => a.id === p.activity);
    if (act && !title.trim()) setTitle(act.label);
  };
  const toggleKid = (id) => { buzz(); setKids((k) => (k.includes(id) ? k.filter((x) => x !== id) : [...k, id])); };

  const valid = abs ? !!from : !!title.trim() && !!from;
  const submit = () => {
    if (!valid) return;
    buzz(15);
    if (abs) save('absences', { id: edit?.id ?? uid(), person: parent, start_date: from, end_date: to < from ? from : to, kind: absKind, start_time: startTime || null, note: note.trim() });
    else {
      const nt = outside && needsTransport;
      save('events', {
        ...(edit && !isAbs ? { series_id: edit.series_id } : {}),
        id: edit?.id ?? uid(), date: from, time: time || null, title: title.trim(), kind: type, who: whoText(kids),
        repeat: repeat ? 'weekly' : 'none', emoji, icon, activity: extra ? activity : '',
        location: extra ? location : 'outside', needs_transport: nt, transport: nt ? transport : null,
      });
    }
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
          <h3 className="label">¿Qué pasa?</h3>
          <Segmented name="abskind" value={absKind} onChange={setAbsKind} options={ABS_KINDS} />
          <h3 className="label">¿Quién?</h3>
          <PersonPick options={PARENTS} value={parent} onChange={(v) => v && setParent(v)} action={ACTION[absKind]} />
          <div className="two">
            <label><h3 className="label">Desde</h3><input type="date" className="field" value={from} onChange={(e) => { setFrom(e.target.value); if (to < e.target.value) setTo(e.target.value); }} /></label>
            <label><h3 className="label">Hasta</h3><input type="date" className="field" value={to} min={from} onChange={(e) => setTo(e.target.value)} /></label>
          </div>
          <label><h3 className="label">Hora de salida (el primer día, opcional)</h3><input type="time" className="field" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></label>
          <h3 className="label">Detalle (opcional)</h3>
          <input className="field" value={note} onChange={(e) => setNote(e.target.value)} placeholder={absKind === 'viaje' ? 'Ej.: Madrid, congreso' : absKind === 'trabajo' ? 'Ej.: turno de tarde' : 'Ej.: médico'} maxLength={120} />
        </>
      ) : (
        <>
          <h3 className="label">{extra ? 'Nombre' : '¿Qué es?'}</h3>
          <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={extra ? 'Ej.: Natación' : 'Ej.: Pediatra'} maxLength={80} autoFocus={!edit} />
          {extra ? (
            <>
              <h3 className="label">Icono</h3>
              <IconPicker kids={kids} icon={icon} emoji={emoji} onPick={pick} />
            </>
          ) : (
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
                <Pic icon={kidIcon[k.id]} size={64} animate={false} /><span>{k.label}</span>
              </button>
            ))}
          </div>
          {extra && (
            <>
              <h3 className="label">¿Dónde es?</h3>
              <Segmented name="loc" value={location} onChange={setLocation} options={LOCATIONS} />
            </>
          )}
          {outside && <Switch checked={needsTransport} onChange={setNeedsTransport} label={extra ? 'Requiere transporte' : 'Hay que llevar o recoger'} hint="Asigna a Viero o Sonia y saldrá su icono" />}
          {outside && needsTransport && (
            <>
              <h3 className="label">🛵 ¿Quién lleva / recoge?</h3>
              <PersonPick options={PARENTS} action="transporte" value={transport} onChange={setTransport} />
            </>
          )}
          {!edit?.series_id && <Switch checked={repeat} onChange={setRepeat} label="Se repite cada semana" hint={repeat ? 'Mismo día de la semana, a partir de la fecha' : 'Solo este día'} />}
        </>
      )}
    </Sheet>
  );
}
