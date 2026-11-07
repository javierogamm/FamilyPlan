'use client';
import { useState } from 'react';
import { PARENTS, STORES } from '@/lib/constants';
import { addDays } from '@/lib/dates';
import { buzz, uid } from '@/lib/helpers';
import Sheet from './Sheet';
import { PersonPick } from './ui';

/** Nueva compra o edición. El componente se remonta con `key` en cada apertura. */
export default function ShopSheet({ open, today, edit, store: initialStore, prefill, lists, save, onDelete, onClose }) {
  const [store, setStore] = useState(edit?.store ?? initialStore ?? 'super');
  const [items, setItems] = useState(edit?.items ?? prefill?.items ?? '');
  const [date, setDate] = useState(edit ? edit.date ?? '' : prefill?.date ?? today);
  const [shopper, setShopper] = useState(edit?.shopper ?? null);
  const [listId, setListId] = useState(edit?.list_id ?? null);
  const submit = () => {
    buzz(15);
    save('shopping', { id: edit?.id ?? uid(), store, items: items.trim(), shopper, date: date || null, done: edit?.done ?? false, list_id: listId });
    onClose();
  };
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={edit ? 'Editar compra' : 'Nueva compra'}
      footer={
        <>
          {edit && <button type="button" className="btn ghost danger" onClick={() => { onDelete(edit); onClose(); }}>Borrar</button>}
          <button type="button" className="btn primary grow" onClick={submit}>{edit ? 'Guardar' : 'Añadir'}</button>
        </>
      }
    >
      <h3 className="label">¿Dónde?</h3>
      <div className="store-pick">
        {STORES.map((s) => (
          <button key={s.id} type="button" className={`store-opt${store === s.id ? ' on' : ''}`} onClick={() => { buzz(); setStore(s.id); }}>
            <span>{s.emoji}</span><b>{s.label}</b>
          </button>
        ))}
      </div>
      <h3 className="label">¿Qué hay que comprar?</h3>
      <textarea className="field area" rows={3} value={items} onChange={(e) => setItems(e.target.value)} placeholder="Ej.: leche, pasta, tomate frito…" maxLength={200} />
      <h3 className="label">¿Para cuándo?</h3>
      <div className="chips no-top">
        <button type="button" className={`chip${date === today ? ' on' : ''}`} onClick={() => setDate(today)}>Hoy</button>
        <button type="button" className={`chip${date === addDays(today, 1) ? ' on' : ''}`} onClick={() => setDate(addDays(today, 1))}>Mañana</button>
        <button type="button" className={`chip${!date ? ' on' : ''}`} onClick={() => setDate('')}>Sin fecha</button>
      </div>
      <input type="date" className="field" style={{ marginTop: 10 }} value={date} onChange={(e) => setDate(e.target.value)} />
      <h3 className="label">🧾 Lista de la compra asociada</h3>
      <div className="chips no-top">
        {[{ id: null, name: 'Ninguna', emoji: '—' }, { id: 'main', name: 'Principal', emoji: '🧾' }, ...lists].map((l) => (
          <button key={l.id ?? 'none'} type="button" className={`chip${listId === l.id ? ' on' : ''}`} onClick={() => { buzz(); setListId(l.id); }}>{l.emoji} {l.name}</button>
        ))}
      </div>
      <h3 className="label">🛒 ¿Quién compra?</h3>
      <PersonPick options={PARENTS} action="comprar" value={shopper} onChange={setShopper} />
    </Sheet>
  );
}
