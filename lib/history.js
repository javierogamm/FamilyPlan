import { addDays } from './dates';
import { isPlanned } from './helpers';
import { norm } from './dishes';

/** Veces que se ha comido cada primero y segundo entre `from` y `to` (ambos incluidos). Solo cuentan las comidas marcadas como hechas. */
export function dishCounts(meals, from, to) {
  const add = (map, name, emoji) => {
    if (!name) return;
    const k = norm(name);
    const cur = map.get(k) || { name, emoji, count: 0, last: '' };
    cur.count++;
    map.set(k, cur);
  };
  const p = new Map();
  const s = new Map();
  let total = 0;
  for (const m of meals) {
    if (!isPlanned(m) || !m.done || m.date < from || m.date > to) continue;
    total++;
    add(p, m.dish, m.emoji);
    add(s, m.dish2, m.emoji2);
  }
  const sort = (map) => [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  return { total, primeros: sort(p), segundos: sort(s) };
}

export const last30 = (today) => ({ from: addDays(today, -29), to: today });
