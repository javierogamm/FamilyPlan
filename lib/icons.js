// Iconos ilustrados de la familia (public/icons). ids internos: papa=Viero, mama=Sonia.
const SLUG = { papa: 'viero', mama: 'sonia', gabi: 'gabi', ines: 'ines' };
const KEYS = new Set([
  'viero', 'sonia', 'gabi', 'ines',
  'viero-cocinar', 'viero-comprar', 'viero-transporte', 'viero-viajar', 'viero-trabajar',
  'sonia-cocinar', 'sonia-comprar', 'sonia-viajar', 'sonia-trabajar',
  'gabi-piano', 'gabi-programacion', 'ines-piano', 'ines-karate', 'ines-gimnasia', 'gabi-ines-ingles',
]);
// Si no hay icono específico se usa el retrato + esta insignia.
const ACTION_EMOJI = { cocinar: '🍳', comprar: '🛒', transporte: '🚌', viajar: '✈️', trabajar: '💻' };
const LABEL = { papa: 'Viero', mama: 'Sonia', gabi: 'Gabi', ines: 'Inés' };

const make = (key, label, badge) => ({ key, label, src: `/icons/${key}.webp`, small: `/icons/${key}-b.webp`, badge });

/** Icono de un miembro (papa|mama|gabi|ines) realizando una acción (cocinar|comprar|transporte|viajar|trabajar). */
export function personIcon(id, action) {
  const slug = SLUG[id];
  if (!slug) return null;
  if (action && KEYS.has(`${slug}-${action}`)) return make(`${slug}-${action}`, LABEL[id]);
  return make(slug, LABEL[id], action ? ACTION_EMOJI[action] : undefined);
}

export const KIDS = [
  { id: 'gabi', label: 'Gabi' },
  { id: 'ines', label: 'Inés' },
];
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
/** Niños mencionados en el texto "para quién". */
export const kidsOf = (who = '') => KIDS.filter((k) => norm(who).includes(norm(k.label))).map((k) => k.id);
export const whoText = (ids) => ids.map((id) => KIDS.find((k) => k.id === id).label).join(', ');

export const ACTIVITIES = [
  { id: 'piano', label: 'Piano', emoji: '🎹' },
  { id: 'programacion', label: 'Programación', emoji: '💻' },
  { id: 'ingles', label: 'Inglés', emoji: '🇬🇧' },
  { id: 'gimnasia', label: 'Gimnasia rítmica', emoji: '🤸' },
  { id: 'karate', label: 'Karate', emoji: '🥋' },
];

/** Iconos (máx. 2) de un evento: actividad conjunta > actividad por niño > retrato del niño. */
export function eventIcons(e) {
  const kids = kidsOf(e.who);
  if (e.activity === 'ingles' && kids.length === 2) return [make('gabi-ines-ingles', 'Gabi e Inés')];
  const out = kids.map((k) => (KEYS.has(`${k}-${e.activity}`) ? make(`${k}-${e.activity}`, LABEL[k]) : personIcon(k)));
  return out.slice(0, 2);
}

/** Icono de una ausencia según el motivo escrito. */
export function absenceIcon(a) {
  const n = norm(a.note || '');
  return personIcon(a.person, n.includes('viaj') ? 'viajar' : n.includes('trabaj') ? 'trabajar' : null);
}
