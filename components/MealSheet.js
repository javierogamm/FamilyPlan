'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { DISH_EMOJIS, NO_SHOP, PRESET_DISHES, SLOTS } from '@/lib/constants';
import { longDate } from '@/lib/dates';
import { absentOn, buzz, mealAt, uid } from '@/lib/helpers';
import Sheet from './Sheet';
import { PersonPick, Switch } from './ui';

export default function MealSheet({ open, date, slotId, data, save, remove, onClose }) {
  const slot = SLOTS.find((s) => s.id === slotId);
  const meal = mealAt(data.meals, date, slotId);
  const absent = absentOn(data.absences, date);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(DISH_EMOJIS[0]);

  const patch = (p) =>
    save('meals', { date, slot: slotId, dish: '', emoji: '🍽️', cook: null, shopper: null, shopping_ok: false, done: false, note: '', ...meal, ...p });

  const options = [...PRESET_DISHES];
  for (const d of data.dishes) if (!options.some((o) => o.name.toLowerCase() === d.name.toLowerCase())) options.push({ ...d, custom: true });

  const pick = (o) => {
    buzz(12);
    patch({ dish: o.name, emoji: o.emoji, shopping_ok: NO_SHOP.has(o.name) ? true : meal?.dish === o.name ? meal.shopping_ok : false });
  };
  const addDish = (e) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    const found = options.find((o) => o.name.toLowerCase() === n.toLowerCase());
    if (found) pick(found);
    else {
      save('dishes', { id: uid(), name: n, emoji });
      pick({ name: n, emoji });
    }
    setName('');
    setAdding(false);
  };
  const hasDish = !!meal?.dish;
  const needsBuy = hasDish && !NO_SHOP.has(meal.dish);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={`${slot.icon} ${slot.label} · ${longDate(date)}`}
      footer={
        <>
          {meal && <button type="button" className="btn ghost danger" onClick={() => { remove('meals', meal); onClose(); }}>Quitar</button>}
          <button type="button" className="btn primary grow" onClick={onClose}>Listo</button>
        </>
      }
    >
      {hasDish && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Switch checked={!!meal.done} onChange={(v) => patch({ done: v })} label="Ya está hecha" hint="Para platos preparados con antelación" />
          <h3 className="label">👩‍🍳 ¿Quién cocina?</h3>
          <PersonPick action="cocinar" value={meal.cook} onChange={(v) => patch({ cook: v })} absent={absent} />
          {needsBuy && (
            <>
              <h3 className="label">🛒 ¿Quién compra?</h3>
              <PersonPick action="comprar" value={meal.shopper} onChange={(v) => patch({ shopper: v })} absent={absent} />
              <Switch checked={!!meal.shopping_ok} onChange={(v) => patch({ shopping_ok: v })} label="Ya hay compra para este plato" hint="Márcalo cuando esté comprado" />
            </>
          )}
          <h3 className="label">📝 Nota</h3>
          <input className="field" defaultValue={meal.note} onBlur={(e) => e.target.value !== meal.note && patch({ note: e.target.value })} placeholder="Ej.: sin gluten, descongelar…" maxLength={200} />
        </motion.div>
      )}
      <h3 className="label">{hasDish ? 'Cambiar plato' : 'Plato'}</h3>
      <div className="dish-grid">
        {options.map((o) => (
          <motion.button key={o.name} type="button" layout whileTap={{ scale: 0.92 }} className={`dish${meal?.dish === o.name ? ' on' : ''}`} onClick={() => pick(o)}>
            <span className="d-emoji">{o.emoji}</span>
            <span className="d-name">{o.name}</span>
            {o.custom && (
              <span role="button" aria-label={`Eliminar ${o.name}`} className="d-del" onClick={(e) => { e.stopPropagation(); remove('dishes', o); }}>×</span>
            )}
          </motion.button>
        ))}
        <button type="button" className={`dish add${adding ? ' on' : ''}`} onClick={() => setAdding((v) => !v)}>
          <span className="d-emoji">＋</span>
          <span className="d-name">Otro plato</span>
        </button>
      </div>

      {adding && (
        <motion.form className="add-dish" onSubmit={addDish} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del plato" maxLength={60} enterKeyHint="done" />
          <div className="emoji-row">
            {DISH_EMOJIS.map((e) => <button key={e} type="button" className={e === emoji ? 'on' : ''} onClick={() => setEmoji(e)}>{e}</button>)}
          </div>
          <button type="submit" className="btn primary" disabled={!name.trim()}>Añadir y elegir</button>
        </motion.form>
      )}

    </Sheet>
  );
}
