import { fromISO } from './dates';

export const mealAt = (meals, date, slot) => meals.find((m) => m.date === date && m.slot === slot);

export const absentOn = (absences, date) => [
  ...new Set(absences.filter((a) => a.start_date <= date && date <= a.end_date).map((a) => a.person)),
];

export const absencesOn = (absences, date) => absences.filter((a) => a.start_date <= date && date <= a.end_date);
/** Una ausencia por progenitor en esa fecha (para chips e iconos). */
export const awayList = (absences, date) =>
  ['papa', 'mama'].map((p) => absencesOn(absences, date).find((a) => a.person === p)).filter(Boolean);
/** Ausencia que afecta a `person` a la hora `time` (HH:MM) de `date`; el primer día cuenta desde start_time. */
export const absenceAt = (absences, person, date, time) =>
  absences.find((a) => a.person === person && a.start_date <= date && date <= a.end_date && !(a.start_time && date === a.start_date && time && time < a.start_time.slice(0, 5))) || null;
/** "de viaje desde las 17:00", "trabajando", "fuera". */
export const absLabel = (a, date) =>
  `${a.kind === 'viaje' ? 'de viaje' : a.kind === 'trabajo' ? 'trabajando' : 'fuera'}${a.start_time && date === a.start_date ? ` desde las ${a.start_time.slice(0, 5)}` : ''}`;

export function eventsOn(events, date) {
  const dow = fromISO(date).getDay();
  return events
    .filter((e) => e.date === date || (e.repeat === 'weekly' && e.date <= date && fromISO(e.date).getDay() === dow))
    .sort((a, b) => (a.time || '99').localeCompare(b.time || '99'));
}

export const hhmm = (t) => (t ? t.slice(0, 5) : '');

export const uid = () =>
  globalThis.crypto?.randomUUID?.() ??
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 3) | 8).toString(16);
  });

export const buzz = (ms = 10) => {
  try {
    navigator.vibrate?.(ms);
  } catch {}
};
