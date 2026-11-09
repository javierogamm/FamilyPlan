'use client';
import { motion } from 'framer-motion';
import { COOK_WHEN, COOK_WHEN_TAG, SLOTS, person } from '@/lib/constants';
import { isWeekend, longDate } from '@/lib/dates';
import { absLabel, awayList, buzz, eventsOn, hhmm, hasDishes, isSuggested, mealAt } from '@/lib/helpers';
import { absenceIcon, personIcon } from '@/lib/icons';
import { Pic } from './Pic';
import { Segmented } from './ui';

const CYCLE = [null, 'papa', 'mama'];
/** Un toque rota Sin asignar → Viero → Sonia (Otros se elige en la hoja). */
function AssignTile({ value, onChange }) {
  const icon = value && value !== 'otros' ? personIcon(value, 'cocinar') : null;
  const next = () => { buzz(12); onChange(CYCLE[(CYCLE.indexOf(value) + 1) % CYCLE.length] ?? null); };
  return (
    <motion.button type="button" className={`assign${value ? ' set' : ''}`} whileTap={{ scale: 0.94 }} onClick={next}>
      <span className="as-pic">
        {icon ? <Pic key={value} icon={icon} size={84} /> : value === 'otros' ? <span className="as-emoji">🧑‍🍳</span> : <span className="as-empty">＋</span>}
      </span>
      <span className="as-text"><small>Cocina</small><b>{value ? person(value).label : 'Sin asignar'}</b></span>
    </motion.button>
  );
}

function MealCard({ date, slot, meal, openMeal, save, remove, me }) {
  const filled = hasDishes(meal);
  const sug = isSuggested(meal);
  const patch = (p) => save('meals', { ...meal, ...p });
  const cw = meal?.cook_when || 'same';
  return (
    <div className={`meal-card${filled ? ' filled' : ' empty'}${meal?.done ? ' done' : ''}${sug ? ' suggested' : ''}`}>
      <motion.button type="button" className="mc-main" whileTap={{ scale: 0.97 }} onClick={() => openMeal(date, slot.id)}>
        <span className="mc-slot">{slot.icon} {slot.label}{meal?.done && <b className="done-tag">✓ Hecha</b>}</span>
        {filled ? (
          <>
            <motion.span key={meal.emoji + meal.dish + meal.dish2} className={`mc-emoji${meal.dish && meal.dish2 ? ' two' : ''}`} initial={{ scale: 0.3, rotate: -25, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 380, damping: 15 }}>
              {[meal.dish && meal.emoji, meal.dish2 && meal.emoji2].filter(Boolean).join(' ')}
            </motion.span>
            <span className="mc-dish">{meal.dish || meal.dish2}</span>
            {meal.dish && meal.dish2 && <span className="mc-dish2">＋ {meal.dish2}</span>}
            {cw !== 'same' && !sug && <span className="when-tag">{COOK_WHEN_TAG[cw]}</span>}
            {!sug && meal.suggested_by && <span className="credit">💡 Sugerido por {person(meal.suggested_by)?.label}</span>}
          </>
        ) : (
          <>
            <span className="mc-plus">＋</span>
            <span className="mc-hint">¿Qué hay de {slot.label.toLowerCase()}?</span>
          </>
        )}
      </motion.button>
      {sug && (
        <>
          <div className="suggest-box">
            {meal.suggested_by && <Pic icon={personIcon(meal.suggested_by)} size={52} animate={false} />}
            <span><small>💡 Sugerencia · pendiente de aceptar</small><b>{meal.suggested_by ? `${person(meal.suggested_by).label} propone esto` : 'Alguien propone esto'}</b></span>
          </div>
          <div className="toggle-row two">
            <button type="button" className="done-toggle on" onClick={() => { buzz(20); save('meals', { ...meal, suggested: false }); }}>✅ Aceptar</button>
            <button type="button" className="buy-toggle warn" onClick={() => { buzz(20); remove('meals', meal); }}>✖ Rechazar</button>
          </div>
        </>
      )}
      {filled && (
        <button type="button" className="reset-btn" onClick={() => { buzz(20); remove('meals', meal); }}>↺ Resetear {slot.label.toLowerCase()}</button>
      )}
      {filled && !sug && (
        <div className="assign-row">
          <AssignTile value={meal.cook} onChange={(v) => patch({ cook: v })} />
          <div className="when">
            <small>¿Cuándo se cocina?</small>
            <Segmented name={`cw-${date}-${slot.id}`} value={cw} onChange={(v) => patch({ cook_when: v })} options={COOK_WHEN} />
          </div>
        </div>
      )}
      {filled && !sug && (
        <div className={`toggle-row${meal.done ? '' : ' two'}`}>
          {!meal.done && (
            <button type="button" className={`buy-toggle${meal.needs_buy ? ' warn' : ''}`} onClick={() => { buzz(15); patch({ needs_buy: !meal.needs_buy }); }}>
              <motion.span key={String(!!meal.needs_buy)} initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 14 }}>
                {meal.needs_buy ? '🛒' : '👍'}
              </motion.span>
              {meal.needs_buy ? 'Hay que comprar' : 'No hay que comprar'}
            </button>
          )}
          <button type="button" className={`done-toggle${meal.done ? ' on' : ''}`} onClick={() => { buzz(20); patch({ done: !meal.done }); }}>
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

export default function MealsView({ date, data, me, openMeal, save, remove, onReset }) {
  const dayMeals = SLOTS.map((s) => mealAt(data.meals, date, s.id)).filter(Boolean);
  const away = awayList(data.absences, date);
  const evs = eventsOn(data.events, date);
  return (
    <>
      <h2 className="day-title">{longDate(date)}{isWeekend(date) && <em className="wk-chip">Finde</em>}</h2>
      {(away.length > 0 || evs.length > 0) && (
        <div className="banner-row">
          {away.map((a) => <span key={a.id} className={`away-chip aw-${a.person}`}><Pic icon={absenceIcon(a)} size={32} animate={false} />{person(a.person).label} {absLabel(a, date)}</span>)}
          {evs.map((e) => <span key={e.id} className="away-chip aw-ev">{e.emoji} {hhmm(e.time)} {e.title}</span>)}
        </div>
      )}
      {dayMeals.length > 0 && (
        <button type="button" className="reset-day" onClick={() => { buzz(25); onReset(dayMeals, `↺ ${dayMeals.length > 1 ? 'Comida y cena reseteadas' : 'Comida reseteada'}`); }}>↺ Resetear el día ({dayMeals.length})</button>
      )}
      <div className="cards">
        {SLOTS.map((s) => <MealCard key={s.id} date={date} slot={s} meal={mealAt(data.meals, date, s.id)} openMeal={openMeal} save={save} remove={remove} me={me} />)}
      </div>
    </>
  );
}
