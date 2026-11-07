'use client';
import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { STORES, store } from '@/lib/constants';
import { buzz, uid } from '@/lib/helpers';
import { CATALOG, normItem, suggestItems } from '@/lib/items';
import SwipeRow from './SwipeRow';

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function ListaView({ today, data, me, save, saveMany, remove, removeChecked, toast }) {
  const [q, setQ] = useState('');
  const [newStore, setNewStore] = useState('super');
  const [showDone, setShowDone] = useState(false);
  const inputRef = useRef(null);
  const items = data.list_items;
  const open = items.filter((i) => !i.checked);
  const done = items.filter((i) => i.checked);

  const onList = useMemo(() => new Set(open.map((i) => normItem(i.name))), [open]);
  const emojiOf = useMemo(() => {
    const m = new Map();
    for (const c of CATALOG) m.set(c.key, c.emoji);
    for (const s of data.item_stock) m.set(s.name_key || normItem(s.name), s.emoji);
    return m;
  }, [data.item_stock]);
  const sugg = useMemo(() => suggestItems(q, data.item_stock, onList, q ? 8 : 14), [q, data.item_stock, onList]);
  const typedKey = normItem(q);
  const exactSugg = q.trim() ? sugg.find((s) => s.key === typedKey) : null;
  const onListExact = q.trim() ? items.find((i) => normItem(i.name) === typedKey) : null;
  const hasHabits = data.item_stock.some((s) => s.uses > 0);

  const addItem = ({ name, emoji, store: st }) => {
    buzz(12);
    const key = normItem(name);
    const existing = items.find((i) => normItem(i.name) === key);
    if (existing) save('list_items', existing.checked ? { ...existing, checked: false } : { ...existing, qty: Math.min(9, (existing.qty || 1) + 1) });
    else save('list_items', { id: uid(), name, store: st, qty: 1, carry: 0, checked: false, added_by: me });
    const stock = data.item_stock.find((s) => (s.name_key || normItem(s.name)) === key);
    save('item_stock', { name, store: st, emoji: emoji || '🛒', uses: (stock?.uses || 0) + 1, last_used: today });
    setQ('');
    inputRef.current?.focus();
  };
  const submit = (e) => {
    e.preventDefault();
    const t = q.trim();
    if (!t) return;
    const pick = exactSugg || (!onListExact && sugg[0]);
    if (pick) addItem(pick);
    else if (onListExact) addItem({ name: onListExact.name, emoji: emojiOf.get(typedKey), store: onListExact.store });
    else addItem({ name: cap(t), emoji: '🛒', store: newStore });
  };

  const toggle = (i) => { buzz(15); save('list_items', { ...i, checked: !i.checked }); };
  const cycleQty = (i) => { buzz(8); save('list_items', { ...i, qty: (i.qty || 1) >= 9 ? 1 : (i.qty || 1) + 1 }); };

  // Compra terminada: lo cogido se limpia; lo que falta pasa a la siguiente compra
  const finish = () => {
    buzz(30);
    const taken = done;
    const left = open;
    removeChecked();
    if (left.length) saveMany('list_items', left.map((i) => ({ ...i, carry: (i.carry || 0) + 1 })));
    toast({
      msg: `✅ Compra terminada · ${taken.length} cogidos${left.length ? ` · ${left.length} pasan a la próxima` : ''}`,
      undo: () => {
        if (taken.length) saveMany('list_items', taken);
        if (left.length) saveMany('list_items', left);
      },
    });
  };

  const row = (i) => {
    const st = store(i.store);
    return (
      <SwipeRow key={i.id} className={`li${i.checked ? ' is-done' : ''}`} onDelete={() => remove('list_items', i)}>
        <button type="button" className={`check${i.checked ? ' on' : ''}`} aria-label={i.checked ? 'Quitar el check' : 'Marcar como cogido'} onClick={() => toggle(i)}>
          <motion.span key={String(i.checked)} initial={{ scale: 0.3 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 14 }}>{i.checked ? '✓' : ''}</motion.span>
        </button>
        <span className="li-emoji">{emojiOf.get(normItem(i.name)) || st.emoji}</span>
        <span className="li-name"><b>{i.name}</b>{i.carry > 0 && !i.checked && <small>↩︎ de la compra anterior{i.carry > 1 ? ` (×${i.carry})` : ''}</small>}</span>
        <button type="button" className={`qty${i.qty > 1 ? ' on' : ''}`} aria-label="Cambiar cantidad" onClick={() => cycleQty(i)}>×{i.qty || 1}</button>
      </SwipeRow>
    );
  };

  const total = items.length;
  const pct = total ? (done.length / total) * 100 : 0;

  return (
    <div className="lista">
      <form className="add-bar" onSubmit={submit}>
        <input ref={inputRef} className="field" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Añadir a la lista… (leche, pan, pollo)" enterKeyHint="done" autoComplete="off" autoCorrect="off" spellCheck={false} maxLength={60} />
        <button type="submit" className="round add-go" aria-label="Añadir" disabled={!q.trim()}>＋</button>
      </form>

      {q.trim() ? (
        <div className="sg-list">
          {sugg.map((s) => (
            <button key={s.key} type="button" className="sg-row" onClick={() => addItem(s)}>
              <span className="sg-emoji">{s.emoji}</span>
              <span className="sg-name">{s.name}</span>
              {s.habit && s.uses > 0 && <em className="sg-habit">⭐ ×{s.uses}</em>}
              <span className="sg-store">{store(s.store).emoji}</span>
            </button>
          ))}
          {!exactSugg && !onListExact && (
            <div className="sg-new">
              <b>＋ Añadir «{cap(q.trim())}» como nuevo</b>
              <div className="chips no-top">
                {STORES.map((s) => <button key={s.id} type="button" className={`chip${newStore === s.id ? ' on' : ''}`} onClick={() => setNewStore(s.id)}>{s.emoji} {s.label}</button>)}
              </div>
              <button type="button" className="btn primary" onClick={() => addItem({ name: cap(q.trim()), emoji: '🛒', store: newStore })}>Añadir</button>
            </div>
          )}
        </div>
      ) : (
        sugg.length > 0 && (
          <>
            <h3 className="label">{hasHabits ? '⭐ Tus habituales' : '💡 Sugerencias'}</h3>
            <div className="chips no-top h-scroll">
              {sugg.map((s) => <button key={s.key} type="button" className="chip" onClick={() => addItem(s)}>{s.emoji} {s.name}</button>)}
            </div>
          </>
        )
      )}

      {total > 0 && (
        <div className="list-progress">
          <div className="sum-top"><span>🧾 {done.length}/{total} cogidos</span><b>{open.length} por coger</b></div>
          <div className="bar"><motion.i className="t-green" initial={false} animate={{ width: `${pct}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} /></div>
          <button type="button" className="btn primary wide finish" onClick={finish}>✅ Compra terminada</button>
          {open.length > 0 && <p className="muted hint">Lo cogido se limpia · {open.length} sin coger pasan a la próxima compra</p>}
        </div>
      )}

      {STORES.map((st) => {
        const rows = open.filter((i) => i.store === st.id);
        if (!rows.length) return null;
        return (
          <section key={st.id} className="li-group">
            <h3>{st.emoji} {st.label} <small>{rows.length}</small></h3>
            <AnimatePresence initial={false}>{rows.map(row)}</AnimatePresence>
          </section>
        );
      })}
      {open.length === 0 && <p className="muted pad">{total ? 'Todo cogido. Pulsa «Compra terminada».' : 'La lista está vacía. Escribe arriba o toca un habitual.'}</p>}

      {done.length > 0 && (
        <section className="li-group">
          <button type="button" className="link" onClick={() => setShowDone((v) => !v)}>{showDone ? 'Ocultar' : 'Ver'} cogidos ({done.length})</button>
          {showDone && <AnimatePresence initial={false}>{done.map(row)}</AnimatePresence>}
        </section>
      )}
    </div>
  );
}
