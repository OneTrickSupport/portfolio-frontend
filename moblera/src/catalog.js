// Möbelkatalog, golvmaterial och 2D-symboler (sedda uppifrån).
// Lokalt koordinatsystem per möbel: origo i mitten, −y är baksidan (den som står mot väggen).

export const CATS = [
  { id: 'soffa', name: 'Soffor och fåtöljer' },
  { id: 'modul', name: 'Modulsoffa: bygg din egen' },
  { id: 'n701', name: 'Modulsoffa: Ethnicraft N701' },
  { id: 'angle', name: 'Modulsoffa: Bolia Angle' },
  { id: 'bord', name: 'Bord' },
  { id: 'stol', name: 'Stolar och pallar' },
  { id: 'sang', name: 'Sängar' },
  { id: 'forvaring', name: 'Förvaring' },
  { id: 'lampa', name: 'Belysning' },
  { id: 'vaxt', name: 'Växter och krukor' },
  { id: 'dekor', name: 'Tavlor, speglar och pynt' },
  { id: 'textil', name: 'Mattor och gardiner' },
  { id: 'media', name: 'TV, ljud och musik' },
  { id: 'arbete', name: 'Arbetsplats' },
  { id: 'kok', name: 'Kök' },
  { id: 'bad', name: 'Badrum och tvätt' },
  { id: 'hall', name: 'Hall' },
  { id: 'barn', name: 'Barnrum' },
  { id: 'fritid', name: 'Träning och fritid' },
  { id: 'ute', name: 'Balkong' },
  { id: 'ovrigt', name: 'Övrigt' },
];

const WOOD = '#c9a67a', OAK = '#b98d5e', WALNUT = '#6b452b', WHITE = '#f2f1ec', BLACK = '#2f3336', STEEL = '#b9bec2', BRASS = '#b08d57';
const SAGE = '#8d9a8a', GREY = '#8b8f98', BEIGE = '#c7b299', TAN = '#b0875c', BLUE = '#6f7f8c', CHAR = '#3d4043', RED = '#a3554a', MUSTARD = '#d9a441';
const LEAF = '#5c7d55', DLEAF = '#3f5f43', KITCHEN = '#dfe2dc', PORC = '#f6f6f3';

// Extra egenskaper på en katalograd:
//   top   – står på bord, byråer och hyllor (ställer sig på ytan under)
//   wall  – hänger på eller står mot en vägg (vänder ryggen mot närmaste vägg)
//   ceil  – hänger i taket          full – går från golv till tak
//   ghost – krockar aldrig (mattor, gardiner)
//   module – soffmodul som fäster kant i kant mot andra moduler
//   sym   – annan planritningssymbol än formens egen
const I = (name, cat, shape, w, d, h, color, o = {}) => ({ name, cat, shape, w, d, h, color, ...o });
// Svängd soffmodul: en tårtbit av en ring. angle = hur många grader den svänger, ri = innerradie i cm,
// curve 'in' = ryggen på utsidan (man sitter vänd inåt), 'out' = ryggen på insidan.
const SEAT_DEPTH = 95;
const C = (name, angle, ri, curve, color, o = {}) => {
  const t = (angle * Math.PI) / 180, ro = ri + (o.depth || SEAT_DEPTH);
  return I(name, o.cat || 'modul', 'curve', Math.round(ro * Math.sin(t) * 10) / 10, Math.round((ro - ri * Math.cos(t)) * 10) / 10, o.h || 82, color, { module: true, curve, angle, ri, ...o });
};

