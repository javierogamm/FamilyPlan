import { addDays } from './dates';
import { person, SLOTS } from './constants';
import { eventsOn, hhmm, isPlanned, mealAt, mealName } from './helpers';
import { agendaTasks } from './tasks';

const mins = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
const WINDOW = 25; // minutos de margen tras la hora programada (el programador corre cada 5 min)

/**
 * Notificaciones que corresponden AHORA (fecha local `date`, hora local `time` "HH:MM").
 * Devuelve [{ key, persons: ['papa'|'mama'] | 'all', title, body, tag, url }]. La clave evita enviar dos veces.
 *  - Extraescolares: 30 min antes de la hora.
 *  - 19:30: platos que se cocinan la noche de antes (para mañana).
 *  - 12:00 y 17:00: tareas del día (cocinar, comprar y llevar/recoger) de cada progenitor.
 */
export function buildNotifications(data, { date, time }) {
  const out = [];
  const now = mins(time);
  const label = (id) => person(id)?.label || '';

  // a) Extraescolares: 30 minutos antes
  for (const e of eventsOn(data.events, date)) {
    if (e.kind !== 'extraescolar' || !e.time) continue;
    const until = mins(hhmm(e.time)) - now;
    if (until <= 0 || until > 30) continue;
    const lleva = e.needs_transport ? (e.transport ? ` · lleva ${label(e.transport)}` : ' · ¡sin nadie asignado para llevar!') : '';
    out.push({
      key: `ex-${e.id}-${date}`,
      persons: e.needs_transport && e.transport ? [e.transport] : 'all',
      title: `${e.emoji || '⚽'} ${e.title} en ${until} min`,
      body: `${hhmm(e.time)}${e.who ? ` · ${e.who}` : ''}${e.location === 'school' ? ' · en el cole' : ' · fuera'}${lleva}`,
      tag: `ex-${e.id}`,
      url: '/',
    });
  }

  // b) 19:30 — cocinar esta noche lo de mañana
  if (now >= 19 * 60 + 30 && now < 19 * 60 + 30 + WINDOW) {
    const tomorrow = addDays(date, 1);
    for (const s of SLOTS) {
      const m = mealAt(data.meals, tomorrow, s.id);
      if (!isPlanned(m) || m.cook_when !== 'eve' || m.done) continue;
      out.push({
        key: `eve-${tomorrow}-${s.id}`,
        persons: m.cook && m.cook !== 'otros' ? [m.cook] : 'all',
        title: `🌙 Esta noche: cocinar ${mealName(m)}`,
        body: `Para la ${s.label.toLowerCase()} de mañana${m.cook ? ` · ${label(m.cook)}` : ' · sin cocinero asignado'}`,
        tag: `eve-${s.id}`,
        url: '/',
      });
    }
  }

  // c) 12:00 y 17:00 — tareas del día
  for (const T of ['12:00', '17:00']) {
    if (!(now >= mins(T) && now < mins(T) + WINDOW)) continue;
    const tasks = agendaTasks(data, date, date).filter((t) => !t.done);
    const drives = eventsOn(data.events, date).filter((e) => e.needs_transport && e.transport && e.time && mins(hhmm(e.time)) > now);
    for (const p of ['papa', 'mama']) {
      const lines = [
        ...tasks.filter((t) => t.person === p).map((t) => `${t.type === 'cook' ? '🍳 Cocinar' : '🛒 Comprar'}: ${t.title}`),
        ...drives.filter((e) => e.transport === p).map((e) => `🛵 Llevar/recoger: ${e.title} (${hhmm(e.time)})`),
        ...tasks.filter((t) => !t.person).map((t) => `❔ Sin asignar · ${t.type === 'cook' ? 'Cocinar' : 'Comprar'}: ${t.title}`),
      ];
      if (!lines.length) continue;
      out.push({
        key: `todo-${date}-${T}-${p}`,
        persons: [p],
        title: `📋 Hoy te toca (${lines.length})`,
        body: lines.slice(0, 5).join('\n') + (lines.length > 5 ? `\n… y ${lines.length - 5} más` : ''),
        tag: `todo-${T}`,
        url: '/',
      });
    }
  }
  return out;
}
