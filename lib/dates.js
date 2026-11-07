const pad = (n) => String(n).padStart(2, '0');
export const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromISO = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const todayISO = () => toISO(new Date());
export const addDays = (s, n) => {
  const d = fromISO(s);
  d.setDate(d.getDate() + n);
  return toISO(d);
};
export const diffDays = (a, b) => Math.round((fromISO(a) - fromISO(b)) / 864e5);
export const mondayOf = (s) => addDays(s, -((fromISO(s).getDay() + 6) % 7));
export const isWeekend = (s) => [0, 6].includes(fromISO(s).getDay());
/** Fin de semana → lunes siguiente. */
export const startDay = (s) => s; // los fines de semana también son días de planificación
export const weekDays = (monday, n = 7) => Array.from({ length: n }, (_, i) => addDays(monday, i));
export const DAY_SHORT = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
export const weekdayName = (s) => cap(fromISO(s).toLocaleDateString('es-ES', { weekday: 'long' }));
export const dayNum = (s) => fromISO(s).getDate();
export const monthName = (s, style = 'long') => cap(fromISO(s).toLocaleDateString('es-ES', { month: style }));
export const longDate = (s) => `${weekdayName(s)} ${dayNum(s)} de ${monthName(s).toLowerCase()}`;
export function weekTitle(monday) {
  const fri = addDays(monday, 6);
  const y = fromISO(fri).getFullYear();
  const same = fromISO(monday).getMonth() === fromISO(fri).getMonth();
  return {
    title: same ? `${monthName(monday)} ${y}` : `${monthName(monday, 'short')} – ${monthName(fri, 'short')} ${y}`,
    range: `${dayNum(monday)} – ${dayNum(fri)} ${monthName(fri, 'short').toLowerCase()}`,
  };
}
export function relativeLabel(s, today) {
  const r = diffDays(s, today);
  return r === 0 ? 'Hoy' : r === 1 ? 'Mañana' : weekdayName(s);
}
export function whenLabel(s, today) {
  const r = diffDays(s, today);
  return r === 0 ? 'hoy' : r === 1 ? 'mañana' : `el ${weekdayName(s).toLowerCase()}`;
}
