import { SLOTS, store } from './constants';
import { addDays, fromISO, mondayOf } from './dates';
import { isPlanned, mealName } from './helpers';

/** Día en que realmente se cocina una comida: mismo día, la noche de antes o el sábado anterior. */
export function cookDate(m) {
  const cw = m.cook_when || 'same';
  if (cw === 'same') return m.date;
  if (cw === 'eve') return addDays(m.date, -1);
  return addDays(mondayOf(m.date), -2);
}

/**
 * Tareas derivadas (cocinar y comprar) que se muestran en la agenda del día `d`.
 * type: 'cook' | 'buy' (compra con fecha) | 'buymeal' (comida marcada "hay que comprar").
 */
export function agendaTasks({ meals, shopping, lists = [], list_items = [] }, d, today) {
  const out = [];
  for (const m of meals) {
    if (!isPlanned(m)) continue;
    const cw = m.cook_when || 'same';
    const cd = cookDate(m);
    const slot = SLOTS.find((s) => s.id === m.slot);
    const wd = fromISO(m.date).toLocaleDateString('es-ES', { weekday: 'long' });
    const label = `${slot.label.toLowerCase()} del ${wd}`;
    const onDay = cd === d || (cw === 'weekend' && !m.done && cd !== d && addDays(cd, 1) === d);
    if (onDay) out.push({ type: 'cook', key: `c-${m.date}-${m.slot}`, person: m.cook || null, title: mealName(m), sub: `${cw === 'eve' ? '🌙 la noche antes · ' : cw === 'weekend' ? '📅 este finde · ' : ''}para la ${label}`, done: !!m.done, meal: m, emoji: m.dish ? m.emoji : m.emoji2 });
    if (m.needs_buy && !m.done) {
      const bd = addDays(cd, -1) < today ? today : addDays(cd, -1);
      if (bd === d) out.push({ type: 'buymeal', key: `b-${m.date}-${m.slot}`, person: null, title: mealName(m), sub: `para la ${label}`, done: false, meal: m, emoji: '🛒' });
    }
  }
  for (const t of shopping) {
    if (t.date !== d) continue;
    const st = store(t.store);
    const lst = t.list_id ? [{ id: 'main', name: 'Principal', emoji: '🧾' }, ...lists].find((l) => l.id === t.list_id) : null;
    const n = lst ? list_items.filter((x) => !x.checked && (x.list_id || 'main') === lst.id).length : 0;
    out.push({ type: 'buy', key: `s-${t.id}`, person: t.shopper || null, title: st.label, sub: lst ? `${lst.emoji} ${lst.name} · ${n} por coger${t.items ? ` · ${t.items}` : ''}` : t.items || 'Sin detalle', done: !!t.done, task: t, emoji: st.emoji });
  }
  return out.sort((a, b) => Number(a.done) - Number(b.done) || (a.type === 'cook' ? 0 : 1) - (b.type === 'cook' ? 0 : 1));
}
