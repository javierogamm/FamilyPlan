'use client';
import { useState } from 'react';
import { buzz, uid } from '@/lib/helpers';
import Sheet from './Sheet';

const EMOJIS = ['🧾', '🛒', '🏬', '🥬', '🍖', '🥓', '🍰', '🎉', '🧴', '🐶', '🏠', '🍼'];

/** Crear o editar una lista de la compra (la principal no se edita). Se remonta con `key` en cada apertura. */
export default function ListSheet({ open, edit, save, onDelete, onCreated, onClose }) {
  const [name, setName] = useState(edit?.name ?? '');
  const [emoji, setEmoji] = useState(edit?.emoji ?? '🧾');
  const valid = name.trim().length > 0;
  const submit = (e) => {
    e?.preventDefault();
    if (!valid) return;
    buzz(15);
    const id = edit?.id ?? uid();
    save('lists', { id, name: name.trim(), emoji });
    if (!edit) onCreated(id);
    onClose();
  };
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={edit ? 'Editar lista' : 'Nueva lista de la compra'}
      footer={
        <>
          {edit && <button type="button" className="btn ghost danger" onClick={() => { if (confirm(`¿Borrar la lista "${edit.name}" y sus productos?`)) { onDelete(edit); onClose(); } }}>Borrar</button>}
          <button type="button" className="btn primary grow" disabled={!valid} onClick={submit}>{edit ? 'Guardar' : 'Crear lista'}</button>
        </>
      }
    >
      <form onSubmit={submit}>
        <h3 className="label">Nombre</h3>
        <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej.: Mercadona, Fiesta del sábado…" maxLength={40} autoFocus={!edit} />
        <h3 className="label">Icono</h3>
        <div className="emoji-row">
          {EMOJIS.map((e) => <button key={e} type="button" className={e === emoji ? 'on' : ''} onClick={() => { buzz(); setEmoji(e); }}>{e}</button>)}
        </div>
      </form>
    </Sheet>
  );
}
