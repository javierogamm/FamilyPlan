import { addDays, fromISO } from './dates';
import { uid } from './helpers';

/** Agrupa los eventos con series_id en extraescolares recurrentes (solo con ocurrencias futuras). */
export function seriesGroups(events, today) {
  const map = new Map();
  for (const e of events) {
    if (!e.series_id) continue;
    const g = map.get(e.series_id) || { id: e.series_id, events: [] };
    g.events.push(e);
    map.set(e.series_id, g);
  }
  return [...map.values()]
    .map((g) => {
      g.events.sort((a, b) => a.date.localeCompare(b.date));
      const upcoming = g.events.filter((e) => e.date >= today);
      const rep = upcoming[0] || g.events[g.events.length - 1];
      return { ...g, rep, upcoming, days: [...new Set(g.events.map((e) => fromISO(e.date).getDay()))].sort(), last: g.events[g.events.length - 1].date };
    })
    .filter((g) => g.upcoming.length)
    .sort((a, b) => a.rep.title.localeCompare(b.rep.title));
}

/** Fechas (máx. 400) entre from y to que caen en los días de la semana indicados (1=lunes … 5=viernes). */
export function seriesDates(from, to, days) {
  const out = [];
  for (let d = from; d <= to && out.length < 400; d = addDays(d, 1)) if (days.includes(fromISO(d).getDay())) out.push(d);
  return out;
}

export function buildSeriesEvents(seriesId, f, dates, previous = new Map()) {
  return dates.map((date) => ({
    id: uid(), series_id: seriesId, date, time: f.time || null, title: f.title, kind: 'extraescolar', who: f.who, repeat: 'none',
    emoji: f.emoji, icon: f.icon, activity: f.activity, location: f.location,
    needs_transport: f.needsTransport, transport: f.needsTransport ? (previous.has(date) ? previous.get(date) : f.transport) : null,
  }));
}

/** Fin del curso escolar más próximo (30 de junio). */
export function schoolYearEnd(today) {
  const d = fromISO(today);
  const y = d.getMonth() >= 6 ? d.getFullYear() + 1 : d.getFullYear();
  return `${y}-06-30`;
}
