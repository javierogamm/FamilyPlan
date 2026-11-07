import { addDays, diffDays, fromISO, isWeekend, mondayOf, whenLabel } from './dates';
import { NO_SHOP, SLOTS, person } from './constants';
import { absentOn, eventsOn, hhmm, mealAt } from './helpers';

const ORDER = { high: 0, med: 1, info: 2 };

/** Alertas derivadas de los datos (próximos 3 días laborables + planificación de la semana siguiente). */
export function computeAlerts({ meals, absences, events }, today, now = new Date()) {
  const out = [];
  const hour = now.getHours();
  const nowHHMM = `${String(hour).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const days = [];
  for (let d = today; days.length < 3; d = addDays(d, 1)) if (!isWeekend(d)) days.push(d);

  for (const d of days) {
    const rel = diffDays(d, today);
    const when = whenLabel(d, today);
    const urgent = rel <= 1 ? 'high' : 'med';
    const absent = absentOn(absences, d);

    for (const slot of SLOTS) {
      if (rel === 0 && hour >= slot.hour) continue;
      const m = mealAt(meals, d, slot.id);
      const go = { tab: 'comidas', date: d, slot: slot.id };
      const sl = slot.label.toLowerCase();
      if (!m?.dish) {
        out.push({ id: `menu-${d}-${slot.id}`, date: d, level: urgent, icon: '🍽️', title: `${slot.label} ${when} sin planificar`, text: 'Elige el plato para poder organizar la compra.', go });
        continue;
      }
      if (m.done) continue;
      if (!m.cook) {
        out.push({ id: `cook-${d}-${slot.id}`, date: d, level: 'med', icon: '👩‍🍳', title: `Nadie cocina ${when}`, text: `${m.dish} · ${sl}`, go });
      } else if (absent.includes(m.cook)) {
        out.push({ id: `conflict-${d}-${slot.id}`, date: d, level: 'high', icon: '⚠️', title: `${person(m.cook).label} no está ${when}`, text: `Tenía que cocinar ${m.dish} (${sl}). Reasigna.`, go });
      }
      if (!NO_SHOP.has(m.dish) && !m.shopping_ok) {
        out.push(
          m.shopper
            ? { id: `buy-${d}-${slot.id}`, date: d, level: urgent, icon: '🛒', title: `Falta comprar para ${m.dish}`, text: `${slot.label} ${when} · se encarga ${person(m.shopper).label}`, go }
            : { id: `buyer-${d}-${slot.id}`, date: d, level: urgent, icon: '🛒', title: `Nadie se encarga de la compra`, text: `${m.dish} · ${sl} ${when}`, go },
        );
      }
    }

    if (absent.length === 2) {
      out.push({ id: `both-${d}`, date: d, level: 'med', icon: '🏠', title: `Viero y Sonia ausentes ${when}`, text: 'Revisa quién se queda con los peques y las comidas.', go: { tab: 'agenda', date: d } });
    }

    if (rel <= 1) {
      for (const e of eventsOn(events, d)) {
        if (rel === 0 && e.time && hhmm(e.time) < nowHHMM) continue;
        if (e.needs_transport) {
          const wh = `${e.title}${e.time ? ` (${hhmm(e.time)})` : ''}`;
          if (!e.transport) out.push({ id: `drive-${e.id}-${d}`, date: d, level: urgent, icon: '🛵', title: `Nadie lleva / recoge: ${e.title}`, text: `${when[0].toUpperCase() + when.slice(1)}${e.who ? ` · ${e.who}` : ''}`, go: { tab: 'agenda', date: d } });
          else if (absent.includes(e.transport)) out.push({ id: `drivex-${e.id}-${d}`, date: d, level: 'high', icon: '⚠️', title: `${person(e.transport).label} no está ${when}`, text: `Tenía que llevar / recoger: ${wh}. Reasigna.`, go: { tab: 'agenda', date: d } });
        }
        out.push({ id: `ev-${e.id}-${d}`, date: d, level: 'info', icon: e.emoji || '📌', title: e.title, text: `${when[0].toUpperCase() + when.slice(1)}${e.time ? ` a las ${hhmm(e.time)}` : ''}${e.who ? ` · ${e.who}` : ''}${e.transport ? ` · 🛵 ${person(e.transport).label}` : ''}`, go: { tab: 'agenda', date: d } });
      }
    }
  }

  const dow = fromISO(today).getDay();
  if ([4, 5, 6, 0].includes(dow)) {
    const nextMon = addDays(today, (8 - dow) % 7);
    let planned = 0;
    for (let i = 0; i < 5; i++) for (const s of SLOTS) if (mealAt(meals, addDays(nextMon, i), s.id)?.dish) planned++;
    if (planned < 10) {
      out.push({ id: `week-${nextMon}`, date: nextMon, level: 'med', icon: '🗓️', title: 'Menú de la semana que viene', text: planned ? `Faltan ${10 - planned} comidas por planificar.` : 'Aún no hay nada planificado.', go: { tab: 'semana', date: nextMon } });
    }
  }

  return out.sort((a, b) => ORDER[a.level] - ORDER[b.level] || a.date.localeCompare(b.date));
}
