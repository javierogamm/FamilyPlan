import { addDays, diffDays, fromISO, isWeekend, mondayOf, whenLabel } from './dates';
import { SLOTS, person, store } from './constants';
import { absentOn, eventsOn, hhmm, mealAt } from './helpers';

const ORDER = { high: 0, med: 1, info: 2 };
const cap = (s) => s[0].toUpperCase() + s.slice(1);

/** Alertas derivadas de los datos (próximos 3 días laborables, compras y planificación de la semana siguiente). */
export function computeAlerts({ meals, absences, events, shopping = [] }, today, now = new Date()) {
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
      const cw = m.cook_when || 'same';
      if (!m.cook) {
        out.push({ id: `cook-${d}-${slot.id}`, date: d, level: 'med', icon: '👩‍🍳', title: `Nadie cocina ${m.dish}`, text: `${slot.label} ${when}`, go });
      } else if (cw === 'same' && absent.includes(m.cook)) {
        out.push({ id: `conflict-${d}-${slot.id}`, for: m.cook, date: d, level: 'high', icon: '⚠️', title: `${person(m.cook).label} no está ${when}`, text: `Tenía que cocinar ${m.dish} (${sl}). Reasigna.`, go });
      }
      if (cw === 'eve' && rel === 1) {
        out.push({ id: `eve-${d}-${slot.id}`, for: m.cook, date: d, level: 'med', icon: '🌙', title: `Esta noche: cocinar ${m.dish}`, text: `Para la ${sl} de mañana${m.cook ? ` · ${person(m.cook).label}` : ''}`, go });
      } else if (cw === 'eve' && rel === 0) {
        out.push({ id: `eve-late-${d}-${slot.id}`, for: m.cook, date: d, level: 'high', icon: '🌙', title: `${m.dish} no está marcada como hecha`, text: `Se cocinaba anoche para la ${sl} de hoy.`, go });
      } else if (cw === 'weekend' && rel <= 1) {
        out.push({ id: `wk-late-${d}-${slot.id}`, for: m.cook, date: d, level: 'high', icon: '📅', title: `${m.dish} no está marcada como hecha`, text: `Se cocinaba el fin de semana · ${slot.label} ${when}`, go });
      }
      if (m.needs_buy) {
        out.push({ id: `buy-${d}-${slot.id}`, date: d, level: urgent, icon: '🛒', title: `Hay que comprar para ${m.dish}`, text: `${slot.label} ${when} · desmarca "Hay que comprar" cuando esté`, go: { tab: 'compras', date: d } });
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
          if (!e.transport) out.push({ id: `drive-${e.id}-${d}`, date: d, level: urgent, icon: '🛵', title: `Nadie lleva / recoge: ${e.title}`, text: `${cap(when)}${e.who ? ` · ${e.who}` : ''}`, go: { tab: 'agenda', date: d } });
          else if (absent.includes(e.transport)) out.push({ id: `drivex-${e.id}-${d}`, for: e.transport, date: d, level: 'high', icon: '⚠️', title: `${person(e.transport).label} no está ${when}`, text: `Tenía que llevar / recoger: ${wh}. Reasigna.`, go: { tab: 'agenda', date: d } });
        }
        out.push({ id: `ev-${e.id}-${d}`, for: e.transport || null, date: d, level: 'info', icon: e.emoji || '📌', title: e.title, text: `${cap(when)}${e.time ? ` a las ${hhmm(e.time)}` : ''}${e.who ? ` · ${e.who}` : ''}${e.transport ? ` · 🛵 ${person(e.transport).label}` : ''}`, go: { tab: 'agenda', date: d } });
      }
    }
  }

  // Compras (categoría propia)
  for (const t of shopping) {
    if (t.done || !t.date) continue;
    const rel = diffDays(t.date, today);
    const when = whenLabel(t.date, today);
    const st = store(t.store);
    const go = { tab: 'compras', date: t.date };
    if (rel < 0) out.push({ id: `shop-late-${t.id}`, date: t.date, level: 'high', icon: st.emoji, title: `Compra atrasada: ${st.label}`, text: `${t.items || 'Sin detalle'} · era para el ${t.date.slice(8)}/${t.date.slice(5, 7)}`, go });
    else if (rel <= 2 && !t.shopper) out.push({ id: `shop-who-${t.id}`, date: t.date, level: rel <= 1 ? 'high' : 'med', icon: st.emoji, title: `Nadie se encarga: ${st.label}`, text: `${cap(when)}${t.items ? ` · ${t.items}` : ''}`, go });
    else if (rel <= 2 && absentOn(absences, t.date).includes(t.shopper)) out.push({ id: `shop-away-${t.id}`, for: t.shopper, date: t.date, level: 'high', icon: '⚠️', title: `${person(t.shopper).label} no está ${when}`, text: `Tenía que ir a ${st.label}. Reasigna.`, go });
    else if (rel <= 1) out.push({ id: `shop-${t.id}`, for: t.shopper, date: t.date, level: 'info', icon: st.emoji, title: `Compra en ${st.label}`, text: `${cap(when)} · ${person(t.shopper).label}${t.items ? ` · ${t.items}` : ''}`, go });
  }

  const dow = fromISO(today).getDay();
  if ([4, 5, 6, 0].includes(dow)) {
    const nextMon = addDays(today, (8 - dow) % 7);
    let planned = 0;
    let weekendCook = 0;
    for (let i = 0; i < 5; i++) for (const s of SLOTS) {
      const m = mealAt(meals, addDays(nextMon, i), s.id);
      if (m?.dish) { planned++; if (m.cook_when === 'weekend' && !m.done) weekendCook++; }
    }
    if (planned < 10) out.push({ id: `week-${nextMon}`, date: nextMon, level: 'med', icon: '🗓️', title: 'Menú de la semana que viene', text: planned ? `Faltan ${10 - planned} comidas por planificar.` : 'Aún no hay nada planificado.', go: { tab: 'semana', date: nextMon } });
    if (dow !== 4 && weekendCook) out.push({ id: `wkcook-${nextMon}`, date: nextMon, level: 'med', icon: '📅', title: 'Cocinar este fin de semana', text: `${weekendCook} ${weekendCook === 1 ? 'plato' : 'platos'} de la semana que viene por preparar.`, go: { tab: 'semana', date: nextMon } });
  }

  return out.sort((a, b) => ORDER[a.level] - ORDER[b.level] || a.date.localeCompare(b.date));
}