export const CATALOG = {
  // ---- Soffor och fåtöljer ----
  sofa3: I('Soffa 3-sits', 'soffa', 'sofa', 220, 95, 82, SAGE),
  sofa2: I('Soffa 2-sits', 'soffa', 'sofa', 170, 90, 82, SAGE),
  sofa4: I('Soffa 4-sits', 'soffa', 'sofa', 270, 98, 82, '#b9ab97'),
  sofaLeather: I('Skinnsoffa', 'soffa', 'sofa', 200, 92, 78, '#7b5b45'),
  sofabed: I('Bäddsoffa', 'soffa', 'sofa', 200, 100, 85, BLUE),
  corner: I('Hörnsoffa', 'soffa', 'corner', 270, 165, 82, SAGE),
  cornerL: I('Stor hörnsoffa', 'soffa', 'corner', 320, 200, 82, '#b9ab97'),
  chaise: I('Schäslong', 'soffa', 'chaise', 85, 165, 82, GREY),
  daybed: I('Dagbädd', 'soffa', 'daybed', 205, 90, 75, WHITE),
  armchair: I('Fåtölj', 'soffa', 'sofa', 82, 85, 80, TAN),
  wingchair: I('Öronlappsfåtölj', 'soffa', 'sofa', 80, 88, 108, BLUE, { kind: 'wing' }),
  lounge: I('Loungefåtölj', 'soffa', 'lounge', 72, 80, 78, CHAR, { sym: 'sofa' }),
  swivel: I('Snurrfåtölj', 'soffa', 'swivel', 85, 80, 95, RED, { sym: 'officechair' }),
  rocking: I('Gungstol', 'soffa', 'rocking', 62, 95, 100, OAK, { sym: 'chair' }),
  pouf: I('Sittpuff', 'soffa', 'pouf', 55, 55, 40, BEIGE, { sym: 'round' }),
  ottoman: I('Fotpall', 'soffa', 'ottoman', 70, 55, 42, SAGE, { sym: 'cushion' }),
  beanbag: I('Saccosäck', 'soffa', 'beanbag', 90, 90, 70, BLUE, { sym: 'round' }),
  bench: I('Bänk', 'soffa', 'bench', 120, 38, 46, OAK),
  benchCushion: I('Bänk med dyna', 'soffa', 'bench', 140, 40, 48, OAK, { cushion: true }),

  // ---- Modulsoffa: delar som fäster i varandra ----
  modArmL: I('Ändmodul med vänster arm', 'modul', 'module', 100, 95, 82, SAGE, { kind: 'armL', module: true }),
  modSeat: I('Sittmodul 80', 'modul', 'module', 80, 95, 82, SAGE, { kind: 'seat', module: true }),
  modSeatW: I('Sittmodul 100', 'modul', 'module', 100, 95, 82, SAGE, { kind: 'seat', module: true }),
  modCorner: I('Hörnmodul', 'modul', 'module', 95, 95, 82, SAGE, { kind: 'corner', module: true }),
  modArmR: I('Ändmodul med höger arm', 'modul', 'module', 100, 95, 82, SAGE, { kind: 'armR', module: true }),
  modChaise: I('Schäslongmodul', 'modul', 'module', 80, 160, 82, SAGE, { kind: 'chaise', module: true }),
  modOttoman: I('Puffmodul', 'modul', 'module', 80, 95, 42, SAGE, { kind: 'ottoman', module: true }),
  modArm: I('Löst armstöd', 'modul', 'module', 20, 95, 62, SAGE, { kind: 'arm', module: true }),
  modRound90: C('Rundat hörn 90°', 90, 30, 'in', SAGE),
  modCurve45: C('Svängd modul 45°', 45, 40, 'in', SAGE),
  modCurve45L: C('Svängd modul 45°, stor båge', 45, 85, 'in', SAGE),
  modCurve30: C('Svängd modul 30°, flack båge', 30, 130, 'in', SAGE),
  modRoundOut90: C('Rundat ytterhörn 90°', 90, 30, 'out', SAGE),
  modCurveOut45: C('Utåtsvängd modul 45°', 45, 40, 'out', SAGE),

  // ---- Verkliga modulsoffor, med tillverkarnas mått ----
  // Ethnicraft N701 (Jacques Deneef). Mått från Nordic Nest och Lekker Home: djup 91, höjd 76, sitthöjd 43.
  // Innerradierna på de rundade hörnen är uträknade ur de publicerade yttermåtten (120×120 och 99×83).
  n701Seat1: I('N701 1-sits', 'n701', 'module', 80, 91, 76, '#cfc4b0', { kind: 'seat', module: true, sh: 43, low: true }),
  n701Seat2: I('N701 2-sits', 'n701', 'module', 140, 91, 76, '#cfc4b0', { kind: 'seat', module: true, sh: 43, low: true }),
  n701Seat3: I('N701 3-sits', 'n701', 'module', 210, 91, 76, '#cfc4b0', { kind: 'seat', module: true, sh: 43, low: true }),
  n701Corner: I('N701 hörn', 'n701', 'module', 91, 91, 76, '#cfc4b0', { kind: 'corner', module: true, sh: 43, low: true }),
  n701Round90: C('N701 rundat hörn 90°', 90, 29, 'in', '#cfc4b0', { cat: 'n701', depth: 91, h: 76, sh: 43, low: true, link: 'https://www.nordicnest.com/brands/ethnicraft-nv/n701-corner-module-rounded-90deg/' }),
  n701Round45: C('N701 rundat hörn 45°', 45, 26.4, 'in', '#cfc4b0', { cat: 'n701', depth: 91, h: 76, sh: 43, low: true, link: 'https://www.nordicnest.com/brands/ethnicraft-nv/n701-corner-module-rounded-45deg/' }),
  n701Foot: I('N701 fotpall', 'n701', 'module', 70, 70, 43, '#cfc4b0', { kind: 'ottoman', module: true, low: true }),
  // Bolia Angle (Says Who): bara svängda moduler. Ytterradie 135 (en hel ring är 270 cm), sittdjup 88, höjd 67, sitthöjd 41.
  angle45: C('Angle svängd modul 45°', 45, 47, 'in', '#cdbfa6', { cat: 'angle', depth: 88, h: 67, sh: 41, low: true }),
  angle90: C('Angle svängd modul 90°', 90, 47, 'in', '#cdbfa6', { cat: 'angle', depth: 88, h: 67, sh: 41, low: true }),

  // ---- Bord ----
  coffee: I('Soffbord', 'bord', 'table', 110, 60, 42, WOOD),
  coffeeShelf: I('Soffbord med hylla', 'bord', 'table', 120, 60, 45, WHITE, { shelf: true }),
  coffeeGlass: I('Soffbord i glas', 'bord', 'table', 110, 60, 40, BLACK, { glass: true }),
  coffeeRound: I('Runt soffbord', 'bord', 'roundtable', 80, 80, 40, WOOD),
  coffeeMarble: I('Runt marmorbord', 'bord', 'roundtable', 90, 90, 38, '#e9e6e0', { legs: 3, metal: true, marble: true }),
  nest: I('Satsbord', 'bord', 'nest', 85, 60, 48, BLACK),
  sidetable: I('Sidobord', 'bord', 'roundtable', 45, 45, 52, CHAR),
  sideWood: I('Sidobord i trä', 'bord', 'roundtable', 40, 40, 55, OAK, { legs: 3 }),
  console: I('Avlastningsbord', 'bord', 'table', 120, 35, 78, OAK),
  dining: I('Matbord 140', 'bord', 'table', 140, 85, 74, WOOD),
  diningL: I('Matbord 180', 'bord', 'table', 180, 90, 74, WOOD),
  diningXL: I('Matbord 240', 'bord', 'table', 240, 100, 75, WALNUT),
  diningRound: I('Runt matbord 110', 'bord', 'roundtable', 110, 110, 74, WOOD),
  diningRoundL: I('Runt matbord 140', 'bord', 'roundtable', 140, 140, 74, WOOD),
  diningOval: I('Ovalt matbord', 'bord', 'roundtable', 200, 105, 74, WHITE),
  dropleaf: I('Klaffbord', 'bord', 'table', 80, 60, 74, WHITE),
  bartable: I('Barbord', 'bord', 'roundtable', 60, 60, 105, BLACK),
  vanitytable: I('Sminkbord', 'bord', 'vanitytable', 100, 45, 140, WHITE, { sym: 'table' }),

  // ---- Stolar och pallar ----
  chair: I('Stol', 'stol', 'chair', 45, 52, 82, BLACK),
  chairSpindle: I('Pinnstol', 'stol', 'chair', 46, 50, 90, OAK, { kind: 'spindle' }),
  chairArm: I('Karmstol', 'stol', 'chair', 56, 55, 84, OAK, { kind: 'arm' }),
  chairPadded: I('Klädd stol', 'stol', 'chair', 48, 56, 86, BEIGE, { kind: 'padded' }),
  chairShell: I('Skalstol', 'stol', 'chair', 47, 52, 82, WHITE, { kind: 'shell' }),
  stool: I('Pall', 'stol', 'stool', 36, 36, 45, OAK, { sym: 'round' }),
  barstool: I('Barstol', 'stol', 'barstool', 40, 42, 92, BLACK),
  barstoolRound: I('Barpall', 'stol', 'stool', 36, 36, 75, OAK, { ring: true, sym: 'round' }),
  diningbench: I('Matbänk', 'stol', 'bench', 160, 36, 45, WOOD),
  kitchenbench: I('Kökssoffa', 'stol', 'bench', 150, 52, 88, WHITE, { back: true }),
  pianostool: I('Pianopall', 'stol', 'bench', 60, 34, 50, BLACK, { cushion: true }),

  // ---- Sängar ----
  bed180: I('Säng 180', 'sang', 'bed', 180, 200, 105, GREY),
  bed160: I('Säng 160', 'sang', 'bed', 160, 200, 105, GREY),
  bed140: I('Säng 140', 'sang', 'bed', 140, 200, 100, GREY),
  bed120: I('Säng 120', 'sang', 'bed', 120, 200, 100, GREY),
  bed90: I('Säng 90', 'sang', 'bed', 90, 200, 95, GREY),
  bedWood: I('Träsäng 160', 'sang', 'bed', 168, 210, 95, OAK, { kind: 'wood' }),
  bedMetal: I('Järnsäng 140', 'sang', 'bed', 146, 208, 115, BLACK, { kind: 'metal' }),
  bedCanopy: I('Himmelssäng 160', 'sang', 'bed', 170, 212, 210, OAK, { kind: 'canopy' }),
  bunk: I('Våningssäng', 'sang', 'bunk', 100, 208, 160, WHITE, { sym: 'bed' }),
  loftbed: I('Loftsäng', 'sang', 'bunk', 100, 208, 185, WHITE, { loft: true, sym: 'bed' }),
  nightstand: I('Sängbord', 'sang', 'drawers', 45, 40, 52, WOOD, { rows: 2, knob: true }),
  nightRound: I('Runt sängbord', 'sang', 'roundtable', 40, 40, 50, WHITE, { legs: 3 }),
  bedbench: I('Sängbänk', 'sang', 'bench', 140, 40, 45, GREY, { cushion: true }),

  // ---- Förvaring ----
  wardrobe: I('Garderob', 'forvaring', 'wardrobe', 100, 60, 236, WHITE),
  wardrobe150: I('Garderob 150', 'forvaring', 'wardrobe', 150, 60, 236, WHITE),
  wardrobeSlide: I('Skjutdörrsgarderob', 'forvaring', 'wardrobe', 200, 66, 236, WHITE, { kind: 'sliding' }),
  clothesrail: I('Klädställning', 'forvaring', 'clothesrail', 110, 45, 160, BLACK, { sym: 'rail' }),
  dresser: I('Byrå', 'forvaring', 'drawers', 100, 48, 82, WHITE, { rows: 3, cols: 2 }),
  dresser3: I('Byrå 3 lådor', 'forvaring', 'drawers', 80, 48, 78, WHITE, { rows: 3, knob: true }),
  dresserWide: I('Bred byrå 6 lådor', 'forvaring', 'drawers', 160, 48, 78, OAK, { rows: 3, cols: 2 }),
  tallboy: I('Hög byrå', 'forvaring', 'drawers', 60, 45, 125, WHITE, { rows: 5, knob: true }),
  dresserOld: I('Antik byrå', 'forvaring', 'drawers', 95, 50, 85, WALNUT, { rows: 3, legs: 'bun', brass: true }),
  sideboard: I('Skänk', 'forvaring', 'doors', 160, 45, 75, OAK),
  sideboardWhite: I('Sideboard med lådor', 'forvaring', 'doors', 180, 42, 68, WHITE, { drawerRow: true }),
  cabinet: I('Skåp', 'forvaring', 'doors', 80, 40, 120, WHITE),
  tallcabinet: I('Högskåp', 'forvaring', 'doors', 80, 40, 195, WHITE),
  vitrine: I('Vitrinskåp', 'forvaring', 'doors', 90, 40, 190, WHITE, { glass: true }),
  vitrineOld: I('Antikt vitrinskåp', 'forvaring', 'doors', 100, 45, 200, WALNUT, { glass: true }),
  bookshelf: I('Bokhylla', 'forvaring', 'shelf', 80, 30, 202, WHITE),
  bookshelfWide: I('Bred bokhylla', 'forvaring', 'shelf', 160, 30, 202, WHITE),
  bookshelfLow: I('Låg bokhylla', 'forvaring', 'shelf', 120, 30, 90, OAK),
  cube22: I('Kubhylla 2×2', 'forvaring', 'shelf', 77, 39, 77, WHITE, { cube: true }),
  cube24: I('Kubhylla 2×4', 'forvaring', 'shelf', 77, 39, 147, WHITE, { cube: true }),
  cube44: I('Kubhylla 4×4', 'forvaring', 'shelf', 147, 39, 147, WHITE, { cube: true }),
  laddershelf: I('Stegehylla', 'forvaring', 'laddershelf', 60, 40, 180, BLACK, { sym: 'shelf' }),
  wallshelf: I('Vägghylla', 'forvaring', 'wallshelf', 80, 22, 26, OAK, { wall: true, elev: 150, sym: 'overhead' }),
  stringshelf: I('Stringhylla', 'forvaring', 'wallshelf', 80, 22, 75, OAK, { wall: true, elev: 105, tiers: 3, sym: 'overhead' }),
  trunk: I('Kista', 'forvaring', 'trunk', 90, 45, 48, WALNUT),
  basket: I('Korg', 'forvaring', 'basket', 45, 45, 40, WOOD, { sym: 'round' }),
  cart: I('Rullvagn', 'forvaring', 'cart', 45, 35, 78, SAGE, { sym: 'cushion' }),

  // ---- Belysning ----
  floorlamp: I('Golvlampa', 'lampa', 'lamp', 38, 38, 158, BLACK),
  arclamp: I('Båglampa', 'lampa', 'lamp', 34, 34, 200, STEEL, { kind: 'arc', sym: 'arclamp' }),
  tripod: I('Trebenslampa', 'lampa', 'lamp', 60, 60, 150, OAK, { kind: 'tripod' }),
  readinglamp: I('Läslampa', 'lampa', 'lamp', 28, 28, 140, BRASS, { kind: 'reading' }),
  uplight: I('Uplight', 'lampa', 'lamp', 30, 30, 180, BLACK, { kind: 'uplight' }),
  paperfloor: I('Rislampa på golv', 'lampa', 'lamp', 34, 34, 120, WHITE, { kind: 'paper' }),
  lantern: I('Golvlykta', 'lampa', 'lamp', 22, 22, 45, BLACK, { kind: 'lantern' }),
  tablelamp: I('Bordslampa', 'lampa', 'lamp', 28, 28, 48, '#e9e6e0', { kind: 'table', top: true }),
  tablelampBlue: I('Bordslampa keramik', 'lampa', 'lamp', 32, 32, 58, '#5f7f96', { kind: 'table', top: true }),
  mushroom: I('Svamplampa', 'lampa', 'lamp', 24, 24, 30, MUSTARD, { kind: 'mushroom', top: true }),
  desklamp: I('Skrivbordslampa', 'lampa', 'lamp', 18, 40, 45, BLACK, { kind: 'desk', top: true }),
  pendant: I('Taklampa pendel', 'lampa', 'lamp', 40, 40, 100, BLACK, { kind: 'pendant', ceil: true, sym: 'ceil' }),
  pendantBrass: I('Pendel mässing', 'lampa', 'lamp', 32, 32, 110, BRASS, { kind: 'pendant', ceil: true, sym: 'ceil' }),
  pendantTrio: I('Tre pendlar över bord', 'lampa', 'lamp', 120, 24, 110, BLACK, { kind: 'trio', ceil: true, sym: 'ceil' }),
  pendantGlobe: I('Glasklot', 'lampa', 'lamp', 30, 30, 90, BRASS, { kind: 'globe', ceil: true, sym: 'ceil' }),
  ricelamp: I('Rislampa', 'lampa', 'lamp', 60, 60, 100, WHITE, { kind: 'rice', ceil: true, sym: 'ceil' }),
  chandelier: I('Kristallkrona', 'lampa', 'lamp', 70, 70, 110, BRASS, { kind: 'chandelier', ceil: true, sym: 'ceil' }),
  plafond: I('Plafond', 'lampa', 'lamp', 40, 40, 10, WHITE, { kind: 'plafond', ceil: true, sym: 'ceil' }),
  spots: I('Spotlightskena', 'lampa', 'lamp', 100, 10, 14, WHITE, { kind: 'spots', ceil: true, sym: 'ceil' }),
  ceilingfan: I('Takfläkt med lampa', 'lampa', 'lamp', 120, 120, 40, WHITE, { kind: 'fan', ceil: true, sym: 'ceil' }),
  sconce: I('Vägglampa', 'lampa', 'lamp', 16, 20, 28, BRASS, { kind: 'sconce', wall: true, elev: 160 }),

  // ---- Växter och krukor ----
  plant: I('Växt', 'vaxt', 'plant', 55, 55, 120, LEAF, { sym: 'tree' }),
  monstera: I('Monstera', 'vaxt', 'plant', 80, 80, 110, DLEAF, { kind: 'monstera', pot: 'white' }),
  fiddle: I('Fiolfikus', 'vaxt', 'plant', 65, 65, 170, DLEAF, { kind: 'fiddle', pot: 'sand', sym: 'tree' }),
  rubber: I('Gummifikus', 'vaxt', 'plant', 50, 50, 130, '#2f4a35', { kind: 'rubber', pot: 'black' }),
  palm: I('Palm', 'vaxt', 'plant', 110, 110, 180, LEAF, { kind: 'palm', pot: 'sand', sym: 'fronds' }),
  strelitzia: I('Paradisfågel', 'vaxt', 'plant', 90, 90, 190, DLEAF, { kind: 'strelitzia', pot: 'grey', sym: 'fronds' }),
  olive: I('Olivträd', 'vaxt', 'plant', 70, 70, 160, '#8a9a78', { kind: 'olive', pot: 'terra', sym: 'tree' }),
  citrus: I('Citronträd', 'vaxt', 'plant', 60, 60, 130, '#4f7a4a', { kind: 'citrus', pot: 'terra', fruit: '#e8c93a', sym: 'tree' }),
  yucca: I('Yuccapalm', 'vaxt', 'plant', 70, 70, 150, LEAF, { kind: 'yucca', pot: 'white', sym: 'fronds' }),
  dracaena: I('Drakblodsträd', 'vaxt', 'plant', 60, 60, 160, '#4c7350', { kind: 'dracaena', pot: 'grey', sym: 'fronds' }),
  bamboo: I('Bambu', 'vaxt', 'plant', 50, 50, 190, '#6f9458', { kind: 'bamboo', pot: 'black', sym: 'fronds' }),
  snake: I('Svärmorstunga', 'vaxt', 'plant', 34, 34, 85, '#4c6b4a', { kind: 'snake', pot: 'white', sym: 'fronds' }),
  cactus: I('Kaktus', 'vaxt', 'plant', 40, 40, 110, '#5f8a5b', { kind: 'cactus', pot: 'terra', sym: 'round' }),
  fern: I('Ormbunke', 'vaxt', 'plant', 70, 70, 60, '#5f8f52', { kind: 'fern', pot: 'terra', sym: 'fronds' }),
  peacelily: I('Fredskalla', 'vaxt', 'plant', 55, 55, 75, '#3f6b45', { kind: 'peacelily', pot: 'white' }),
  pampas: I('Pampasgräs i vas', 'vaxt', 'plant', 55, 55, 130, '#d9c9a8', { kind: 'pampas', pot: 'sand', sym: 'fronds' }),
  twigs: I('Kvistar i golvvas', 'vaxt', 'plant', 50, 50, 120, '#8a7458', { kind: 'twigs', pot: 'black', sym: 'fronds' }),
  urn: I('Stor kruka', 'vaxt', 'plant', 50, 50, 55, '#b9735a', { kind: 'emptypot', sym: 'round' }),
  planterbox: I('Blomlåda', 'vaxt', 'plant', 80, 22, 40, LEAF, { kind: 'planterbox', pot: 'grey', sym: 'box' }),
  xmas: I('Julgran', 'vaxt', 'plant', 110, 110, 200, '#2f5a3c', { kind: 'xmas', sym: 'tree' }),
  hangplant: I('Ampel', 'vaxt', 'plant', 34, 34, 110, '#5f8f52', { kind: 'hanging', pot: 'white', ceil: true, sym: 'ceil' }),
  trailing: I('Hängväxt i kruka', 'vaxt', 'plant', 30, 30, 26, '#5f8f52', { kind: 'trailing', pot: 'white', top: true }),
  succulent: I('Suckulent', 'vaxt', 'plant', 16, 16, 14, '#7fa58a', { kind: 'succulent', pot: 'terra', top: true }),
  orchid: I('Orkidé', 'vaxt', 'plant', 24, 24, 50, '#4c7350', { kind: 'orchid', pot: 'white', top: true }),
  herbs: I('Kryddkrukor', 'vaxt', 'plant', 45, 15, 22, LEAF, { kind: 'herbs', top: true, sym: 'box' }),
  bouquet: I('Blombukett i vas', 'vaxt', 'plant', 30, 30, 45, LEAF, { kind: 'bouquet', top: true }),
  tulips: I('Tulpaner i vas', 'vaxt', 'plant', 24, 24, 40, LEAF, { kind: 'bouquet', flower: '#d8432e', top: true }),
  bonsai: I('Bonsai', 'vaxt', 'plant', 40, 30, 38, '#4f7a4a', { kind: 'bonsai', pot: 'black', top: true }),

  // ---- Tavlor, speglar och pynt ----
  picture: I('Tavla 50×70', 'dekor', 'picture', 50, 4, 70, BLACK, { wall: true, elev: 120, art: 'abstract', sym: 'wallthin' }),
  pictureL: I('Stor tavla 100×140', 'dekor', 'picture', 100, 4, 140, OAK, { wall: true, elev: 70, art: 'abstract', sym: 'wallthin' }),
  pictureWide: I('Liggande tavla 120×80', 'dekor', 'picture', 120, 4, 80, BLACK, { wall: true, elev: 115, art: 'landscape', sym: 'wallthin' }),
  pictureLine: I('Linjekonst 40×50', 'dekor', 'picture', 40, 4, 50, OAK, { wall: true, elev: 130, art: 'line', sym: 'wallthin' }),
  pictureBot: I('Botanisk plansch', 'dekor', 'picture', 50, 4, 70, WHITE, { wall: true, elev: 120, art: 'botanical', sym: 'wallthin' }),
  picturePhoto: I('Fotografi svartvitt', 'dekor', 'picture', 70, 4, 50, BLACK, { wall: true, elev: 130, art: 'photo', sym: 'wallthin' }),
  poster: I('Affisch 70×100', 'dekor', 'picture', 70, 4, 100, BLACK, { wall: true, elev: 100, art: 'poster', sym: 'wallthin' }),
  worldmap: I('Världskarta', 'dekor', 'picture', 140, 4, 90, OAK, { wall: true, elev: 110, art: 'map', sym: 'wallthin' }),
  gallery: I('Tavelvägg', 'dekor', 'gallery', 180, 4, 120, BLACK, { wall: true, elev: 95, sym: 'wallthin' }),
  mirror: I('Väggspegel', 'dekor', 'mirror', 60, 4, 90, BLACK, { wall: true, elev: 100, sym: 'wallthin' }),
  mirrorRound: I('Rund spegel', 'dekor', 'mirror', 70, 4, 70, BRASS, { kind: 'round', wall: true, elev: 120, sym: 'wallthin' }),
  mirrorArch: I('Bågformad spegel', 'dekor', 'mirror', 70, 4, 160, BLACK, { kind: 'arch', wall: true, elev: 20, sym: 'wallthin' }),
  mirrorFloor: I('Golvspegel', 'dekor', 'mirror', 70, 26, 170, OAK, { kind: 'floor', wall: true, sym: 'wallthin' }),
  clock: I('Väggklocka', 'dekor', 'clock', 35, 5, 35, BLACK, { wall: true, elev: 170, sym: 'wallthin' }),
  vase: I('Vas', 'dekor', 'vase', 16, 16, 28, '#e9e6e0', { top: true, sym: 'round' }),
  vaseRound: I('Rund vas', 'dekor', 'vase', 22, 22, 22, '#5f7f96', { kind: 'round', top: true, sym: 'round' }),
  jug: I('Kanna', 'dekor', 'vase', 18, 18, 26, '#b9735a', { kind: 'jug', top: true, sym: 'round' }),
  floorvase: I('Golvvas', 'dekor', 'vase', 30, 30, 70, CHAR, { sym: 'round' }),
  candles: I('Ljusstakar', 'dekor', 'candles', 30, 10, 38, BRASS, { top: true, sym: 'box' }),
  bookstack: I('Bokhög', 'dekor', 'books', 26, 20, 14, '#7a5c4a', { top: true, sym: 'box' }),
  bowl: I('Fruktskål', 'dekor', 'bowl', 30, 30, 14, '#e9e6e0', { top: true, sym: 'round' }),
  photoframe: I('Fotoram', 'dekor', 'photoframe', 20, 10, 26, BLACK, { top: true, sym: 'box' }),
  globe: I('Jordglob', 'dekor', 'globe', 28, 28, 40, BRASS, { top: true, sym: 'round' }),
  sculpture: I('Skulptur', 'dekor', 'sculpture', 24, 24, 45, '#b08d57', { top: true, sym: 'round' }),
  kakelugn: I('Rund kakelugn', 'dekor', 'fireplace', 75, 75, 250, PORC, { kind: 'kakelugn', sym: 'round' }),
  kakelugnRect: I('Rak kakelugn', 'dekor', 'fireplace', 90, 55, 250, PORC, { kind: 'kakelrect', wall: true, sym: 'hearth' }),
  kamin: I('Braskamin', 'dekor', 'fireplace', 50, 42, 230, BLACK, { kind: 'kamin', sym: 'hearth' }),
  fireplace: I('Öppen spis', 'dekor', 'fireplace', 140, 45, 120, WHITE, { kind: 'open', wall: true, sym: 'hearth' }),
  aquarium: I('Akvarium', 'dekor', 'aquarium', 100, 40, 130, BLACK, { sym: 'tank' }),
  partition: I('Vikskärm', 'dekor', 'partition', 150, 40, 170, OAK, { sym: 'zigzag' }),

  // ---- Mattor och gardiner ----
  rug: I('Matta 200×300', 'textil', 'rug', 200, 300, 1.5, '#d6cbb6'),
  rugM: I('Matta 160×230', 'textil', 'rug', 160, 230, 1.5, '#c9ccc4'),
  rugS: I('Matta 140×200', 'textil', 'rug', 140, 200, 1.5, '#b9ab97'),
  rugPersian: I('Orientalisk matta', 'textil', 'rug', 200, 300, 1.5, '#8e3b34', { pattern: 'persian' }),
  rugBerber: I('Berbermatta', 'textil', 'rug', 170, 240, 2, '#e4dccb', { pattern: 'berber' }),
  rugStripe: I('Randig trasmatta', 'textil', 'rug', 80, 200, 1, '#6f7f8c', { pattern: 'stripe' }),
  rugKilim: I('Kelim', 'textil', 'rug', 140, 200, 1, '#a3554a', { pattern: 'kilim' }),
  rugCheck: I('Rutig matta', 'textil', 'rug', 140, 200, 1.5, '#8d9a8a', { pattern: 'check' }),
  runner: I('Gångmatta', 'textil', 'rug', 80, 250, 1, '#b0875c', { pattern: 'stripe' }),
  rugRound: I('Rund matta 200', 'textil', 'roundrug', 200, 200, 1.5, '#c9ccc4'),
  rugRoundS: I('Rund matta 150', 'textil', 'roundrug', 150, 150, 1.5, '#d6cbb6'),
  rugJute: I('Rund jutematta', 'textil', 'roundrug', 180, 180, 1.5, '#c2a878'),
  sheepskin: I('Fårskinn', 'textil', 'fur', 60, 95, 3, '#f4f1e8', { ghost: true, sym: 'roundrug' }),
  cowhide: I('Kohud', 'textil', 'fur', 170, 200, 1, '#7b5b45', { ghost: true, sym: 'roundrug' }),
  curtains: I('Gardiner (par)', 'textil', 'curtain', 200, 14, 300, '#e7e3da', { kind: 'pair', wall: true, full: true, ghost: true }),
  curtainFull: I('Fördragen gardin', 'textil', 'curtain', 200, 14, 300, '#8d9a8a', { kind: 'closed', wall: true, full: true, ghost: true }),
  sheer: I('Tunn vit gardin', 'textil', 'curtain', 200, 12, 300, '#fbfaf6', { kind: 'sheer', wall: true, full: true, ghost: true }),
  blind: I('Rullgardin', 'textil', 'curtain', 120, 8, 150, '#e7e3da', { kind: 'blind', wall: true, elev: 95, ghost: true }),

  // ---- TV, ljud och musik ----
  tv: I('TV 65″', 'media', 'tv', 146, 6, 84, '#15171a', { inch: 65, elev: 62 }),
  tvstand: I('TV på golvstativ', 'media', 'tvstand', 124, 50, 140, OAK, { sym: 'tv' }),
  tvbench: I('TV-bänk', 'media', 'doors', 180, 40, 45, WHITE),
  tvbenchOak: I('TV-bänk i ek', 'media', 'doors', 160, 40, 50, OAK, { open: true }),
  speaker: I('Golvhögtalare', 'media', 'speaker', 22, 30, 100, WALNUT),
  speakerSmall: I('Hyllhögtalare', 'media', 'speaker', 18, 22, 30, BLACK, { top: true }),
  soundbar: I('Soundbar', 'media', 'soundbar', 90, 10, 7, BLACK, { top: true, sym: 'box' }),
  turntable: I('Skivspelare', 'media', 'turntable', 45, 36, 14, WALNUT, { top: true, sym: 'speaker' }),
  piano: I('Piano', 'media', 'piano', 150, 60, 125, '#1b1c1e'),
  grandpiano: I('Flygel', 'media', 'grandpiano', 150, 185, 100, '#1b1c1e'),
  digitalpiano: I('Digitalpiano', 'media', 'piano', 136, 40, 85, BLACK, { kind: 'digital' }),
  guitar: I('Gitarr på stativ', 'media', 'guitar', 42, 36, 110, '#c58a4b', { sym: 'box' }),

  // ---- Arbetsplats ----
  desk: I('Skrivbord', 'arbete', 'table', 140, 70, 74, WHITE),
  deskDrawers: I('Skrivbord med lådor', 'arbete', 'table', 140, 65, 75, OAK, { drawers: true }),
  standdesk: I('Höj- och sänkbart skrivbord', 'arbete', 'standdesk', 160, 80, 110, OAK, { sym: 'table' }),
  officechair: I('Kontorsstol', 'arbete', 'officechair', 62, 62, 98, BLACK),
  gamingchair: I('Gamingstol', 'arbete', 'officechair', 66, 66, 128, BLACK, { kind: 'gaming' }),
  pedestal: I('Hurts', 'arbete', 'drawers', 40, 55, 60, WHITE, { rows: 3, wheels: true }),
  filing: I('Arkivskåp', 'arbete', 'drawers', 46, 62, 132, '#8d9296', { rows: 4, legs: 'plinth' }),
  monitor: I('Bildskärm', 'arbete', 'monitor', 61, 20, 45, BLACK, { top: true, sym: 'box' }),
  laptop: I('Laptop', 'arbete', 'laptop', 33, 23, 22, '#c9cdd1', { top: true, sym: 'box' }),
  printer: I('Skrivare', 'arbete', 'printer', 45, 38, 22, WHITE, { top: true, sym: 'box' }),
  whiteboard: I('Whiteboard', 'arbete', 'picture', 120, 4, 90, '#c9cdd1', { wall: true, elev: 100, art: 'white', sym: 'wallthin' }),
  corkboard: I('Anslagstavla', 'arbete', 'picture', 90, 4, 60, OAK, { wall: true, elev: 115, art: 'cork', sym: 'wallthin' }),
  paperbin: I('Papperskorg', 'arbete', 'bin', 28, 28, 32, BLACK, { kind: 'paper', sym: 'round' }),

  // ---- Kök ----
  island: I('Köksö', 'kok', 'counter', 180, 90, 90, KITCHEN),
  bar: I('Bardisk', 'kok', 'counter', 160, 55, 105, KITCHEN),
  counter: I('Bänkskåp', 'kok', 'counter', 60, 62, 90, KITCHEN),
  sink: I('Diskbänk', 'kok', 'sink', 80, 62, 90, KITCHEN),
  stove: I('Spishäll', 'kok', 'stove', 60, 62, 90, KITCHEN),
  range: I('Fristående spis', 'kok', 'range', 60, 62, 90, WHITE, { sym: 'stove' }),
  dishwasher: I('Diskmaskin', 'kok', 'counter', 60, 62, 90, STEEL),
  fridge: I('Kyl/frys', 'kok', 'fridge', 60, 62, 200, STEEL),
  fridgeDouble: I('Amerikansk kyl', 'kok', 'fridge', 91, 72, 178, STEEL, { kind: 'double' }),
  freezer: I('Frysskåp', 'kok', 'fridge', 60, 62, 185, WHITE, { kind: 'single' }),
  winefridge: I('Vinkyl', 'kok', 'fridge', 60, 57, 85, BLACK, { kind: 'wine' }),
  tallcab: I('Högskåp ugn/micro', 'kok', 'tallcab', 60, 62, 215, KITCHEN),
  wallcab: I('Väggskåp', 'kok', 'wallcab', 60, 35, 70, KITCHEN, { wall: true, elev: 145, sym: 'overhead' }),
  wallcabWide: I('Väggskåp 120', 'kok', 'wallcab', 120, 35, 70, KITCHEN, { wall: true, elev: 145, sym: 'overhead' }),
  hood: I('Köksfläkt', 'kok', 'hood', 60, 48, 80, STEEL, { wall: true, elev: 160, sym: 'overhead' }),
  microwave: I('Mikrovågsugn', 'kok', 'microwave', 46, 35, 26, STEEL, { top: true, sym: 'box' }),
  coffeemaker: I('Espressomaskin', 'kok', 'coffeemaker', 24, 40, 36, STEEL, { top: true, sym: 'box' }),
  barcart: I('Serveringsvagn', 'kok', 'cart', 70, 40, 80, BRASS, { bar: true, sym: 'cushion' }),
  bin: I('Sopkärl', 'kok', 'bin', 30, 30, 65, STEEL, { sym: 'round' }),

  // ---- Badrum och tvätt ----
  bathtub: I('Badkar', 'bad', 'bathtub', 70, 160, 56, PORC),
  tubfree: I('Fristående badkar', 'bad', 'tubfree', 80, 170, 60, PORC),
  shower: I('Duschhörna', 'bad', 'shower', 90, 90, 200, PORC),
  showerWalkin: I('Duschvägg', 'bad', 'shower', 90, 120, 200, PORC, { kind: 'walkin' }),
  toilet: I('Toalett', 'bad', 'toilet', 38, 68, 80, PORC),
  toiletWall: I('Vägghängd toalett', 'bad', 'toilet', 37, 54, 42, PORC, { kind: 'wall' }),
  vanity: I('Kommod', 'bad', 'vanity', 80, 48, 84, '#6f6a62'),
  vanityDouble: I('Dubbelkommod', 'bad', 'vanity', 160, 48, 84, OAK),
  pedsink: I('Handfat på pelare', 'bad', 'pedsink', 56, 46, 85, PORC, { sym: 'basin' }),
  mirrorcab: I('Spegelskåp', 'bad', 'mirrorcab', 80, 15, 70, WHITE, { wall: true, elev: 115, sym: 'overhead' }),
  bathcab: I('Badrumsskåp', 'bad', 'doors', 40, 35, 180, WHITE),
  towelrail: I('Handdukstork', 'bad', 'towelrail', 50, 10, 110, STEEL, { wall: true, elev: 60, sym: 'radiator' }),
  washer: I('Tvättmaskin', 'bad', 'washer', 60, 60, 85, '#f1f1ee'),
  washtower: I('Tvättpelare TM/TT', 'bad', 'washer', 60, 65, 172, '#f1f1ee'),
  laundry: I('Tvättkorg', 'bad', 'basket', 42, 42, 58, '#e7e3da', { fill: '#6f7f8c', sym: 'round' }),
  dryrack: I('Torkställning', 'bad', 'dryrack', 55, 170, 95, WHITE, { sym: 'rack' }),
  ironing: I('Strykbräda', 'bad', 'ironing', 38, 125, 90, '#9fb8ad', { sym: 'cushion' }),
  bathmat: I('Badrumsmatta', 'bad', 'rug', 50, 80, 1.5, '#e7e3da'),

  // ---- Hall ----
  coatrack: I('Hatthylla', 'hall', 'coatrack', 100, 30, 22, BLACK, { elev: 168 }),
  coatstand: I('Klädhängare', 'hall', 'coatstand', 50, 50, 178, OAK, { sym: 'star' }),
  shoerack: I('Skohylla', 'hall', 'shoerack', 80, 30, 50, BLACK, { sym: 'shelf' }),
  shoecab: I('Skoskåp', 'hall', 'drawers', 80, 26, 125, WHITE, { rows: 3, legs: 'plinth' }),
  hallbench: I('Hallbänk med hylla', 'hall', 'bench', 100, 35, 48, OAK, { cushion: true, shelf: true }),
  doormat: I('Dörrmatta', 'hall', 'rug', 60, 90, 1.5, '#8a7458'),
  umbrella: I('Paraplyställ', 'hall', 'umbrella', 24, 24, 85, BLACK, { sym: 'round' }),

  // ---- Barnrum ----
  crib: I('Spjälsäng', 'barn', 'crib', 66, 126, 90, WHITE),
  kidbed: I('Barnsäng', 'barn', 'bed', 78, 168, 70, WHITE, { kind: 'wood' }),
  changing: I('Skötbord', 'barn', 'changing', 75, 80, 98, WHITE, { rows: 3, sym: 'cabinet' }),
  kidtable: I('Barnbord', 'barn', 'table', 75, 55, 50, '#9fb8ad'),
  kidchair: I('Barnstol', 'barn', 'chair', 32, 32, 58, MUSTARD),
  highchair: I('Matstol för barn', 'barn', 'highchair', 56, 60, 92, WHITE, { sym: 'chair' }),
  toybox: I('Leksakslåda', 'barn', 'trunk', 70, 40, 42, '#6fa3b5'),
  teepee: I('Tipitält', 'barn', 'teepee', 120, 120, 155, '#efe6d6'),
  playmat: I('Lekmatta', 'barn', 'roundrug', 140, 140, 2, '#e3b23c', { pattern: 'play' }),
  stroller: I('Barnvagn', 'barn', 'stroller', 60, 100, 105, '#3d4043', { sym: 'cushion' }),

  // ---- Träning och fritid ----
  treadmill: I('Löpband', 'fritid', 'treadmill', 85, 175, 140, '#3d4043'),
  exbike: I('Motionscykel', 'fritid', 'exbike', 55, 110, 125, '#3d4043', { sym: 'bike' }),
  gymbench: I('Träningsbänk', 'fritid', 'gymbench', 45, 120, 45, '#2f3336', { sym: 'bench' }),
  dumbbells: I('Hantelställ', 'fritid', 'dumbbells', 100, 50, 80, BLACK, { sym: 'rack' }),
  yogamat: I('Yogamatta', 'fritid', 'rug', 61, 183, 0.6, '#7d6b91'),
  pooltable: I('Biljardbord', 'fritid', 'pooltable', 150, 270, 80, WALNUT),
  pingpong: I('Pingisbord', 'fritid', 'table', 152, 274, 76, '#27506b', { net: true }),
  dartboard: I('Darttavla', 'fritid', 'clock', 45, 5, 45, BLACK, { kind: 'dart', wall: true, elev: 150, sym: 'wallthin' }),
  bicycle: I('Cykel', 'fritid', 'bicycle', 58, 175, 105, '#a3554a', { sym: 'bike' }),
  easel: I('Staffli', 'fritid', 'easel', 65, 70, 170, OAK, { sym: 'box' }),
  dogbed: I('Hundbädd', 'fritid', 'dogbed', 80, 60, 20, '#8b8f98', { sym: 'round' }),
  cattree: I('Klösträd', 'fritid', 'cattree', 60, 50, 130, '#b9ab97', { sym: 'box' }),

  // ---- Balkong ----
  cafetable: I('Cafébord', 'ute', 'roundtable', 60, 60, 72, '#3f5f43', { legs: 3, metal: true }),
  cafechair: I('Caféstol', 'ute', 'chair', 42, 46, 82, '#3f5f43', { kind: 'spindle' }),
  outdoorlounge: I('Loungefåtölj ute', 'ute', 'lounge', 75, 82, 75, '#e7e3da', { sym: 'sofa' }),
  sunbed: I('Solstol', 'ute', 'sunbed', 65, 190, 70, '#e7e3da', { sym: 'cushion' }),
  parasol: I('Parasoll', 'ute', 'parasol', 250, 250, 240, '#e7e3da', { ghost: true, sym: 'ceil' }),
  grill: I('Klotgrill', 'ute', 'grill', 57, 57, 100, BLACK, { sym: 'round' }),
  balconybox: I('Balkonglåda', 'ute', 'plant', 80, 20, 35, LEAF, { kind: 'planterbox', pot: 'black', sym: 'box' }),

  // ---- Övrigt ----
  custom: I('Egen möbel', 'ovrigt', 'box', 100, 60, 75, '#c8ccc6'),
  customRound: I('Egen rund möbel', 'ovrigt', 'cylinder', 60, 60, 75, '#c8ccc6', { sym: 'round' }),
  radiator: I('Element', 'ovrigt', 'radiator', 100, 12, 60, WHITE, { wall: true, elev: 12 }),
  movingbox: I('Flyttkartong', 'ovrigt', 'movingbox', 60, 40, 35, '#c8a878', { sym: 'trunk' }),
  boxstack: I('Tre flyttkartonger', 'ovrigt', 'movingbox', 62, 44, 105, '#c8a878', { stack: 3, sym: 'trunk' }),
  suitcase: I('Resväska', 'ovrigt', 'suitcase', 45, 28, 72, '#5f7f96', { sym: 'cushion' }),
  robotvac: I('Robotdammsugare', 'ovrigt', 'robotvac', 34, 34, 9, '#2f3336', { sym: 'round' }),
  stepladder: I('Trappstege', 'ovrigt', 'ladder', 48, 85, 150, STEEL, { sym: 'rack' }),
  floorfan: I('Golvfläkt', 'ovrigt', 'fan', 42, 36, 125, WHITE, { sym: 'round' }),
  column: I('Pelare', 'ovrigt', 'cylinder', 30, 30, 320, '#f4f2ec', { full: true, sym: 'round' }),
};

