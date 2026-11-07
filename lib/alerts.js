import { addDays, diffDays, fromISO, isWeekend, mondayOf, whenLabel } from './dates';
import { SLOTS, person, store } from './constants';
import { absLabel, absenceAt, absentOn, eventsOn, hhmm, isPlanned, isSuggested, mealAt, mealName } from './helpers';

const ORDER = { high: 0, med: 1, info: 2 };
const cap = (s) => s[0].toUpperCase() + s.slice(1);
const CW_TEXT = { eve: 'la noche de antes', weekend: 'el fin de semana' };

/**
 * Alertas derivadas de los datos.
 * - Conflictos de asignación (cocina, transporte, compras): próximos 10 días laborables.
 * - Resto (menú, pendientes, recordatorios): próximos 3 días laborables.
 */
export function computeAlerts({ meals, absences, events, shopping = [] }, today, now = new Date()) {
  const out = [];
  const hour = now.getHours();
  const nowHHMM = `${String(hour).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const days = [];
  for (let d = today; days.length < 10; d = addDays(d, 1)) if (!isWeekend(d)) days.push(d);

  days.forEach((d, idx) => {
    const near = idx < 3;
    const rel = diffDays(d, today);
    const when = whenLabel(d, today);
    const urgent = rel <= 1 ? 'high' : 'med';
    const absent = absentOn(absences, d);

    for (const slot of SLOTS) {
      if (rel === 0 && hour >= slot.hour) continue;
      const m = mealAt(meals, d, slot.id);
      const go = { tab: 'comidas', date: d, slot: slot.id };
      const sl = slot.label.toLowerCase();
      if (isSuggested(m)) {
        const by = m.suggested_by;
        out.push({ id: `sug-${d}-${slot.id}`, for: by === 'papa' ? 'mama' : by === 'mama' ? 'papa' : null, date: d, level: 'med', icon: '💡', title: `${by ? person(by).label : 'Alguien'} sugiere: ${mealName(m)}`, text: `${slot.label} ${when} · acéptala o recházala`, go });
        continue;
      }
      if (!isPlanned(m)) {
        if (near) out.push({ id: `menu-${d}-${slot.id}`, date: d, level: urgent, icon: '🍽️', title: `${slot.label} ${when} sin planificar`, text: 'Elige el plato para poder organizar la compra.', go });
        continue;
      }
      if (m.done) continue;
      const cw = m.cook_when || 'same';

      // Cocinero no disponible el día en que realmente cocina
      if (m.cook) {
        let bad = null;
        let badDate = d;
        if (cw === 'same') bad = absenceAt(absences, m.cook, d, slot.time);
        else if (cw === 'eve') {
          badDate = addDays(d, -1);
          if (badDate >= today) bad = absenceAt(absences, m.cook, badDate, '20:00');
        } else {
          const sat = addDays(mondayOf(d), -2);
          const sun = addDays(mondayOf(d), -1);
          badDate = sat;
          const a1 = sun >= today && absenceAt(absences, m.cook, sat, '12:00');
          const a2 = sun >= today && absenceAt(absences, m.cook, sun, '12:00');
          bad = a1 && a2 ? a1 : null;
        }
        if (bad) {
          out.push({ id: `conflict-${d}-${slot.id}`, for: m.cook, date: d, level: 'high', icon: '⚠️', title: `${person(m.cook).label} está ${absLabel(bad, badDate)} ${CW_TEXT[cw] || when}`, text: `Tenía que cocinar ${mealName(m)} (${sl} ${when}). Reasigna.`, go });
        }
      } else if (near) {
        out.push({ id: `cook-${d}-${slot.id}`, date: d, level: 'med', icon: '👩‍🍳', title: `Nadie cocina ${mealName(m)}`, text: `${slot.label} ${when}`, go });
      }
      if (!near) continue;

      // Planificada pero pendiente de hacer → rojo
      const who = m.cook ? person(m.cook).label : 'sin cocinero';
      if (rel === 0) {
        out.push({ id: `todo-${d}-${slot.id}`, for: m.cook || null, date: d, level: 'high', icon: '🍳', title: `${mealName(m)} pendiente de hacer`, text: `${slot.label} hoy · ${who}${cw === 'eve' ? ' · se cocinaba anoche' : cw === 'weekend' ? ' · se cocinaba el fin de semana' : ''}`, go });
      } else if (rel === 1 && cw === 'eve') {
        out.push({ id: `eve-${d}-${slot.id}`, for: m.cook || null, date: d, level: 'high', icon: '🌙', title: `Esta noche: cocinar ${mealName(m)}`, text: `Para la ${sl} de mañana · ${who}`, go });
      } else if (rel === 1 && cw === 'weekend') {
        out.push({ id: `todo-${d}-${slot.id}`, for: m.cook || null, date: d, level: 'high', icon: '📅', title: `${mealName(m)} pendiente de hacer`, text: `${slot.label} mañana · ${who} · se cocinaba el fin de semana`, go });
      }
      if (m.needs_buy) {
        out.push({ id: `buy-${d}-${slot.id}`, date: d, level: urgent, icon: '🛒', title: `Hay que comprar para ${mealName(m)}`, text: `${slot.label} ${when} · desmarca "Hay que comprar" cuando esté`, go: { tab: 'compras', date: d } });
      }
    }

    if (near && absent.length === 2) {
      out.push({ id: `both-${d}`, date: d, level: 'med', icon: '🏠', title: `Viero y Sonia ausentes ${when}`, text: 'Revisa quién se queda con los peques y las comidas.', go: { tab: 'agenda', date: d } });
    }

    for (const e of eventsOn(events, d)) {
      if (rel === 0 && e.time && hhmm(e.time) < nowHHMM) continue;
      const go2 = { tab: 'agenda', date: d };
      if (e.needs_transport) {
        const wh = `${e.title}${e.time ? ` (${hhmm(e.time)})` : ''}`;
        const bad = e.transport && absenceAt(absences, e.transport, d, hhmm(e.time));
        if (bad) {
          out.push({ id: `drivex-${e.id}-${d}`, for: e.transport, special: true, date: d, level: 'high', icon: '🚨', title: `Transporte en conflicto: ${e.title}`, text: `${person(e.transport).label} está ${absLabel(bad, d)} ${when} y tenía que llevar / recoger${e.who ? ` a ${e.who}` : ''} (${wh}). Reasigna.`, go: go2 });
        } else if (!e.transport && near && rel <= 1) {
          out.push({ id: `drive-${e.id}-${d}`, date: d, level: urgent, icon: '🛵', title: `Nadie lleva / recoge: ${e.title}`, text: `${cap(when)}${e.who ? ` · ${e.who}` : ''}`, go: go2 });
        }
      }
      if (near && rel <= 1) {
        out.push({ id: `ev-${e.id}-${d}`, for: e.transport || null, date: d, level: 'info', icon: e.emoji || '📌', title: e.title, text: `${cap(when)}${e.time ? ` a las ${hhmm(e.time)}` : ''}${e.who ? ` · ${e.who}` : ''}${e.transport ? ` · 🛵 ${person(e.transport).label}` : ''}`, go: go2 });
      }
    }
  });

  // Compras (categoría propia)
  for (const t of shopping) {
    if (t.done || !t.date) continue;
    const rel = diffDays(t.date, today);
    const when = whenLabel(t.date, today);
    const st = store(t.store);
    const go = { tab: 'compras', date: t.date };
    const bad = t.shopper && rel >= 0 && rel <= 10 ? absenceAt(absences, t.shopper, t.date, null) : null;
    if (rel < 0) out.push({ id: `shop-late-${t.id}`, date: t.date, level: 'high', icon: st.emoji, title: `Compra atrasada: ${st.label}`, text: `${t.items || 'Sin detalle'} · era para el ${t.date.slice(8)}/${t.date.slice(5, 7)}`, go });
    else if (bad) out.push({ id: `shop-away-${t.id}`, for: t.shopper, date: t.date, level: 'high', icon: '⚠️', title: `${person(t.shopper).label} está ${absLabel(bad, t.date)} ${when}`, text: `Tenía que ir a ${st.label}. Reasigna.`, go });
    else if (rel <= 2 && !t.shopper) out.push({ id: `shop-who-${t.id}`, date: t.date, level: rel <= 1 ? 'high' : 'med', icon: st.emoji, title: `Nadie se encarga: ${st.label}`, text: `${cap(when)}${t.items ? ` · ${t.items}` : ''}`, go });
    else if (rel <= 1 && t.shopper) out.push({ id: `shop-${t.id}`, for: t.shopper, date: t.date, level: 'info', icon: st.emoji, title: `Compra en ${st.label}`, text: `${cap(when)} · ${person(t.shopper).label}${t.items ? ` · ${t.items}` : ''}`, go });
  }

  const dow = fromISO(today).getDay();
  if ([4, 5, 6, 0].includes(dow)) {
    const nextMon = addDays(today, (8 - dow) % 7);
    let planned = 0;
    let weekendCook = 0;
    for (let i = 0; i < 5; i++) for (const s of SLOTS) {
      const m = mealAt(meals, addDays(nextMon, i), s.id);
      if (isPlanned(m)) { planned++; if (m.cook_when === 'weekend' && !m.done) weekendCook++; }
    }
    if (planned < 10) out.push({ id: `week-${nextMon}`, date: nextMon, level: 'med', icon: '🗓️', title: 'Menú de la semana que viene', text: planned ? `Faltan ${10 - planned} comidas por planificar.` : 'Aún no hay nada planificado.', go: { tab: 'semana', date: nextMon } });
    if (dow !== 4 && weekendCook) out.push({ id: `wkcook-${nextMon}`, date: nextMon, level: 'med', icon: '📅', title: 'Cocinar este fin de semana', text: `${weekendCook} ${weekendCook === 1 ? 'plato' : 'platos'} de la semana que viene por preparar.`, go: { tab: 'agenda', date: addDays(nextMon, -2) } });
  }

  return out.sort((a, b) => (b.special ? 1 : 0) - (a.special ? 1 : 0) || ORDER[a.level] - ORDER[b.level] || a.date.localeCompare(b.date));
}
