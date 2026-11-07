// Base de platos precargada. Cabecera: "# Categoría|emoji|curso" (p = primero, s = segundo, b = ambos).
// Cada plato puede sobrescribir emoji y curso: "Nombre|emoji|curso".
const RAW = `
# Sopas y cremas|🥣|p
Sopa de pollo
Sopa de fideos
Sopa de ajo
Sopa castellana
Sopa de cocido
Sopa de verduras
Sopa de pescado
Sopa de picadillo
Sopa de cebolla|🧅
Sopa minestrone
Sopa de estrellitas|⭐
Caldo de carne
Gazpacho|🍅
Salmorejo|🍅
Ajoblanco
Crema de calabaza|🎃
Crema de calabacín|🥒
Crema de verduras|🥕
Crema de puerros
Crema de zanahoria|🥕
Crema de champiñones|🍄
Crema de guisantes
Crema de espárragos
Crema de tomate|🍅
Crema de patata|🥔
Crema de brócoli|🥦
Crema de coliflor
Crema de lentejas
Vichyssoise
# Legumbres|🫘|p
Lentejas|🍲
Lentejas con chorizo|🍲
Lentejas estofadas|🍲
Lentejas con verduras|🍲
Lentejas con arroz|🍲
Garbanzos con espinacas
Garbanzos con chorizo
Garbanzos con bacalao
Cocido madrileño|🍲
Cocido montañés|🍲
Potaje de garbanzos
Potaje de vigilia
Fabada asturiana
Judías blancas con chorizo
Alubias rojas
Alubias con almejas
Pochas
Hummus|🥙
Ensalada de garbanzos|🥗
Ensalada de lentejas|🥗
Pote gallego|🍲
# Arroces|🍚|b
Arroz blanco
Arroz a la cubana|🍳
Arroz con tomate|🍅
Arroz con pollo|🍗
Arroz tres delicias
Paella valenciana|🥘
Paella de marisco|🥘
Paella mixta|🥘
Paella de verduras|🥘
Arroz negro|🦑
Arroz caldoso|🥘
Arroz al horno|🥘
Arroz con verduras|🥕
Arroz con conejo|🥘
Arroz con costillas|🥘
Arroz con calamares|🦑
Arroz meloso|🥘
Arroz con chorizo
Arroz a banda|🥘
Fideuà|🥘
Risotto de setas|🍄
Risotto de calabaza|🎃
Arroz frito
Sushi|🍣
Poke|🥗
# Pastas|🍝|b
Espaguetis a la boloñesa
Espaguetis carbonara
Espaguetis con gambas|🍤
Macarrones con tomate|🍅
Macarrones gratinados|🧀
Macarrones con chorizo
Macarrones con atún|🐟
Tallarines con tomate
Lasaña de carne
Lasaña de verduras|🥦
Canelones de carne
Canelones de espinacas
Raviolis
Tortellini
Ñoquis
Pasta con pesto|🌿
Pasta primavera|🥦
Pasta con atún|🐟
Pasta con calabacín|🥒
Fideos a la cazuela
Fideos chinos|🍜
Pasta fría|🥗
Ensalada de pasta|🥗
Espaguetis aglio e olio
Fetuccini Alfredo
Pasta con salmón|🍣
Pasta con setas|🍄
Mac and cheese|🧀
Noodles con verduras|🍜
Espirales con tomate
# Verduras y ensaladas|🥗|p
Ensalada mixta
Ensalada César
Ensalada de tomate|🍅
Ensalada de lechuga y atún
Ensalada de queso de cabra|🧀
Ensalada campera|🥔
Ensalada de arroz|🍚
Ensalada caprese|🍅
Ensalada de aguacate|🥑
Ensalada de espinacas
Ensalada de pollo|🍗
Ensalada de remolacha
Ensalada murciana
Ensaladilla rusa|🥔
Ensalada de naranja y bacalao|🍊
Menestra de verduras|🥕
Pisto|🍅
Pisto con huevo|🍳
Judías verdes con jamón|🫛
Judías verdes con patata|🫛
Espinacas a la crema
Acelgas con patata
Coliflor gratinada|🧀
Coliflor rebozada
Brócoli al vapor|🥦
Brócoli con ajo|🥦
Berenjenas rellenas|🍆|b
Berenjenas con miel|🍆
Calabacines rellenos|🥒|b
Calabacín a la plancha|🥒
Pimientos rellenos|🫑|b
Pimientos del piquillo|🫑
Alcachofas a la plancha
Alcachofas con jamón
Espárragos trigueros
Parrillada de verduras|🫑
Verduras al horno
Verduras salteadas
Verduras al vapor
Zanahorias glaseadas|🥕
Puré de patata|🥔
Puré de calabaza|🎃
Patatas a lo pobre|🥔|b
Patatas al horno|🥔|b
Patatas fritas|🍟|s
Patatas bravas|🥔|b
Patatas con costillas|🥔|b
Patatas a la riojana|🥔
Champiñones al ajillo|🍄|b
Setas a la plancha|🍄
Tomates rellenos|🍅|b
Escalivada
Tumbet
Ratatouille
Repollo con patatas
Berenjena parmigiana|🍆|b
Cardo
# Huevos y tortillas|🍳|b
Tortilla de patatas|🥔
Tortilla francesa
Tortilla de jamón
Tortilla de atún|🐟
Tortilla de calabacín|🥒
Tortilla de espinacas
Tortilla de champiñón|🍄
Tortilla de queso|🧀
Huevos fritos
Huevos con patatas|🥔
Huevos revueltos
Huevos rotos|🥔
Huevos cocidos
Huevos al plato
Huevos rellenos
Huevos con tomate|🍅
Revuelto de champiñones|🍄
Revuelto de espárragos
Revuelto de gambas|🍤
Revuelto de jamón
Revuelto de morcilla
Frittata
Quiche lorraine|🥧
Quiche de verduras|🥧
Huevos a la flamenca
Huevos con chorizo
# Carne|🥩|s
Filete de ternera
Filete empanado
Filete de cerdo
Lomo a la plancha
Lomo en salsa
Lomo adobado
Solomillo al whisky
Solomillo de cerdo
Chuletas de cerdo|🍖
Chuletas de cordero|🍖
Costillas al horno|🍖
Costillas BBQ|🍖
Costillas en salsa|🍖
Carrillera estofada
Carrillada ibérica
Cordero asado|🍖
Pierna de cordero|🍖
Albóndigas en salsa|🧆
Albóndigas caseras|🧆
Hamburguesa|🍔|b
Hamburguesa casera|🍔|b
Hamburguesas de lentejas|🍔|b
Carne picada con tomate|🍅
Carne guisada|🍲
Estofado de ternera|🍲
Ternera con verduras
Ternera en salsa
Redondo de ternera
Rabo de toro
Entrecot
Chuletón
Secreto ibérico
Presa ibérica
Pluma ibérica
Brochetas de carne|🍢
Pinchitos morunos|🍢
Lacón con grelos
Cachopo
San Jacobo
Flamenquines
Escalope milanesa
Escalopines al limón|🍋
Escalopines al vino
Carne rellena
Rollitos de ternera
Hígado encebollado
Callos|🍲|p
Morcilla
Chorizo a la sidra
Salchichas|🌭
Salchichas con tomate|🌭
Salchichas con patatas|🌭
Butifarra con judías
Longaniza
Morcillo
# Aves y conejo|🍗|s
Pollo asado
Pollo al horno con patatas
Pollo al ajillo
Pollo en salsa
Pollo a la plancha
Pollo empanado
Pollo al curry|🍛
Pollo con tomate|🍅
Pollo con champiñones|🍄
Pollo a la cerveza|🍺
Pollo al limón|🍋
Pollo en pepitoria
Pollo teriyaki
Muslitos al horno
Alitas
Alitas BBQ
Fingers de pollo
Nuggets caseros
Pechuga a la plancha
Pechuga rellena
Pechuga empanada
Pechuga en salsa
Pechuga villaroy
Pavo al horno|🦃
Pavo a la plancha|🦃
Pavo en salsa|🦃
Codorniz
Pato|🦆
Conejo al ajillo|🐇
Conejo en salsa|🐇
Pollo tikka|🍛
Contramuslos de pollo
Pollo con almendras
# Pescados y mariscos|🐟|s
Merluza a la plancha
Merluza en salsa verde
Merluza rebozada
Merluza al horno
Merluza a la romana
Merluza con almejas
Bacalao al pil pil
Bacalao con tomate|🍅
Bacalao a la vizcaína
Bacalao dorado
Bacalao gratinado
Salmón a la plancha|🍣
Salmón al horno|🍣
Salmón en papillote|🍣
Salmón con verduras|🍣
Lubina al horno
Dorada al horno
Dorada a la sal
Besugo al horno
Rape en salsa
Rape a la plancha
Rodaballo
Lenguado a la plancha
Lenguado meunière
Pescadilla frita
Boquerones fritos
Boquerones en vinagre
Sardinas a la plancha
Sardinas en lata
Caballa al horno
Atún a la plancha
Atún con tomate|🍅
Bonito con tomate|🍅
Marmitako|🍲|p
Pez espada
Emperador
Gallo
Jurel
Calamares a la romana|🦑
Calamares en su tinta|🦑
Chipirones|🦑
Sepia a la plancha|🦑
Pulpo a feira|🐙
Pulpo a la gallega|🐙
Gambas al ajillo|🍤
Gambas a la plancha|🍤
Langostinos|🦐
Mejillones|🦪
Almejas a la marinera|🦪
Zarzuela de pescado|🍲
Fritura de pescado|🍤
Croquetas de pescado|🟤
Hamburguesa de pescado|🍔
Barritas de pescado
Pastel de pescado
# Guisos|🍲|s
Estofado|🍲
Guiso de patatas con carne|🍲
Caldereta|🍲
Ternera con guisantes
Estofado de pollo|🍲
Guiso de pollo|🍲
Guiso de pescado|🍲
Albóndigas con sepia|🧆
Ropa vieja|🍲
Carne con patatas|🍲
# Platos únicos y rápidos|🍽️|b
Pizza margarita|🍕
Pizza cuatro quesos|🍕
Pizza barbacoa|🍕
Pizza de jamón y queso|🍕
Pizza casera|🍕
Calzone|🥟
Empanada gallega|🥧
Empanadillas|🥟
Croquetas de jamón|🟤
Croquetas de pollo|🟤
Croquetas de bacalao|🟤
Croquetas de cocido|🟤
Croquetas de espinacas|🟤
Tacos|🌮
Burritos|🌯
Quesadillas|🌮
Fajitas|🌯
Nachos|🌮
Enchiladas|🌯
Kebab|🥙
Falafel|🥙
Wok de pollo|🥘
Wok de verduras|🥘
Wok de ternera|🥘
Wok de gambas|🥘
Curry de pollo|🍛
Curry de garbanzos|🍛
Curry de verduras|🍛
Pad thai|🍜
Ramen|🍜
Gyozas|🥟
Perritos calientes|🌭
Sándwich mixto|🥪
Sándwich de pavo|🥪
Sándwich vegetal|🥪
Bocadillo de tortilla|🥖
Bocadillo de jamón|🥖
Bocadillo de lomo|🥖
Bocadillo de calamares|🥖
Bocadillo de panceta|🥖
Bocadillo de pollo|🥖
Bocadillo de atún|🥖
Bocadillo de queso|🥖
Bocata de chorizo|🥖
Montaditos|🥖
Tosta de jamón y queso|🍞
Tostas variadas|🍞
Wrap de pollo|🌯
Wrap vegetal|🌯
Pan con tomate y jamón|🍞
Migas|🍳
Gachas
Raciones variadas|🍤
Tabla de embutidos|🥓
Tabla de quesos|🧀
Jamón con melón|🍈
Plato combinado
Yogur y fruta|🍓
Cereales con leche|🥣
Sobras|♻️
Restaurante|🍴
Pedir comida|🛵
`;

