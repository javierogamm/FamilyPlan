'use client';
import { motion } from 'framer-motion';
import { PEOPLE, person } from '@/lib/constants';
import { buzz } from '@/lib/helpers';

export function Avatar({ id, size = 28 }) {
  const p = person(id);
  if (!p) return null;
  return (
    <span className={`avatar av-${id}`} style={{ width: size, height: size, fontSize: size * 0.58 }} title={p.label}>
      {p.emoji}
    </span>
  );
}

export function Segmented({ name, value, onChange, options }) {
  return (
    <div className="seg" role="radiogroup">
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={value === o.value} className={value === o.value ? 'on' : ''} onClick={() => { buzz(); onChange(o.value); }}>
          {value === o.value && <motion.span layoutId={`seg-${name}`} className="seg-pill" transition={{ type: 'spring', stiffness: 500, damping: 36 }} />}
          <span className="seg-label">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

export function Switch({ checked, onChange, label, hint }) {
  return (
    <button type="button" role="switch" aria-checked={checked} className={`switch-row${checked ? ' on' : ''}`} onClick={() => { buzz(); onChange(!checked); }}>
      <span className="sw-text">
        <b>{label}</b>
        {hint && <small>{hint}</small>}
      </span>
      <span className="sw-track">
        <motion.span className="sw-knob" animate={{ x: checked ? 22 : 0 }} transition={{ type: 'spring', stiffness: 600, damping: 32 }} />
      </span>
    </button>
  );
}

/** Selector de persona (tocar de nuevo deselecciona). `absent` marca a quien no está ese día. */
export function PersonPick({ value, onChange, absent = [] }) {
  return (
    <div className="people">
      {PEOPLE.map((p) => {
        const on = value === p.id;
        const away = absent.includes(p.id);
        return (
          <button key={p.id} type="button" className={`pp pp-${p.id}${on ? ' on' : ''}${away ? ' away' : ''}`} onClick={() => { buzz(); onChange(on ? null : p.id); }}>
            <span className="pp-emoji">{p.emoji}</span>
            <span>{p.label}</span>
            {away && <i className="pp-away">fuera</i>}
          </button>
        );
      })}
    </div>
  );
}