export const FLOORS = {
  fiskben: { name: 'Fiskbensparkett', c2d: '#ead9bb' },
  ek: { name: 'Ekparkett', c2d: '#e6d2ae' },
  ljus: { name: 'Vitlaserad ask', c2d: '#eee7da' },
  valnot: { name: 'Mörk parkett', c2d: '#b79677' },
  klinker: { name: 'Ljus klinker', c2d: '#dfe3e3' },
  skiffer: { name: 'Mörk klinker', c2d: '#9aa0a2' },
  betong: { name: 'Betong', c2d: '#cfd0cc' },
};

export const WALL_COLORS = ['#f4f2ec', '#e9e6dd', '#dfe5e4', '#d8ddd2', '#e6d8cf', '#c9d2d8', '#b7c0b0', '#8f9aa3'];
export const ITEM_COLORS = ['#f2f1ec', '#c7b299', '#c9a67a', '#b98d5e', '#6b452b', '#2f3336', '#8b8f98', '#6f7f8c', '#27364a', '#8d9a8a', '#3f5f43', '#d9a441', '#a3554a', '#d8b4a0', '#b08d57'];

export const def = (it) => CATALOG[it.type] || CATALOG.custom;
export const shapeOf = (it) => def(it).shape;

export function tvSize(inch) {
  return { w: Math.round(inch * 2.54 * 0.8716 + 2), h: Math.round(inch * 2.54 * 0.4903 + 2) };
}

