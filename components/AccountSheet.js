'use client';
import { PARENTS } from '@/lib/constants';
import { buzz } from '@/lib/helpers';
import Sheet from './Sheet';
import { PersonPick } from './ui';

/** Quién eres + familias guardadas en este dispositivo (cambiar, añadir, olvidar). */
export default function AccountSheet({ open, me, code, families, onPickMe, onSwitch, onAdd, onForget, onClose }) {
  return (
    <Sheet open={open} onClose={onClose} title="Cuenta">
      <h3 className="label">¿Quién eres?</h3>
      <PersonPick options={PARENTS} value={me} onChange={(v) => v && onPickMe(v)} />
      <h3 className="label">Familias en este dispositivo</h3>
      <div className="fam-list">
        {families.map((f) => (
          <div key={f.code} className={`fam-item${f.code === code ? ' on' : ''}`}>
            <button type="button" className="fam-main" onClick={() => { buzz(); if (f.code !== code) { onSwitch(f.code); onClose(); } }}>
              <span className="fam-ico">🏡</span>
              <span className="fam-name"><b>{f.code}</b><small>{f.code === code ? 'Familia actual' : 'Toca para cambiar'}</small></span>
              {f.code === code && <span className="fam-check">✓</span>}
            </button>
            <button type="button" className="fam-forget" aria-label={`Quitar ${f.code} de este dispositivo`} onClick={() => { if (confirm(`¿Quitar "${f.code}" de este dispositivo? Los datos no se borran.`)) onForget(f.code); }}>✕</button>
          </div>
        ))}
      </div>
      <button type="button" className="btn ghost wide" onClick={() => { onAdd(); onClose(); }}>＋ Entrar en otra familia o crear una</button>
    </Sheet>
  );
}
