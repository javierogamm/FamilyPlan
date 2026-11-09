'use client';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { COOK_WHEN, DISH_EMOJIS, SLOTS } from '@/lib/constants';
import { CATEGORIES, DISHES, norm, searchDishes } from '@/lib/dishes';
import { longDate } from '@/lib/dates';
import { PARENTS, person } from '@/lib/constants';
import { absentOn, buzz, isPlanned, isSuggested, hasDishes, mealAt, uid } from '@/lib/helpers';
import Sheet from './Sheet';
import { PersonPick, Segmented, Switch } from './ui';

const PAGE = 45;
const TABS = [{ value: 'dishes', label: '🍽️ Platos' }, { value: 'details', label: '👩‍🍳 Cocina y compra' }];
const COURSE_DB = { p: 'primero', s: 'segundo', b: 'both' };

export default function MealSheet({ open, date, slotId, me, data, save, remove, onClose }) {
  const slot = SLOTS.find((s) => s.id === slotId);
  const meal = mealAt(data.meals, date, slotId);
  const absent = absentOn(data.absences, date);
  const [tab, setTab] = useState('dishes');
  const [course, setCourse] = useState(meal?.dish && !meal?.dish2 ? 's' : 'p');
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const [allCourses, setAllCourses] = useState(false);
  const [seed, setSeed] = useState(1);
  const [adding, setAdding] = useState(false);
  const [emoji, setEmoji] = useState(DISH_EMOJIS[0]);
  const [newCourse, setNewCourse] = useState('b');
  const [suggest, setSuggest] = useState(!!meal?.suggested);
  const parent = PARENTS.some((p) => p.id === me) ? me : null;

  const patch = (p) =>
    save('meals', { date, slot: slotId, dish: '', emoji: '🍽️', dish2: '', emoji2: '🍽️', cook: null, needs_buy: false, cook_when: 'same', done: false, suggested: false, suggested_by: null, note: '', ...meal, ...p });
  const field = course === 'p' ? { name: 'dish', emoji: 'emoji' } : { name: 'dish2', emoji: 'emoji2' };
  const current = meal?.[field.name] || '';

  // Platos ya usados cerca de esta fecha (±6 días) para evitar repetir
  const used = useMemo(() => {
    const set = new Map();
    for (const m of data.meals) {
      if (m.date === date && m.slot === slotId) continue;
      if (Math.abs((new Date(m.date) - new Date(date)) / 864e5) > 6) continue;
      for (const n of [m.dish, m.dish2]) if (n) set.set(norm(n), m.date);
    }
    return set;
  }, [data.meals, date, slotId]);

  const results = useMemo(() => searchDishes(data.dishes, { query, cat, course, allCourses }), [data.dishes, query, cat, course, allCourses]);
  const ideas = useMemo(() => {
    const pool = results.filter((d) => !used.has(d.key));
    const out = [];
    let x = seed * 9301 + 49297;
    const idx = new Set();
    while (out.length < Math.min(8, pool.length)) {
      x = (x * 9301 + 49297) % 233280;
      const i = Math.floor((x / 233280) * pool.length);
      if (!idx.has(i)) { idx.add(i); out.push(pool[i]); }
    }
    return out;
  }, [results, used, seed]);

  const pick = (d) => {
    buzz(12);
    patch({ [field.name]: d.name, [field.emoji]: d.emoji, ...(suggest ? { suggested: true, suggested_by: meal?.suggested_by || parent } : {}) });
    if (course === 'p' && !meal?.dish2) { setCourse('s'); setQuery(''); setCat(''); setLimit(PAGE); }
  };
  const clear = (c) => { buzz(); patch(c === 'p' ? { dish: '', emoji: '🍽️' } : { dish2: '', emoji2: '🍽️' }); };
  const exact = query.trim() && results.some((d) => d.key === norm(query.trim()));
  const addDish = (e) => {
    e.preventDefault();
    const n = query.trim();
    if (!n) return;
    save('dishes', { id: uid(), name: n, emoji, course: COURSE_DB[newCourse] });
    pick({ name: n, emoji });
    setQuery(''); setAdding(false);
  };

  const courseCard = (c, name, em) => (
    <button type="button" className={`course${course === c ? ' on' : ''}`} onClick={() => { setCourse(c); setLimit(PAGE); }}>
      <small>{c === 'p' ? '1º Primero' : '2º Segundo'}</small>
      {name ? <b>{em} {name}</b> : <b className="muted">Elegir…</b>}
      {name && <span role="button" aria-label="Quitar" className="course-x" onClick={(e) => { e.stopPropagation(); clear(c); }}>×</span>}
    </button>
  );

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={`${slot.icon} ${slot.label} · ${longDate(date)}`}
      footer={
        <>
          {meal && <button type="button" className="btn ghost danger" onClick={() => { remove('meals', meal); onClose(); }}>↺ Resetear</button>}
          <button type="button" className="btn primary grow" onClick={onClose}>Listo</button>
        </>
      }
    >
      <div className="courses">
        {courseCard('p', meal?.dish, meal?.emoji)}
        {courseCard('s', meal?.dish2, meal?.emoji2)}
      </div>
      {isSuggested(meal) && (
        <div className="suggest-box in-sheet">
          <span><small>💡 Sugerencia de {meal.suggested_by ? person(meal.suggested_by).label : 'alguien'}</small><b>Pendiente de aceptar</b></span>
          <button type="button" className="btn primary sm" onClick={() => { buzz(20); setSuggest(false); patch({ suggested: false }); }}>✅ Aceptar</button>
          <button type="button" className="btn ghost danger sm" onClick={() => { remove('meals', meal); onClose(); }}>✖</button>
        </div>
      )}
      <Segmented name="meal-tab" value={tab} onChange={setTab} options={TABS} />

      {tab === 'dishes' && (
        <>
          {!isSuggested(meal) && (
            <Switch checked={suggest} onChange={(v) => { setSuggest(v); if (hasDishes(meal)) patch(v ? { suggested: true, suggested_by: parent } : { suggested: false }); }} label="💡 Solo sugerir" hint="La otra persona tiene que aceptarla" />
          )}
          <div className="search-row">
            <input className="field" type="search" value={query} onChange={(e) => { setQuery(e.target.value); setLimit(PAGE); }} placeholder={`Buscar ${course === 'p' ? 'primero' : 'segundo'} (${DISHES.length}+ platos)…`} enterKeyHint="search" />
            <button type="button" className="round" aria-label="Ideas nuevas" title="Ideas nuevas" onClick={() => { buzz(); setSeed((s) => s + 1); }}>🎲</button>
          </div>
          <div className="cat-row">
            <button type="button" className={!cat ? 'on' : ''} onClick={() => { setCat(''); setLimit(PAGE); }}>Todas</button>
            {data.dishes.length > 0 && <button type="button" className={cat === 'mine' ? 'on' : ''} onClick={() => { setCat('mine'); setLimit(PAGE); }}>⭐ Mis platos</button>}
            {CATEGORIES.map((c) => <button key={c.id} type="button" className={cat === c.id ? 'on' : ''} onClick={() => { setCat(c.id); setLimit(PAGE); }}>{c.emoji} {c.label}</button>)}
          </div>

          {!query && ideas.length > 0 && (
            <>
              <h3 className="label">💡 Ideas {used.size ? '(sin repetir lo de esta semana)' : ''}</h3>
              <div className="chips no-top">
                {ideas.map((d) => <button key={d.key} type="button" className="chip" onClick={() => pick(d)}>{d.emoji} {d.name}</button>)}
              </div>
            </>
          )}

          <h3 className="label">{results.length} {results.length === 1 ? 'plato' : 'platos'}</h3>
          <div className="dish-grid">
            {results.slice(0, limit).map((d) => (
              <motion.button key={d.key} type="button" whileTap={{ scale: 0.93 }} className={`dish${current === d.name ? ' on' : ''}${used.has(d.key) ? ' used' : ''}`} onClick={() => pick(d)}>
                <span className="d-emoji">{d.emoji}</span>
                <span className="d-name">{d.name}</span>
                {used.has(d.key) && <i className="d-used">ya esta semana</i>}
                {d.custom && (
                  <span role="button" aria-label={`Eliminar ${d.name}`} className="d-del" onClick={(e) => { e.stopPropagation(); remove('dishes', d); }}>×</span>
                )}
              </motion.button>
            ))}
            {query.trim() && !exact && (
              <button type="button" className={`dish add${adding ? ' on' : ''}`} onClick={() => setAdding((v) => !v)}>
                <span className="d-emoji">＋</span><span className="d-name">Añadir «{query.trim()}»</span>
              </button>
            )}
          </div>
          {results.length > limit && <button type="button" className="btn ghost wide" onClick={() => setLimit((l) => l + PAGE)}>Mostrar más ({results.length - limit})</button>}
          {results.length === 0 && !query.trim() && <p className="muted pad">Nada en esta categoría para {course === 'p' ? 'primero' : 'segundo'}.</p>}
          {!allCourses && <button type="button" className="link" onClick={() => setAllCourses(true)}>Mostrar platos de todos los tipos</button>}

          {adding && query.trim() && (
            <motion.form className="add-dish" onSubmit={addDish} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <h3 className="label">Nuevo plato: {query.trim()}</h3>
              <div className="emoji-row">
                {DISH_EMOJIS.map((e) => <button key={e} type="button" className={e === emoji ? 'on' : ''} onClick={() => setEmoji(e)}>{e}</button>)}
              </div>
              <Segmented name="newcourse" value={newCourse} onChange={setNewCourse} options={[{ value: 'p', label: 'Primero' }, { value: 's', label: 'Segundo' }, { value: 'b', label: 'Ambos' }]} />
              <button type="submit" className="btn primary">Añadir y elegir</button>
            </motion.form>
          )}
        </>
      )}

      {tab === 'details' && (
        isPlanned(meal) ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Switch checked={!!meal.done} onChange={(v) => patch({ done: v })} label="Ya está hecha" hint="Para platos preparados con antelación" />
            <h3 className="label">👩‍🍳 ¿Quién cocina?</h3>
            <PersonPick action="cocinar" value={meal.cook} onChange={(v) => patch({ cook: v })} absent={absent} />
            <h3 className="label">🗓️ ¿Cuándo se cocina?</h3>
            <Segmented name="sheet-cw" value={meal.cook_when || 'same'} onChange={(v) => patch({ cook_when: v })} options={COOK_WHEN} />
            <Switch checked={!!meal.needs_buy} onChange={(v) => patch({ needs_buy: v })} label="Hay que comprar" hint="Genera un aviso hasta que lo desmarques" />
            <h3 className="label">📝 Nota</h3>
            <input className="field" defaultValue={meal.note} onBlur={(e) => e.target.value !== meal.note && patch({ note: e.target.value })} placeholder="Ej.: sin gluten, descongelar…" maxLength={200} />
          </motion.div>
        ) : (
          <p className="muted pad">Elige primero un plato en la pestaña «Platos».</p>
        )
      )}
    </Sheet>
  );
}