export function newItem(type, id, x, y) {
  const d = CATALOG[type];
  const it = { id, type, name: d.name, x, y, rot: 0, w: d.w, d: d.d, h: d.h, color: d.color, price: '', link: '' };
  if (d.elev != null) it.elev = d.elev;
  if (d.inch) it.inch = d.inch;
  if (d.link) it.link = d.link;
  return it;
}

export function cornerDims(it) {
  return { md: Math.min(100, it.d * 0.6), cw: Math.min(110, it.w * 0.42) };
}

/**
 * Mått för en svängd soffmodul. pt(r, φ) ger en punkt på radien r (cm) och vinkeln φ (radianer, 0 = vänster ände)
 * i möbelns lokala koordinater, där origo är mitten av den yta modulen tar upp.
 */
export function curveGeom(it) {
  const d = def(it), th = (d.angle * Math.PI) / 180, ri = d.ri, ro = ri + (d.depth || SEAT_DEPTH), out = d.curve === 'out';
  const W0 = ro * Math.sin(th), D0 = ro - ri * Math.cos(th), cx = W0 / 2, cy = ((out ? 1 : -1) * (ro + ri * Math.cos(th))) / 2;
  const sx = it.w / W0, sy = it.d / D0;
  const pt = (r, a) => [(r * Math.sin(a) - cx) * sx, ((out ? 1 : -1) * r * Math.cos(a) - cy) * sy];
  return { th, ri, ro, out, pt, back: out ? ri : ro, front: out ? ro : ri, dir: out ? 1 : -1 };
}
/** Hörnpunkterna runt en bit av ringen, mellan radierna r0–r1 och vinklarna a0–a1. */
export function curveBand(g, r0, r1, a0 = 0, a1 = g.th, step = 0.13) {
  const n = Math.max(1, Math.ceil((a1 - a0) / step)), pts = [];
  for (let i = 0; i <= n; i++) pts.push(g.pt(r1, a0 + ((a1 - a0) * i) / n));
  for (let i = n; i >= 0; i--) pts.push(g.pt(r0, a0 + ((a1 - a0) * i) / n));
  return pts;
}
/**
 * Ändarna där en soffmodul kan sitta ihop med nästa. b = hörnet mot ryggen, n = riktningen ut från änden,
 * f = riktningen från ryggen mot framkanten, len = ändens längd. En höger ände passar bara mot en vänster.
 */
