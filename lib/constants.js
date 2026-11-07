export const PEOPLE = [
  { id: 'papa', label: 'Viero', emoji: '👨' },
  { id: 'mama', label: 'Sonia', emoji: '👩' },
  { id: 'otros', label: 'Otros', emoji: '🧑‍🍳' },
];
export const PARENTS = PEOPLE.slice(0, 2);
export const person = (id) => PEOPLE.find((p) => p.id === id);

export const SLOTS = [
  { id: 'comida', label: 'Comida', icon: '☀️', hour: 15 },
  { id: 'cena', label: 'Cena', icon: '🌙', hour: 22 },
];

export const PRESET_DISHES = [
  { name: 'Pasta', emoji: '🍝' },
  { name: 'Macarrones', emoji: '🧀' },
  { name: 'Arroz', emoji: '🍚' },
  { name: 'Paella', emoji: '🥘' },
  { name: 'Lentejas', emoji: '🍲' },
  { name: 'Garbanzos', emoji: '🫘' },
  { name: 'Sopa', emoji: '🥣' },
  { name: 'Crema de verduras', emoji: '🥕' },
  { name: 'Ensalada', emoji: '🥗' },
  { name: 'Verduras', emoji: '🥦' },
  { name: 'Tortilla', emoji: '🍳' },
  { name: 'Huevos', emoji: '🥚' },
  { name: 'Pollo', emoji: '🍗' },
  { name: 'Filetes', emoji: '🥩' },
  { name: 'Hamburguesas', emoji: '🍔' },
  { name: 'Albóndigas', emoji: '🧆' },
  { name: 'Croquetas', emoji: '🟤' },
  { name: 'Pescado', emoji: '🐟' },
  { name: 'Salmón', emoji: '🍣' },
  { name: 'Pizza', emoji: '🍕' },
  { name: 'Bocadillo', emoji: '🥪' },
  { name: 'Sándwich', emoji: '🥙' },
  { name: 'Tacos', emoji: '🌮' },
  { name: 'Sobras', emoji: '♻️', noShop: true },
  { name: 'Restaurante', emoji: '🍴', noShop: true },
  { name: 'Pedir comida', emoji: '🛵', noShop: true },
];
export const NO_SHOP = new Set(PRESET_DISHES.filter((d) => d.noShop).map((d) => d.name));

export const DISH_EMOJIS = ['🍽️', '🍝', '🍲', '🥘', '🍗', '🥩', '🐟', '🥗', '🍕', '🍔', '🌯', '🍜', '🥞', '🍰'];
export const EVENT_EMOJIS = ['📌', '⚽', '🏊', '🎹', '🎨', '💃', '📚', '🎭', '🥋', '🩺', '🎂', '🎉', '🎓', '🛒'];
export const ABSENCE_NOTES = ['✈️ Viaje', '💼 Trabajo', '🏥 Médico', '🎓 Curso'];
export const ACTION_LABEL = { cocinar: 'Cocina', comprar: 'Compra', transporte: 'Lleva / recoge' };

export const COOK_WHEN = [
  { value: 'same', label: 'Mismo día' },
  { value: 'eve', label: '🌙 Noche antes' },
  { value: 'weekend', label: '📅 Finde' },
];
export const COOK_WHEN_TAG = { eve: '🌙 Noche antes', weekend: '📅 Finde' };

export const STORES = [
  { id: 'super', label: 'Supermercado', emoji: '🛒' },
  { id: 'fruteria', label: 'Frutería', emoji: '🍎' },
  { id: 'carniceria', label: 'Carnicería', emoji: '🥩' },
  { id: 'pascual', label: 'Pascual (embutidos)', emoji: '🥓' },
  { id: 'otros', label: 'Otros', emoji: '📦' },
];
export const store = (id) => STORES.find((s) => s.id === id) || STORES[4];
