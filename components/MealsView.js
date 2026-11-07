'use client';
import { motion } from 'framer-motion';
import { NO_SHOP, PEOPLE, SLOTS, person } from '@/lib/constants';
import { longDate, weekDays } from '@/lib/dates';
import { absentOn, buzz, eventsOn, hhmm, mealAt } from '@/lib/helpers';
import { personIcon } from '@/lib/icons';
import { Avatar } from './ui';
import { Pic } from './Pic';

const CYCLE = [null, 'papa', 'mama'];
/** Tarjeta de asignación: un toque rota Sin asignar → Viero → Sonia (Otros se elige en la hoja). */
function AssignTile({ action, label, value, onChange }) {
  const icon = value && value !== 'otros' ? personIcon(value, action) : null;
  const next = () => { buzz(12); onChange(CYCLE[(CYCLE.indexOf(value) + 1) % CYCLE.length] ?? null); };
  return (
    <motion.button type="button" className={`assign${value ? ' set' : ''}`} whileTap={{ scale: 0.94 }} onClick={next}>
      <span className="as-pic">
        {icon ? <Pic key={value} icon={icon} size={84} /> : value === 'otros' ? <span className="as-emoji">🧑‍🍳</span> : <span className="as-empty">＋</span>}
      </span>
      <span className="as-text"><small>{label}</small><b>{value ? person(value).label : 'Sin asignar'}</b></span>
    </motion.button>
  );
}

function MealCard({ date, slot, meal, openMeal, save }) {
  const filled = !!meal?.dish;
  const needsBuy = filled && !NO_SHOP.has(meal.dish);
  const toggleDone = () => { buzz(20); save('meals', { ...meal, done: !meal.done }); };
  const toggleBuy = () => { buzz(15); save('meals', { ...meal, shopping_ok: !meal.shopping_ok }); };
  return (
    <div className={`meal-card${filled ? ' filled' : ' empty'}${meal?.done ? ' done' : ''}`}>
      <motion.button type="button" className="mc-main" whileTap={{ scale: 0.97 }} onClick={() => openMeal(date, slot.id)}>
        <span className="mc-slot">{slot.icon} {slot.label}{meal?.done && <b className="done-tag">✓ Hecha</b>}</span>
        {filled ? (
          <>
            <motion.span key={meal.emoji + meal.dish} className="mc-emoji" initial={{ scale: 0.3, rotate: -25, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 380, damping: 15 }}>
              {meal.emoji}
            </motion.span>
            <span className="mc-dish">{meal.dish}</span>
          </>
        ) : (
          <>
            <span className="mc-plus">＋</span>
            <span className="mc-hint">¿Qué hay de {slot.label.toLowerCase()}?</span>
          </>
        )}
      </motion.button>
      {filled && (
        <div className="assign-row">
          <AssignTile action="cocinar" label="Cocina" value={meal.cook} onChange={(v) => save('meals', { ...meal, cook: v })} />
          {needsBuy && <AssignTile action="comprar" label="Compra" value={meal.shopper} onChange={(v) => save('meals', { ...meal, shopper: v })} />}
        </div>
      )}
      {filled && (
        <div className={`toggle-row${needsBuy && !meal.done ? ' two' : ''}`}>
          {needsBuy && !meal.done && (
            <button type="button" className={`buy-toggle${meal.shopping_ok ? ' on' : ''}`} onClick={toggleBuy}>
              <motion.span key={String(meal.shopping_ok)} initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 14 }}>
                {meal.shopping_ok ? '✅' : '🛒'}
              </motion.span>
              {meal.shopping_ok ? 'Hay compra' : 'Falta la compra'}
            </button>
          )}
          <button type="button" className={`done-toggle${meal.done ? ' on' : ''}`} onClick={toggleDone}>
            <motion.span key={String(!!meal.done)} initial={{ scale: 0.4, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 14 }}>
              {meal.done ? '🍽️' : '⏳'}
            </motion.span>
            {meal.done ? 'Hecha · deshacer' : 'Marcar hecha'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function MealsView({ monday, date, data, openMeal, save }) {
  const away = absentOn(data.absences, date);
  const evs = eventsOn(data.events, date);
  const pendingList = weekDays(monday).flatMap((d) =>
    SLOTS.map((s) => ({ d, s, m: mealAt(data.meals, d, s.id) })).filter(({ m }) => m?.dish && !m.done && !NO_SHOP.has(m.dish) && !m.shopping_ok),
  );
  const groups = [...PEOPLE.map((p) => p.id), null].map((id) => ({ id, items: pendingList.filter((x) => (x.m.shopper || null) === id) })).filter((g) => g.items.length);

  return (
    <>
      <h2 className="day-title">{longDate(date)}</h2>
      {(away.length > 0 || evs.length > 0) && (
        <div className="banner-row">
          {away.map((p) => <span key={p} className={`away-chip aw-${p}`}>{person(p).emoji} {person(p).label} fuera</span>)}
          {evs.map((e) => <span key={e.id} className="away-chip aw-ev">{e.emoji} {hhmm(e.time)} {e.title}</span>)}
        </div>
      )}
      <div className="cards">
        {SLOTS.map((s) => <MealCard key={s.id} date={date} slot={s} meal={mealAt(data.meals, date, s.id)} openMeal={openMeal} save={save} />)}
      </div>

      <h3 className="section">🛒 Compra pendiente de la semana</h3>
      {groups.length === 0 ? (
        <p className="muted pad">Todo lo planificado tiene compra. 🎉</p>
      ) : (
        <div className="shop-groups">
          {groups.map((g) => (
            <div key={g.id ?? 'none'} className="shop-group">
              <div className="sg-head">{g.id ? <>{g.id === 'otros' ? <Avatar id={g.id} size={30} /> : <Pic icon={personIcon(g.id, 'comprar')} size={40} animate={false} />} {person(g.id).label}</> : <>❔ Sin responsable</>}</div>
              <div className="chips">
                {g.items.map(({ d, s, m }) => (
                  <button key={d + s.id} type="button" className="chip" onClick={() => openMeal(d, s.id)}>
                    {m.emoji} {m.dish} <small>{d.slice(8)}/{d.slice(5, 7)} {s.icon}</small>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
