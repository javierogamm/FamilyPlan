import { fromISO } from './dates';

export const mealAt = (meals, date, slot) => meals.find((m) => m.date === date && m.slot === slot);

export const absentOn = (absences, date) => [
  ...new Set(absences.filter((a) => a.start_date <= date && date <= a.end_date).map((a) => a.person)),
];

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
