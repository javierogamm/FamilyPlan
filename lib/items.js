// Catálogo de productos habituales. Cabecera: "# tienda|emoji" (super, fruteria, carniceria, pascual, otros).
// Cada producto puede sobrescribir el emoji: "Nombre|emoji".
const RAW = `
# fruteria|🍎
Manzanas
Peras|🍐
Plátanos|🍌
Naranjas|🍊
Mandarinas|🍊
Limones|🍋
Uvas|🍇
Fresas|🍓
Melón|🍈
Sandía|🍉
Melocotones|🍑
Nectarinas|🍑
Ciruelas|🍑
Cerezas|🍒
Kiwis|🥝
Piña|🍍
Mango|🥭
Aguacates|🥑
Arándanos|🫐
Granadas
Higos
Albaricoques|🍑
Pomelo|🍊
Coco|🥥
# fruteria|🥬
Lechuga|🥬
Lechuga romana|🥬
Canónigos|🥬
Rúcula|🥬
Espinacas|🥬
Acelgas|🥬
Tomates|🍅
Tomate cherry|🍅
Pepinos|🥒
Calabacín|🥒
Berenjena|🍆
Pimientos verdes|🫑
Pimientos rojos|🫑
Zanahorias|🥕
Cebollas|🧅
Cebolletas|🧅
Puerros
Ajos|🧄
Patatas|🥔
Boniatos|🍠
Calabaza|🎃
Brócoli|🥦
Coliflor|🥦
Judías verdes|🫛
Guisantes|🫛
Champiñones|🍄
Setas|🍄
Maíz|🌽
Remolacha
Rábanos
Apio
Espárragos
Alcachofas
Col
Repollo
Jengibre
Perejil|🌿
Cilantro|🌿
Albahaca|🌿
Menta|🌿
# carniceria|🥩
Pechuga de pollo|🍗
Muslos de pollo|🍗
Pollo entero|🍗
Alitas de pollo|🍗
Pavo|🦃
Pechuga de pavo|🦃
Carne picada|🥩
Carne picada de ternera|🥩
Filetes de ternera|🥩
Filetes de cerdo|🥩
Lomo de cerdo|🥩
Solomillo|🥩
Chuletas de cerdo|🍖
Chuletas de cordero|🍖
Costillas|🍖
Secreto ibérico|🥩
Entrecot|🥩
Hamburguesas|🍔
Albóndigas|🧆
Salchichas frescas|🌭
Longaniza
Butifarra
Morcilla
Conejo|🐇
Cordero|🍖
Hígado
Ternera para guisar|🥩
Rabo de toro|🥩
Carrillada|🥩
Codillo|🍖
# pascual|🥓
Jamón serrano|🥓
Jamón cocido|🥓
Jamón ibérico|🥓
Chorizo|🥓
Salchichón|🥓
Lomo embuchado|🥓
Fuet|🥓
Mortadela|🥓
Pechuga de pavo en lonchas|🥓
Panceta|🥓
Bacon|🥓
Morcilla de Burgos|🥓
Queso curado|🧀
Queso semicurado|🧀
Queso fresco|🧀
Queso en lonchas|🧀
Queso de cabra|🧀
Queso manchego|🧀
Paté|🥫
Sobrasada|🥓
# otros|🐟
Merluza|🐟
Salmón|🐟
Bacalao|🐟
Lubina|🐟
Dorada|🐟
Atún fresco|🐟
Pescadilla|🐟
Rape|🐟
Sardinas|🐟
Boquerones|🐟
Gambas|🍤
Langostinos|🦐
Mejillones|🦪
Almejas|🦪
Calamares|🦑
Sepia|🦑
Pulpo|🐙
Palitos de cangrejo|🦀
Pilas|🔋
Bombillas|💡
Bolsas de basura|🗑️
Velas|🕯️
Pegamento
Cinta adhesiva
Papel de regalo|🎁
Cuaderno|📓
Bolígrafos|🖊️
Medicamentos|💊
Tiritas|🩹
# super|🥛
Leche|🥛
Leche sin lactosa|🥛
Leche de avena|🥛
Leche de almendras|🥛
Yogures|🥣
Yogur natural|🥣
Yogures griegos|🥣
Yogures de fresa|🥣
Mantequilla|🧈
Margarina|🧈
Nata para cocinar|🥛
Nata para montar|🥛
Huevos|🥚
Queso rallado|🧀
Queso crema|🧀
Mozzarella|🧀
Flan|🍮
Natillas|🍮
Cuajada|🥣
# super|🍞
Pan de molde|🍞
Pan integral|🍞
Barra de pan|🥖
Pan rallado|🍞
Pan de hamburguesa|🍔
Pan de perritos|🌭
Tortillas de trigo|🫓
Pan tostado|🍞
Picos|🥖
Bollería|🥐
Croissants|🥐
Magdalenas|🧁
Galletas|🍪
Galletas María|🍪
Cereales|🥣
Cacao en polvo|🍫
Chocolate negro|🍫
Chocolate con leche|🍫
Colacao|🍫
Mermelada|🍯
Miel|🍯
Crema de cacao|🍫
Azúcar
Sal
Harina
Levadura
Café|☕
Café en cápsulas|☕
Té|🍵
Manzanilla|🍵
Infusiones|🍵
Zumo de naranja|🧃
Zumos|🧃
# super|🍝
Pasta|🍝
Espaguetis|🍝
Macarrones|🍝
Fideos|🍝
Lasaña (placas)|🍝
Canelones (placas)|🍝
Arroz|🍚
Arroz integral|🍚
Arroz para paella|🍚
Lentejas|🫘
Garbanzos|🫘
Alubias|🫘
Garbanzos cocidos|🫘
Lentejas cocidas|🫘
Alubias cocidas|🫘
Cuscús
Quinoa
Avena
Harina de maíz
Tomate frito|🍅
Tomate triturado|🍅
Tomate natural en lata|🍅
Salsa boloñesa|🍅
Salsa de soja|🥢
Mayonesa
Ketchup|🍅
Mostaza
Vinagre
Aceite de oliva|🫒
Aceite de girasol|🌻
Aceitunas|🫒
Pepinillos|🥒
Sofrito
Caldo de pollo|🍲
Caldo de carne|🍲
Sopa de sobre|🍲
Pastillas de caldo|🍲
Especias|🧂
Pimentón
Orégano|🌿
Pimienta
Comino
Curry
# super|🥫
Atún en lata|🐟
Sardinas en lata|🐟
Mejillones en lata|🦪
Maíz en lata|🌽
Espárragos en lata
Pimientos del piquillo|🫑
Guisantes en lata|🫛
Champiñones en lata|🍄
Melocotón en almíbar|🍑
Piña en lata|🍍
Frutos secos|🥜
Almendras|🥜
Nueces|🥜
Cacahuetes|🥜
Pipas
Patatas fritas (bolsa)|🍟
Palomitas|🍿
Gusanitos
Barritas de cereales
Frutos rojos congelados|🫐
# super|🧊
Pizza congelada|🍕
Croquetas congeladas|🟤
Empanadillas congeladas|🥟
Nuggets|🍗
Palitos de pescado|🐟
Verdura congelada|🥦
Guisantes congelados|🫛
Patatas congeladas|🍟
Helados|🍦
Hielo|🧊
Pan congelado|🍞
Lasaña congelada|🍝
Merluza congelada|🐟
Gambas congeladas|🍤
Calamares congelados|🦑
# super|🥤
Agua|💧
Agua con gas|💧
Refrescos|🥤
Cola|🥤
Tónica|🥤
Cerveza|🍺
Cerveza sin alcohol|🍺
Vino tinto|🍷
Vino blanco|🍷
Sidra|🍾
Isotónica|🥤
# super|🧻
Papel higiénico|🧻
Papel de cocina|🧻
Servilletas|🧻
Pañuelos|🧻
Detergente|🧴
Suavizante|🧴
Lavavajillas|🧴
Pastillas lavavajillas|🧴
Sal lavavajillas
Limpiacristales|🧴
Lejía|🧴
Fregasuelos|🧴
Estropajos|🧽
Bayetas|🧽
Bolsas de congelar|🛍️
Papel de aluminio
Film transparente
Papel de horno
Ambientador
Insecticida
Esponjas|🧽
Gel de ducha|🧴
Champú|🧴
Acondicionador|🧴
Jabón de manos|🧼
Pasta de dientes|🪥
Cepillos de dientes|🪥
Colutorio
Desodorante|🧴
Compresas
Algodón
Cuchillas|🪒
Espuma de afeitar|🪒
Crema solar|🧴
Crema hidratante|🧴
Pañales|🍼
Toallitas|🧻
Comida de perro|🐶
Comida de gato|🐱
Arena de gato|🐱
`;