export const CATEGORIES = [];
export const DISHES = [];
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
export { norm };

let cat = null;
for (const line of RAW.split('\n')) {
  const t = line.trim();
  if (!t) continue;
  if (t.startsWith('# ')) {
    const [label, emoji, course] = t.slice(2).split('|');
    cat = { id: `c${CATEGORIES.length}`, label, emoji, course };
    CATEGORIES.push(cat);
    continue;
  }
  const [name, emoji, course] = t.split('|');
  DISHES.push({ name, emoji: emoji || cat.emoji, course: course || cat.course, cat: cat.id, key: norm(name) });
}

/** Busca platos: texto (todas las palabras), categoría y curso ('p' | 's'). Los propios (custom) van primero. */
export function searchDishes(custom, { query = '', cat = '', course = 'p', allCourses = false }) {
  const mine = custom.map((d) => ({ name: d.name, emoji: d.emoji, course: d.course === 'primero' ? 'p' : d.course === 'segundo' ? 's' : 'b', cat: 'mine', key: norm(d.name), custom: true, id: d.id }));
  const taken = new Set(mine.map((d) => d.key));
  let list = [...mine, ...DISHES.filter((d) => !taken.has(d.key))];
  if (cat) list = list.filter((d) => d.cat === cat);
  if (!allCourses) list = list.filter((d) => d.course === 'b' || d.course === course);
  const words = norm(query).split(/\s+/).filter(Boolean);
  if (words.length) {
    list = list.filter((d) => words.every((w) => d.key.includes(w)));
    list.sort((a, b) => (b.key.startsWith(words[0]) ? 1 : 0) - (a.key.startsWith(words[0]) ? 1 : 0));
  }
  return list;
}
