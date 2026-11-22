// Lägenheten, avritad från mäklarens planritning (768×1088 px) och rättad efter mått tagna på plats.
// Koordinaterna nedan är bildpixlar. Ritningen är inte skalenlig, så AX och AY räknar om pixlar till
// centimeter styckvis: varje uppmätt sträcka får sitt verkliga mått, och väggar som ligger i linje på
// ritningen gör det fortfarande. Där inget är uppmätt gäller ritningens proportioner.

import { CATALOG, newItem, tvSize } from './catalog.js';

// ---- Uppmätt på plats (cm, mellan väggytor) ----
const KITCHEN_WALL = [165, 157, 103]; // kökets fönstervägg: vägg, fönster, vägg (hela bredden 425)
const KITCHEN_LOW_UNITS = 167; // de två bänkskåpen närmast fönsterväggen
const KITCHEN_STUB = 168; // väggen mot hörnrummet, från öppningen ner till fönsterväggen
const LIVING_TOP = 380; // sällskapsrummet: väggen mot master bedroom, från dörren till ytterväggen
const LIVING_DEPTH = 355; // från väggen mot master bedroom till väggen mot hörnrummet
const LIVING_STUB = 165; // väggstumpen mot hallen
const LIVING_DIAG = 95; // sneda väggen
const LIVING_LOW = [137, 193]; // väggen mot hörnrummet, till vänster och höger om dörren

// ---- Inte uppmätt: antaganden som bör kontrolleras på plats ----
const LIVING_DOOR = 90; // dörröppningen mellan sällskapsrummet och hörnrummet
const DIAG_RUN = LIVING_DIAG / Math.SQRT2; // sneda väggen antas stå i 45°
const FREE = 1.573; // cm per bildpixel i höjdled där inget är uppmätt: medel av de uppmätta sträckorna

const r1 = (n) => Math.round(n * 10) / 10;

/** En axel: rader [från bildpixel, cm per pixel därifrån]. Ger cm räknat från bildpixeln `origin`. */
function axis(origin, parts) {
  const raw = (px) => {
    let cm = (Math.min(px, parts[0][0]) - parts[0][0]) * parts[0][1];
    for (let i = 0; i < parts.length; i++) {
      const [p0, k] = parts[i], p1 = i + 1 < parts.length ? parts[i + 1][0] : Infinity;
      if (px > p0) cm += (Math.min(px, p1) - p0) * k;
    }
    return cm;
  };
  const zero = raw(origin);
  const to = (px) => raw(px) - zero;
  const k = (px) => { let s = parts[0][1]; for (const [p0, kk] of parts) if (px >= p0) s = kk; return s; };
  /** Bildpixeln som ligger `cm` från origo (omvändningen av to). */
  const from = (cm) => {
    let i = 0;
    while (i + 1 < parts.length && cm > to(parts[i + 1][0])) i++;
    return parts[i][0] + (cm - to(parts[i][0])) / parts[i][1];
  };
  return { to, from, k };
}

// Bildpixlar som måtten ovan hänger på: väggytor på ritningen.
const KX0 = 128, KX1 = 398; // kökets vänstra och högra vägg
const LX0 = 366, LX1 = 663; // sällskapsrummets vänstra vägg (stumpen) och ytterväggen
const LY0 = 276.5, LYD = 454.75, LY1 = 504; // väggen mot master bedroom, där sneda väggen börjar, väggen mot hörnrummet
const KY0 = 645, KY1 = 751; // öppningens nederkant i köket och fönsterväggen

const kxKitchen = (KITCHEN_WALL[0] + KITCHEN_WALL[1] + KITCHEN_WALL[2]) / (KX1 - KX0);
const livingWidth = DIAG_RUN + LIVING_LOW[0] + LIVING_DOOR + LIVING_LOW[1];
const AX = axis(80, [[0, kxKitchen], [KX1, (livingWidth - (KX1 - LX0) * kxKitchen) / (LX1 - KX1)]]);
const AY = axis(70, [[0, FREE], [LY0, (LIVING_DEPTH - DIAG_RUN) / (LYD - LY0)], [LYD, DIAG_RUN / (LY1 - LYD)], [LY1, FREE], [KY0, KITCHEN_STUB / (KY1 - KY0)]]);

/** Bildpixel → cm i planen. */
export const at = (px, py) => [AX.to(px), AY.to(py)];