const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
export { norm as normItem };

export const CATALOG = [];
let cur = null;
for (const line of RAW.split('\n')) {
  const t = line.trim();
  if (!t) continue;
  if (t.startsWith('# ')) { const [store, emoji] = t.slice(2).split('|'); cur = { store, emoji }; continue; }
  const [name, emoji] = t.split('|');
  CATALOG.push({ name, emoji: emoji || cur.emoji, store: cur.store, key: norm(name) });
}

/** Productos que se sugieren cuando todavía no hay hábitos. */
export const STARTERS = ['Leche', 'Pan de molde', 'Huevos', 'Plátanos', 'Tomates', 'Pollo', 'Pasta', 'Arroz', 'Yogures', 'Aceite de oliva', 'Agua', 'Papel higiénico'].map(norm);

/** Autocompletado: hábitos (stock) primero por uso, luego catálogo. Excluye lo que ya está en la lista. */
export function suggestItems(query, stock, onList, limit = 8) {
  const words = norm(query).split(/\s+/).filter(Boolean);
  const pool = new Map();
  for (const s of stock) pool.set(s.name_key || norm(s.name), { name: s.name, emoji: s.emoji, store: s.store, key: s.name_key || norm(s.name), uses: s.uses || 0, last: s.last_used, habit: true });
  for (const c of CATALOG) if (!pool.has(c.key)) pool.set(c.key, { ...c, uses: 0, habit: false });
  let list = [...pool.values()].filter((i) => !onList.has(i.key));
  if (words.length) {
    list = list.filter((i) => words.every((w) => i.key.includes(w)));
    list.sort((a, b) => (b.key.startsWith(words[0]) ? 1 : 0) - (a.key.startsWith(words[0]) ? 1 : 0) || b.uses - a.uses || a.name.localeCompare(b.name));
  } else {
    list = list.filter((i) => i.habit || STARTERS.includes(i.key));
    list.sort((a, b) => b.uses - a.uses || STARTERS.indexOf(a.key) - STARTERS.indexOf(b.key));
  }
  return list.slice(0, limit);
}