export function connectors(it) {
  const d = def(it);
  if (!d.module) return [];
  if (d.curve) {
    const g = curveGeom(it), s = Math.sin(g.th), c = Math.cos(g.th), len = g.ro - g.ri;
    return g.out
      ? [{ b: g.pt(g.ri, 0), n: [-1, 0], f: [0, 1], len, right: false }, { b: g.pt(g.ri, g.th), n: [c, -s], f: [s, c], len, right: true }]
      : [{ b: g.pt(g.ro, 0), n: [-1, 0], f: [0, 1], len, right: false }, { b: g.pt(g.ro, g.th), n: [c, s], f: [-s, c], len, right: true }];
  }
  const w = it.w / 2, h = it.d / 2;
  const L = { b: [-w, -h], n: [-1, 0], f: [0, 1], len: it.d, right: false }, R = { b: [w, -h], n: [1, 0], f: [0, 1], len: it.d, right: true };
  if (d.kind === 'armL') return [R];
  if (d.kind === 'armR') return [L];
  if (d.kind === 'corner') return [L, { b: [w, h], n: [0, 1], f: [-1, 0], len: it.w, right: true }];
  return [L, R];
}

/** Ytan möbeln tar på golvet: rektanglar { x, y, w, d } eller konvexa månghörningar { poly } i lokala koordinater. */
export function footprintLocal(it) {
  if (def(it).curve) {
    const g = curveGeom(it), n = Math.max(1, Math.ceil(g.th / 0.4)), out = [];
    for (let i = 0; i < n; i++) {
      const a0 = (g.th * i) / n, a1 = (g.th * (i + 1)) / n;
      out.push({ poly: [g.pt(g.ro, a0), g.pt(g.ro, a1), g.pt(g.ri, a1), g.pt(g.ri, a0)] });
    }
    return out;
  }
  if (shapeOf(it) === 'corner') {
    const { md, cw } = cornerDims(it), s = it.mirror ? 1 : -1;
    return [
      { x: 0, y: -it.d / 2 + md / 2, w: it.w, d: md },
      { x: s * (it.w / 2 - cw / 2), y: md / 2, w: cw, d: it.d - md },
    ];
  }
  return [{ x: 0, y: 0, w: it.w, d: it.d }];
}