// Den gamla geometrin: hela ritningen i en enda skala, vald så att ytan blev annonsens 94 m².
// Sparade planer i den geometrin känns igen på bildrutan och flyttas över i migrate.js.
const OLD_S = 1.688;
export const OLD_IMAGE = { x: -135, y: -118.2, w: 1296.4, h: 1836.5 };
/** En punkt i den gamla geometrin (cm) → samma ställe på ritningen i den nya. */
export const fromOld = (x, y) => at(x / OLD_S + 80, y / OLD_S + 70);

export function buildDefaultPlan() {
  let n = 1;
  const id = () => n++;
  const x = AX.to, y = AY.to;
  const walls = [], openings = [], items = [], rooms = [];

  const wallCm = (ax, ay, bx, by, t, kind, px) => {
    const w = { id: id(), ax: r1(ax), ay: r1(ay), bx: r1(bx), by: r1(by), t: r1(t), kind, _px: px };
    walls.push(w);
    return w;
  };
  // Tjockleken anges i bildpixlar och räknas om tvärs väggens riktning.
  const wall = (ax, ay, bx, by, t, kind = 'inner') => {
    const mx = (ax + bx) / 2, my = (ay + by) / 2;
    const k = ay === by ? AY.k(my) : ax === bx ? AX.k(mx) : (AX.k(mx) + AY.k(my)) / 2;
    return wallCm(x(ax), y(ay), x(bx), y(by), t * k, kind, [ax, ay, bx, by]);
  };
  // from/to anges i bildpixlar längs väggens huvudriktning (x för liggande väggar, y för stående)
  const open = (w, type, from, to, extra = {}) => {
    const [ax, ay, bx, by] = w._px;
    const horiz = Math.abs(bx - ax) > Math.abs(by - ay);
    const a = horiz ? ax : ay, b = horiz ? bx : by;
    const pt = (v) => { const f = (v - a) / (b - a); return at(ax + (bx - ax) * f, ay + (by - ay) * f); };
    const p = pt(from), q = pt(to), a0 = [w.ax, w.ay];
    const pos = Math.hypot((p[0] + q[0]) / 2 - a0[0], (p[1] + q[1]) / 2 - a0[1]);
    const base = type === 'window' ? { sill: 85, top: 235 } : { sill: 0, top: 210 };
    openings.push({ id: id(), wall: w.id, type, pos: r1(pos), w: r1(Math.hypot(q[0] - p[0], q[1] - p[1])), ...base, ...extra });
  };
  // Möbler och fast inredning placeras i cm.
  const item = (type, cx, cy, rot, o = {}) => {
    const it = { ...newItem(type, id(), r1(cx), r1(cy)), rot, ...o };
    items.push(it);
    return it;
  };
  const fixture = (type, cx, cy, rot, w, d, o = {}) => item(type, cx, cy, rot, { w: r1(w), d: r1(d), locked: true, ...o });

  // Uppmätta lägen, uttryckta i bildpixlar
  const stubTop = AY.from(y(LY0) + LIVING_DEPTH - LIVING_STUB - DIAG_RUN); // stumpens övre ände
  const lowDoor = [AX.from(x(LX1) - LIVING_LOW[1] - LIVING_DOOR), AX.from(x(LX1) - LIVING_LOW[1])];
  const topDoor = [382, AX.from(x(LX1) - LIVING_TOP)];
  const kitchenWindow = [AX.from(x(KX0) + KITCHEN_WALL[0]), AX.from(x(KX0) + KITCHEN_WALL[0] + KITCHEN_WALL[1])];

  // ---- Ytterväggar ----
  const R1 = wall(682.5, 89, 682.5, 656, 39, 'outer');
  open(R1, 'window', 110.5, 164.25);
  open(R1, 'window', 191, 242.25);
  open(R1, 'window', 367, 438);
  open(R1, 'window', 604, 656);
  // rundat hörn: båge med centrum (570,656)
  let prev = [682.5, 656];
  for (let a = 15; a <= 90; a += 15) {
    const t = (a * Math.PI) / 180;
    const p = a === 90 ? [570, 768.5] : [570 + 112.5 * Math.cos(t), 656 + 112.5 * Math.sin(t)];
    wall(prev[0], prev[1], p[0], p[1], 37, 'outer');
    prev = p;
  }
  const B1 = wall(570, 768.5, 117, 768.5, 35, 'outer');
  open(B1, 'window', 507, 570);
  open(B1, 'window', kitchenWindow[0], kitchenWindow[1]);
  wall(117, 465, 117, 768.5, 22, 'outer'); // kök, vänster
  wall(104.5, 385, 104.5, 465, 23, 'outer'); // hall, vänster
  const L2 = wall(128, 272.5, 104.5, 385, 22, 'outer'); // entréväggen (sned)
  open(L2, 'door', 282, 340, { top: 210, hinge: 0, side: -1 });
  wall(128, 162.5, 128, 272.5, 24, 'outer'); // badrum, vänster
  wall(103.5, 162.5, 103.5, 205, 25, 'outer'); // murklack mot trapphuset
  wall(103.5, 162.5, 235, 162.5, 15, 'outer'); // badrum, övre vänster
  wall(235, 162.5, 235, 173, 23, 'outer');
  wall(235, 173, 355, 173, 14, 'outer'); // badrum, övre höger
  wall(355, 89, 682.5, 89, 12, 'outer'); // master bedroom, övre

  // ---- Innerväggar ----
  wall(355, 89, 355, 283, 22.5); // badrum | master bedroom
  wall(104.5, 465, 197, 465, 22); // hall | kök, vänster del
  const BB = wall(128, 272.5, 355, 272.5, 8); // badrum | hall
  open(BB, 'opening', 200.5, 258);
  const MB = wall(355, 272.5, 682.5, 272.5, 8); // master bedroom | sällskapsrum
  open(MB, 'opening', topDoor[0], topDoor[1]);
  wall(355, stubTop, 355, 465, 22); // hall | sällskapsrum (väggstumpen)
  wall(250, 465, 359, 465, 20.5); // hall | kök, höger del
  // Sneda väggen: 45°, med ytan mot sällskapsrummet från stumpens hörn (LX0, LYD) och LIVING_DIAG cm snett nedåt.
  // Den slutar i mittlinjen på väggen mot hörnrummet, som börjar där, så att rummens mått räknas från rätt hörn.
  const dg = { ax: x(359), ay: y(465), run: y(513.5) - y(465), h: (y(465) - y(LYD) + x(LX0) - x(359)) / Math.SQRT2 };
  wallCm(dg.ax, dg.ay, dg.ax + dg.run, dg.ay + dg.run, 2 * dg.h, 'inner');
  const V = wall(410.5, 513.5, 410.5, 768.5, 25); // kök | sovrum
  open(V, 'opening', 599, KY0);
  const HW = wallCm(dg.ax + dg.run, y(513.5), x(682.5), y(513.5), 19 * AY.k(513.5), 'inner', [410.5, 513.5, 682.5, 513.5]); // sällskapsrum | sovrum
  open(HW, 'opening', lowDoor[0], lowDoor[1]);

  // ---- Rumsavdelare (osynliga väggar där det är öppet mellan rummen) ----
  wall(355, 283, 355, stubTop, 0, 'virtual');
  wall(197, 465, 250, 465, 0, 'virtual');

  // ---- Rum ----
  const room = (name, px, py, floor) => rooms.push({ id: id(), name, x: r1(x(px)), y: r1(y(py)), floor });
  room('Master bedroom', 510, 160, 'fiskben');
  room('Badrum', 250, 240, 'klinker');
  room('Hall', 240, 370, 'fiskben');
  room('Sällskapsrum', 520, 390, 'fiskben');
  room('Kök', 270, 620, 'ek');
  room('Sovrum/Vardagsrum', 540, 640, 'fiskben');

  // ---- Fast inredning (låst, går att låsa upp) ----
  // Storlekarna är ritningens, avrundade till vanliga mått. Bara KITCHEN_LOW_UNITS är uppmätt.
  fixture('bathtub', x(140) + 35, y(171) + 75, 0, 70, 150);
  fixture('washtower', x(204.6), y(171) + 32.5, 0, 60, 65);
  fixture('vanity', x(344.25) - 0.5 - 94.5, y(180.5) + 30, 0, 189, 60, { name: 'Kommod med två handfat' });
  fixture('toilet', x(344.25) - 35, y(247), 90, 38, 70);
  fixture('coatrack', x(138.5) + 47.5, y(277) + 15, 0, 95, 30);
  fixture('wardrobe', x(116) + 28.5, y(LYD) - 1.5 - 81, 270, 162, 57, { name: 'Förvaring' });
  // köksbänken längs vänstra väggen, uppifrån och ner; de två nedersta skåpen är tillsammans KITCHEN_LOW_UNITS
  const KD = 76; // bänkens djup som det är ritat
  const run = [['counter', 60], ['sink', 80], ['dishwasher', 60], ['stove', 60], ['counter', KITCHEN_LOW_UNITS / 2], ['counter', KITCHEN_LOW_UNITS / 2]];
  let ry = y(KY1) - run.reduce((a, u) => a + u[1], 0);
  for (const [type, len] of run) { fixture(type, x(KX0) + 1 + KD / 2, ry + len / 2, 270, len, KD); ry += len; }
  // högskåpen mot hallväggen
  const fy = y(475.25) + 1 + 30;
  fixture('fridge', x(251) + 31.5, fy, 0, 63, 60);
  fixture('tallcab', x(251) + 63 + 31, fy, 0, 62, 60);
  fixture('counter', (x(251) + 125 + x(355)) / 2, fy, 0, x(355) - x(251) - 125, 60);
  // bänken längs sneda väggen: från hallväggens undersida till väggen mot hörnrummet
  const CD = 52, fx = dg.ax - dg.h / Math.SQRT2, fyk = dg.ay + dg.h / Math.SQRT2; // en punkt på sneda väggens köksyta
  const sA = y(475.25) - fyk, sB = x(KX1) - fx, sM = (sA + sB) / 2, off = (CD / 2 + 0.5) / Math.SQRT2;
  fixture('counter', fx + sM - off, fyk + sM + off, 45, (sB - sA) * Math.SQRT2, CD, { name: 'Bänkskåp (snett)' });
  fixture('counter', x(KX1) - 0.5 - CD / 2, (y(542) + y(592.4)) / 2, 90, y(592.4) - y(542), CD);
  fixture('wardrobe', x(536.75), y(268.5) - 0.5 - 30, 180, 293, 60, { name: 'Garderob (G)' });
  fixture('bookshelf', x(LX1) - 0.5 - 20.5, (y(95) + y(268.5)) / 2, 90, y(268.5) - y(95) - 1, 41, { name: 'Platsbyggd bokhylla', h: 90 });

  // ---- Förslag på möblering (flytta, byt eller ta bort) ----
  const tv = tvSize(77);
  const stubMid = y(stubTop) + LIVING_STUB / 2; // tv:n mitt på väggstumpen, soffan mitt emot
  const sofaX = x(LX1) - 47.5 - 1.5;
  item('rug', sofaX - 167, stubMid, 90);
  item('sofa3', sofaX, stubMid, 90);
  item('coffee', sofaX - 116, stubMid, 90);
  item('tvbench', x(LX0) + 20 + 1, stubMid, 270, { w: 160 });
  item('tv', x(LX0) + 3 + 0.5, stubMid, 270, { name: 'TV 77″', inch: 77, w: tv.w, h: tv.h });
  item('plant', x(LX1) - 39, y(LY0) + 40, 0);
  item('floorlamp', x(LX1) - 30, y(LY1) - 29, 0);
  item('bed160', x(367) + 100 + 1.5, y(97) + 80, 270);
  item('nightstand', x(367) + 20 + 1.5, y(97) + 160 + 22.5 + 1.5, 270);
  // hörnrummet: bara ett gammalt runt bord i mörkt trä med fyra stolar
  const DARK = '#4a2e1c', tx = x(538), ty = y(632), cr = 78;
  item('diningRound', tx, ty, 0, { name: 'Gammalt runt bord', w: 120, d: 120, color: DARK, corner: true });
  [[0, -1, 0], [1, 0, 90], [0, 1, 180], [-1, 0, 270]].forEach(([dx, dy, rot]) =>
    item('chair', tx + dx * cr, ty + dy * cr, rot, { name: 'Trästol', color: '#6b452b', corner: true }));
  // köksö med tre barstolar på sidan mot rummet (sitsen skjuts in under bänkskivan)
  item('island', x(285), y(690), 0);
  for (const dx of [-55, 0, 55]) item('barstool', x(285) + dx, y(690) - 58, 0);

  for (const w of walls) delete w._px;
  return {
    v: 1,
    boa: 94,
    wallHeight: 320,
    wallColor: '#f4f2ec',
    walls, openings, items, rooms,
    image: { x: r1(x(0)), y: r1(y(0)), w: r1(x(768) - x(0)), h: r1(y(1088) - y(0)) },
    nextId: n,
    islandKitchen: true,
    cornerRoom: true,
    ceil320: true,
  };
}

export { CATALOG };

/**
 * Lägenheten som den ser ut på planritningen: väggar, dörrar, fönster och fast inredning
 * (kök, badrum, garderober), men inga lösa möbler. Här börjar ett nytt förslag.
 */
export function buildEmptyPlan() {
  const plan = buildDefaultPlan();
  plan.items = plan.items.filter((it) => it.locked);
  return plan;
}