// ---------- 2D-symboler ----------
const f = (n) => +n.toFixed(1);
const NOFILL = ' fill="none"';
const rect = (x, y, w, h, rx = 0, cls = 'd', extra = '') =>
  `<rect class="${cls}" x="${f(x)}" y="${f(y)}" width="${f(Math.max(0.1, w))}" height="${f(Math.max(0.1, h))}"${rx ? ` rx="${f(rx)}"` : ''}${extra || NOFILL}/>`;
const line = (x1, y1, x2, y2, cls = 'd') => `<line class="${cls}" x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}"/>`;
const ell = (cx, cy, rx, ry, cls = 'd', extra = '') => `<ellipse class="${cls}" cx="${f(cx)}" cy="${f(cy)}" rx="${f(Math.max(0.1, rx))}" ry="${f(Math.max(0.1, ry))}"${extra || NOFILL}/>`;
const fill = (c) => ` fill="${c}"`;

const SHAPES = {
  sofa({ w, d, color }) {
    const arm = Math.min(22, w * 0.13), bk = Math.min(24, d * 0.27);
    const n = Math.max(1, Math.round((w - 2 * arm) / 75)), sw = (w - 2 * arm) / n;
    let s = rect(-w / 2, -d / 2, w, d, 9, 'body', fill(color));
    s += rect(-w / 2 + arm, -d / 2 + bk, w - 2 * arm, d - bk - 3, 5);
    for (let i = 1; i < n; i++) s += line(-w / 2 + arm + i * sw, -d / 2 + bk, -w / 2 + arm + i * sw, d / 2 - 3);
    return s;
  },
  corner(it) {
    const { w, d, color } = it, { md, cw } = cornerDims(it), bk = 24, arm = 20;
    const x0 = -w / 2, x1 = w / 2, y0 = -d / 2, y1 = d / 2, ym = y0 + md, xc = x0 + cw;
    let s = `<path class="body"${fill(color)} d="M${f(x0)} ${f(y0)}H${f(x1)}V${f(ym)}H${f(xc)}V${f(y1)}H${f(x0)}Z"/>`;
    s += `<path class="d" fill="none" d="M${f(x0 + arm)} ${f(y1 - 3)}V${f(y0 + bk)}H${f(x1 - arm)}V${f(ym - 3)}"/>`;
    s += line(xc, ym, xc, y0 + bk);
    return it.mirror ? `<g transform="scale(-1 1)">${s}</g>` : s;
  },
  table({ w, d, color }) {
    return rect(-w / 2, -d / 2, w, d, 3, 'body', fill(color)) + rect(-w / 2 + 5, -d / 2 + 5, w - 10, d - 10, 2);
  },
  roundtable({ w, d, color }) {
    return ell(0, 0, w / 2, d / 2, 'body', fill(color)) + ell(0, 0, w / 2 - 5, d / 2 - 5);
  },
  cabinet({ w, d, color }) {
    const n = Math.max(1, Math.round(w / 60));
    let s = rect(-w / 2, -d / 2, w, d, 2, 'body', fill(color)) + line(-w / 2, d / 2 - 4, w / 2, d / 2 - 4);
    for (let i = 1; i < n; i++) s += line(-w / 2 + (i * w) / n, d / 2 - 4, -w / 2 + (i * w) / n, d / 2);
    return s;
  },
  wardrobe({ w, d, color }) {
    const n = Math.max(1, Math.round(w / 50));
    let s = rect(-w / 2, -d / 2, w, d, 1, 'body', fill(color)) + line(-w / 2, 0, w / 2, 0);
    for (let i = 1; i < n; i++) s += line(-w / 2 + (i * w) / n, -d / 2, -w / 2 + (i * w) / n, d / 2);
    return s;
  },
  shelf({ w, d, color }) {
    const n = Math.max(1, Math.round(w / 80));
    let s = rect(-w / 2, -d / 2, w, d, 1, 'body', fill(color));
    for (let i = 1; i < n; i++) s += line(-w / 2 + (i * w) / n, -d / 2, -w / 2 + (i * w) / n, d / 2);
    return s + line(-w / 2, -d / 2 + 3, w / 2, -d / 2 + 3);
  },
  tv({ w, d, color }) {
    return rect(-w / 2, -d / 2, w, d, 1, 'body', fill(color));
  },
  rug({ w, d, color }) {
    return rect(-w / 2, -d / 2, w, d, 2, 'body rugbody', fill(color)) + rect(-w / 2 + 9, -d / 2 + 9, w - 18, d - 18, 1);
  },
  roundrug({ w, d, color }) {
    return ell(0, 0, w / 2, d / 2, 'body rugbody', fill(color)) + ell(0, 0, w / 2 - 9, d / 2 - 9);
  },
  bed({ w, d, color }) {
    const n = w >= 120 ? 2 : 1, m = 7, pw = (w - m * (n + 1)) / n;
    let s = rect(-w / 2, -d / 2, w, d, 4, 'body', fill(color));
    s += rect(-w / 2 + 3, -d / 2 + 8, w - 6, d - 11, 5, 'd soft');
    for (let i = 0; i < n; i++) s += rect(-w / 2 + m + i * (pw + m), -d / 2 + 13, pw, 36, 7, 'd soft');
    return s + line(-w / 2 + 3, -d / 2 + 62, w / 2 - 3, -d / 2 + 62);
  },
  barstool({ w, d, color }) {
    return rect(-w / 2, -d / 2, w, d, Math.min(w, d) / 2.4, 'body', fill(color)) + line(-w / 2 + 6, -d / 2 + 5, w / 2 - 6, -d / 2 + 5);
  },
  chair({ w, d, color }) {
    return rect(-w / 2, -d / 2, w, d, 6, 'body', fill(color)) + line(-w / 2 + 3, -d / 2 + 7, w / 2 - 3, -d / 2 + 7);
  },
  officechair({ w, d, color }) {
    return ell(0, 3, w / 2 - 4, d / 2 - 5, 'body', fill(color)) + `<path class="d" fill="none" d="M${f(-w / 2 + 6)} ${f(-d / 2 + 14)}Q0 ${f(-d / 2 - 4)} ${f(w / 2 - 6)} ${f(-d / 2 + 14)}"/>`;
  },
  lamp({ w, d, color }) {
    return ell(0, 0, w / 2, d / 2, 'body', fill('#f3e7c4')) + ell(0, 0, w / 5, d / 5, 'd', fill(color));
  },
  plant({ w, d, color }) {
    let s = ell(0, 0, w / 2, d / 2, 'body', fill(color));
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5 - 1.2;
      s += line(0, 0, (Math.cos(a) * w) / 2.3, (Math.sin(a) * d) / 2.3);
    }
    return s + ell(0, 0, w / 6, d / 6, 'd', fill('#c4b59f'));
  },
  counter({ w, d, color }) {
    return rect(-w / 2, -d / 2, w, d, 0, 'body', fill(color)) + line(-w / 2, d / 2 - 3, w / 2, d / 2 - 3);
  },
  sink({ w, d, color }) {
    const bw = Math.min(w - 16, 52), bd = Math.min(d - 24, 40);
    return SHAPES.counter({ w, d, color }) + rect(-bw / 2, -bd / 2 + 2, bw, bd, 5, 'd', fill('#c9ced1')) + ell(0, -bd / 2 - 4, 2.5, 2.5);
  },
  stove({ w, d, color }) {
    const r = Math.min(w, d) * 0.14, ox = w * 0.21, oy = d * 0.19;
    let s = SHAPES.counter({ w, d, color }) + rect(-w / 2 + 3, -d / 2 + 5, w - 6, d - 12, 2, 'd', fill('#2b2e31'));
    for (const [x, y] of [[-ox, -oy], [ox, -oy], [-ox, oy], [ox, oy]]) s += ell(x, y - 1, r, r, 'd lite');
    return s;
  },
  fridge({ w, d, color }) {
    return rect(-w / 2, -d / 2, w, d, 2, 'body', fill(color)) + line(-w / 2, d / 2 - 4, w / 2, d / 2 - 4) + line(-w / 2, -d / 2, w / 2, d / 2 - 4);
  },
  tallcab({ w, d, color }) {
    return rect(-w / 2, -d / 2, w, d, 1, 'body', fill(color)) + line(-w / 2, d / 2 - 4, w / 2, d / 2 - 4) + rect(-w / 2 + 6, -d / 2 + 6, w - 12, d - 16, 1);
  },
  bathtub({ w, d, color }) {
    return rect(-w / 2, -d / 2, w, d, 4, 'body', fill(color)) + rect(-w / 2 + 6, -d / 2 + 6, w - 12, d - 12, Math.min(w, d) / 2 - 8) + ell(0, -d / 2 + 22, 2.5, 2.5);
  },
  toilet({ w, d, color }) {
    const tank = Math.min(20, d * 0.3);
    return rect(-w / 2, -d / 2, w, tank, 3, 'body', fill(color)) + ell(0, -d / 2 + tank + (d - tank) / 2 - 1, w / 2 - 1, (d - tank) / 2, 'body', fill(color)) + ell(0, -d / 2 + tank + (d - tank) / 2, w / 2 - 6, (d - tank) / 2 - 7);
  },
  vanity({ w, d, color }) {
    const n = w > 150 ? 2 : 1;
    let s = rect(-w / 2, -d / 2, w, d, 1, 'body', fill(color));
    for (let i = 0; i < n; i++) {
      const cx = n === 1 ? 0 : (i ? 1 : -1) * w * 0.25;
      s += ell(cx, 2, Math.min(26, w / 2 - 6), Math.min(18, d / 2 - 6), 'd', fill('#f6f6f3')) + ell(cx, -d / 2 + 6, 2, 2);
    }
    return s;
  },
  washer({ w, d, color }) {
    return rect(-w / 2, -d / 2, w, d, 2, 'body', fill(color)) + ell(0, 0, Math.min(w, d) / 2 - 12, Math.min(w, d) / 2 - 12);
  },
  coatrack({ w, d, color }) {
    let s = rect(-w / 2, -d / 2, w, d, 1, 'body overhead', fill('none'));
    const n = Math.max(3, Math.round(w / 14));
    for (let i = 0; i < n; i++) { const x = -w / 2 + ((i + 0.5) * w) / n; s += line(x - 3, d / 2 - 3, x + 3, -d / 2 + 6); }
    return s + line(-w / 2 + 3, 0, w / 2 - 3, 0);
  },
  box({ w, d, color }) {
    return rect(-w / 2, -d / 2, w, d, 1, 'body', fill(color));
  },

  module(it) {
    const { w, d, color } = it, k = def(it).kind, b = Math.min(22, d * 0.3), a = 20;
    const s = rect(-w / 2, -d / 2, w, d, 5, 'body', fill(color));
    if (k === 'arm') return s;
    if (k === 'ottoman') return s + rect(-w / 2 + 4, -d / 2 + 4, w - 8, d - 8, 4);
    const x0 = -w / 2 + (k === 'armL' ? a : 2), x1 = w / 2 - (k === 'armR' ? a : k === 'corner' ? b : 2);
    return s + rect(x0, -d / 2 + b, x1 - x0, d - b - 3, 4);
  },

  curve(it) {
    const g = curveGeom(it), P = (pts) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${f(x)} ${f(y)}`).join('') + 'Z';
    const b = 22, seat0 = g.out ? g.ri + b : g.ri + 3, seat1 = g.out ? g.ro - 3 : g.ro - b, e = Math.min(0.06, g.th * 0.08);
    return `<path class="body"${fill(it.color)} d="${P(curveBand(g, g.ri, g.ro))}"/><path class="d" fill="none" d="${P(curveBand(g, seat0, seat1, e, g.th - e))}"/>`;
  },

  // ---- fler symboler ----
  round({ w, d, color }) {
    return ell(0, 0, w / 2, d / 2, 'body', fill(color)) + (Math.min(w, d) > 22 ? ell(0, 0, w / 2 - Math.min(6, w * 0.16), d / 2 - Math.min(6, d * 0.16)) : '');
  },
  cushion({ w, d, color }) {
    const r = Math.min(w, d) * 0.22;
    return rect(-w / 2, -d / 2, w, d, r, 'body', fill(color)) + (Math.min(w, d) > 26 ? rect(-w / 2 + 4, -d / 2 + 4, w - 8, d - 8, r * 0.7) : '');
  },
  chaise({ w, d, color }) {
    return rect(-w / 2, -d / 2, w, d, 9, 'body', fill(color)) + rect(-w / 2 + 3, -d / 2 + 22, w - 6, d - 25, 5) + line(-w / 2 + 3, -d / 2 + 22, w / 2 - 3, -d / 2 + 22);
  },
  daybed({ w, d, color }) {
    return rect(-w / 2, -d / 2, w, d, 3, 'body', fill(color)) + rect(-w / 2 + 5, -d / 2 + 6, w - 10, d - 9, 4, 'd soft') + line(-w / 2 + 5, -d / 2 + 22, w / 2 - 5, -d / 2 + 22);
  },
  bench({ w, d, color }) {
    const long = w >= d;
    return rect(-w / 2, -d / 2, w, d, 3, 'body', fill(color)) + (long ? line(-w / 2 + 3, 0, w / 2 - 3, 0) : line(0, -d / 2 + 3, 0, d / 2 - 3));
  },
  nest({ w, d, color }) {
    const r1 = Math.min(d / 2, w * 0.36), r2 = r1 * 0.68;
    return ell(-w / 2 + r1, 0, r1, r1, 'body', fill(color)) + ell(w / 2 - r2, d / 2 - r2, r2, r2, 'body', fill(color));
  },
  crib({ w, d, color }) {
    let s = rect(-w / 2, -d / 2, w, d, 2, 'body', fill(color)) + rect(-w / 2 + 5, -d / 2 + 5, w - 10, d - 10, 3, 'd soft');
    const n = Math.round(d / 14);
    for (let i = 1; i < n; i++) { const y = -d / 2 + (i * d) / n; s += line(-w / 2, y, -w / 2 + 5, y) + line(w / 2 - 5, y, w / 2, y); }
    return s;
  },
  drawers(it) { return SHAPES.cabinet(it); },
  doors(it) { return SHAPES.cabinet(it); },
  trunk({ w, d, color }) {
    return rect(-w / 2, -d / 2, w, d, 2, 'body', fill(color)) + (w >= d ? line(0, -d / 2, 0, d / 2) : line(-w / 2, 0, w / 2, 0));
  },
  rail({ w, d, color }) {
    let s = rect(-w / 2, -d / 2, w, d, 1, 'body', fill('#f1f0ea')) + line(-w / 2 + 3, 0, w / 2 - 3, 0);
    const n = Math.max(3, Math.round(w / 14));
    for (let i = 0; i < n; i++) { const x = -w / 2 + ((i + 0.5) * w) / n; s += `<line class="d" x1="${f(x - 2)}" y1="${f(d / 2 - 4)}" x2="${f(x + 2)}" y2="${f(-d / 2 + 4)}" stroke="${color}"/>`; }
    return s;
  },
  star({ w, d, color }) {
    let s = ell(0, 0, w / 2, d / 2, 'body', fill('#f1f0ea'));
    for (let i = 0; i < 6; i++) { const a = (i * Math.PI) / 3; s += line(0, 0, (Math.cos(a) * w) / 2.2, (Math.sin(a) * d) / 2.2); }
    return s + ell(0, 0, 4, 4, 'd', fill(color));
  },
  arclamp({ w, d, color }) {
    return line(0, 0, 0, 143) + ell(0, 143, 20, 20, 'd', fill('#f3e7c4')) + rect(-w / 2, -d / 2, w, d, 3, 'body', fill(color));
  },
  ceil({ w, d, color }) {
    const round = Math.abs(w - d) < 4;
    return (round ? ell(0, 0, w / 2, d / 2, 'body overhead', fill('none')) : rect(-w / 2, -d / 2, w, d, 3, 'body overhead', fill('none'))) + line(-7, 0, 7, 0) + line(0, -7, 0, 7) + ell(0, 0, 4.5, 4.5, 'body', fill(color));
  },
  overhead({ w, d }) {
    return rect(-w / 2, -d / 2, w, d, 1, 'body overhead', fill('none')) + line(-w / 2, d / 2 - 3, w / 2, d / 2 - 3);
  },
  tree({ w, d, color }) {
    const n = 9, r = Math.min(w, d) / 2;
    let p = '';
    for (let i = 0; i <= n; i++) {
      const a0 = ((i - 0.5) * Math.PI * 2) / n, a1 = (i * Math.PI * 2) / n;
      p += i ? `Q${f(Math.cos(a0) * r * 1.12)} ${f(Math.sin(a0) * r * 1.12)} ${f(Math.cos(a1) * r * 0.86)} ${f(Math.sin(a1) * r * 0.86)}` : `M${f(r * 0.86)} 0`;
    }
    return `<path class="body"${fill(color)} d="${p}Z"/>` + ell(0, 0, r * 0.3, r * 0.3, 'd', fill('#c4b59f'));
  },
  fronds({ w, d, color }) {
    const n = 8, r = Math.min(w, d) / 2;
    let s = '';
    for (let i = 0; i < n; i++) s += `<ellipse class="body" cx="${f(r * 0.5)}" cy="0" rx="${f(r * 0.5)}" ry="${f(Math.max(2, r * 0.16))}"${fill(color)} transform="rotate(${(i * 360) / n + 12})"/>`;
    return s + ell(0, 0, Math.max(2.5, r * 0.2), Math.max(2.5, r * 0.2), 'd', fill('#c4b59f'));
  },
  wallthin({ w, d, color }) {
    return rect(-w / 2, -d / 2, w, Math.max(d, 3), 1, 'body', fill(color));
  },
  hearth({ w, d, color }) {
    return rect(-w / 2, -d / 2, w, d, 2, 'body', fill(color)) + rect(-w * 0.26, d / 2 - Math.min(d * 0.55, 30), w * 0.52, Math.min(d * 0.55, 30), 1, 'd', fill('#3a3d40'));
  },
  tank({ w, d, color }) {
    return rect(-w / 2, -d / 2, w, d, 1, 'body', fill(color)) + rect(-w / 2 + 3, -d / 2 + 3, w - 6, d - 6, 1, 'd', fill('#a9d3e0'));
  },
  zigzag({ w, d, color }) {
    const n = 3;
    let p = '';
    for (let i = 0; i <= n; i++) p += `${i ? 'L' : 'M'}${f(-w / 2 + (i * w) / n)} ${f((i % 2 ? 1 : -1) * d * 0.4)}`;
    return `<path class="body" fill="none" stroke-linejoin="round" style="stroke-width:3px" d="${p}"/><path d="${p}" fill="none" stroke="${color}" stroke-width="1.5"/>`;
  },
  radiator({ w, d, color }) {
    let s = rect(-w / 2, -d / 2, w, Math.max(d, 4), 1, 'body', fill(color));
    const n = Math.max(3, Math.round(w / 8));
    for (let i = 1; i < n; i++) s += line(-w / 2 + (i * w) / n, -d / 2, -w / 2 + (i * w) / n, -d / 2 + Math.max(d, 4));
    return s;
  },
  curtain({ w, d, color }) {
    const n = Math.max(4, Math.round(w / 14));
    let p = `M${f(-w / 2)} 0`;
    for (let i = 0; i < n; i++) p += `q${f(w / n / 2)} ${f((i % 2 ? -1 : 1) * d)} ${f(w / n)} 0`;
    return `<rect x="${f(-w / 2)}" y="${f(-d / 2)}" width="${f(w)}" height="${f(d)}" fill="${color}" fill-opacity="0.35"/><path class="body" fill="none" d="${p}"/>`;
  },
  speaker({ w, d, color }) {
    return rect(-w / 2, -d / 2, w, d, 2, 'body', fill(color)) + ell(0, 0, Math.min(w, d) * 0.3, Math.min(w, d) * 0.3, 'd lite');
  },
  piano({ w, d, color }) {
    return rect(-w / 2, -d / 2, w, d, 2, 'body', fill(color)) + rect(-w / 2 + 6, d / 2 - Math.min(16, d * 0.35), w - 12, Math.min(13, d * 0.3), 0, 'd', fill('#f6f4ee'));
  },
  grandpiano({ w, d, color }) {
    const kb = 26, fz = d / 2 - kb, b = -d / 2;
    const p = `M${f(-w / 2)} ${f(fz)}V${f(b + 35)}Q${f(-w / 2)} ${f(b)} ${f(-w / 2 + 36)} ${f(b)}C${f(-w / 2 + 80)} ${f(b)} ${f(-w * 0.05)} ${f(-d * 0.12)} ${f(w * 0.18)} ${f(-d * 0.02)}Q${f(w / 2)} ${f(d * 0.08)} ${f(w / 2)} ${f(fz - 15)}V${f(d / 2)}H${f(-w / 2)}Z`;
    return `<path class="body"${fill(color)} d="${p}"/>` + rect(-w / 2 + 6, d / 2 - 20, w - 12, 15, 0, 'd', fill('#f6f4ee'));
  },
  tubfree({ w, d, color }) {
    return ell(0, 0, w / 2, d / 2, 'body', fill(color)) + ell(0, 0, w / 2 - 7, d / 2 - 9) + ell(0, -d / 2 + 24, 2.5, 2.5);
  },
  shower({ w, d, color }) {
    return rect(-w / 2, -d / 2, w, d, 2, 'body', fill(color)) + line(-w / 2, -d / 2, w / 2, d / 2) + line(w / 2, -d / 2, -w / 2, d / 2) + ell(0, 0, 4, 4, 'd', fill('#c9ced1')) + line(w / 2 - 2, -d / 2, w / 2 - 2, d / 2, 'd');
  },
  basin({ w, d, color }) {
    return ell(0, 0, w / 2, d / 2, 'body', fill(color)) + ell(0, 2, w / 2 - 7, d / 2 - 8) + ell(0, -d / 2 + 6, 2, 2);
  },
  rack({ w, d, color }) {
    let s = rect(-w / 2, -d / 2, w, d, 1, 'body', fill('#f1f0ea'));
    const long = w >= d, n = Math.max(3, Math.round((long ? d : w) / 9));
    for (let i = 1; i < n; i++) s += long ? line(-w / 2, -d / 2 + (i * d) / n, w / 2, -d / 2 + (i * d) / n) : line(-w / 2 + (i * w) / n, -d / 2, -w / 2 + (i * w) / n, d / 2);
    return s + `<rect x="${f(-w / 2)}" y="${f(-d / 2)}" width="${f(w)}" height="${f(d)}" fill="none" stroke="${color}" stroke-width="1.5"/>`;
  },
  teepee({ w, d, color }) {
    return rect(-w / 2, -d / 2, w, d, 2, 'body', fill(color)) + line(-w / 2, -d / 2, w / 2, d / 2) + line(w / 2, -d / 2, -w / 2, d / 2);
  },
  treadmill({ w, d, color }) {
    return rect(-w / 2, -d / 2, w, d, 4, 'body', fill(color)) + rect(-w * 0.31, -d * 0.3, w * 0.62, d * 0.74, 2, 'd', fill('#26282b')) + line(-w / 2 + 3, -d / 2 + d * 0.1, w / 2 - 3, -d / 2 + d * 0.1, 'd lite');
  },
  bike({ w, d, color }) {
    return rect(-w / 2, -d / 2, w, d, 3, 'body', fill('none')) + `<line x1="0" y1="${f(-d / 2 + 4)}" x2="0" y2="${f(d / 2 - 4)}" stroke="${color}" stroke-width="5" stroke-linecap="round"/>` + line(-w / 2 + 3, -d * 0.3, w / 2 - 3, -d * 0.3);
  },
  pooltable({ w, d, color }) {
    let s = rect(-w / 2, -d / 2, w, d, 4, 'body', fill(color)) + rect(-w / 2 + 10, -d / 2 + 10, w - 20, d - 20, 2, 'd', fill('#2f7d4f'));
    for (const x of [-1, 1]) for (const y of [-1, 0, 1]) s += ell(x * (w / 2 - 10), y * (d / 2 - 10), 4.5, 4.5, 'd', fill('#141516'));
    return s;
  },
  fur({ w, d, color }) {
    return ell(0, 0, w / 2, d / 2, 'body rugbody', fill(color));
  },
};

export function draw2d(it) {
  const d = def(it);
  return (SHAPES[d.sym] || SHAPES[d.shape] || SHAPES.box)(it);
}

/** Liten katalogikon: samma symbol, inpassad i en kvadrat. */
export function iconSvg(type) {
  const d = CATALOG[type];
  const m = Math.max(d.w, d.d) / 2 + 6;
  return `<svg viewBox="${-m} ${-m} ${2 * m} ${2 * m}" class="item" aria-hidden="true">${draw2d({ type, w: d.w, d: d.d, color: d.color })}</svg>`;
}
