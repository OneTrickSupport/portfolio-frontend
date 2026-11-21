// Lägenheten, avritad från mäklarens planritning (768×1088 px).
// Alla koordinater nedan är bildpixlar; S räknar om dem till centimeter.
// S är valt så att ytan innanför ytterväggarna blir annonsens 94 m².

import { CATALOG, newItem, tvSize } from './catalog.js';

export const S = 1.688; // cm per bildpixel
const OX = 80, OY = 70; // bildpunkten som blir origo
const r1 = (n) => Math.round(n * 10) / 10;

export function buildDefaultPlan() {
  let n = 1;
  const id = () => n++;
  const X = (px) => r1((px - OX) * S), Y = (py) => r1((py - OY) * S), L = (px) => r1(px * S);
  const walls = [], openings = [], items = [], rooms = [];

  const wall = (ax, ay, bx, by, t, kind = 'inner') => {
    const w = { id: id(), ax: X(ax), ay: Y(ay), bx: X(bx), by: Y(by), t: L(t), kind, _px: [ax, ay, bx, by] };
    walls.push(w);
    return w;
  };
  // from/to anges längs väggens huvudriktning (x för liggande väggar, y för stående)
  const open = (w, type, from, to, extra = {}) => {
    const [ax, ay, bx, by] = w._px;
    const horiz = Math.abs(bx - ax) > Math.abs(by - ay);
    const a = horiz ? ax : ay, b = horiz ? bx : by;
    const len = Math.hypot(bx - ax, by - ay);
    const pos = (((from + to) / 2 - a) / (b - a)) * len;
    const width = (Math.abs(to - from) / Math.abs(b - a)) * len;
    const base = type === 'window' ? { sill: 85, top: 235 } : { sill: 0, top: 210 };
    openings.push({ id: id(), wall: w.id, type, pos: L(pos), w: L(width), ...base, ...extra });
  };
  const item = (type, cx, cy, rot, o = {}) => {
    const it = { ...newItem(type, id(), X(cx), Y(cy)), rot, ...o };
    items.push(it);
    return it;
  };
  const fixture = (type, cx, cy, rot, w, d, o = {}) => item(type, cx, cy, rot, { w: Math.round(w), d: Math.round(d), locked: true, ...o });

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
  open(B1, 'window', 240, 317);
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
  open(MB, 'opening', 382, 438);
  wall(355, 361, 355, 465, 22); // hall | sällskapsrum
  wall(250, 465, 359, 465, 20.5); // hall | kök, höger del
  wall(359, 465, 410.5, 529.4, 23.5); // sneda väggen
  const V = wall(410.5, 513.5, 410.5, 768.5, 25); // kök | sovrum
  open(V, 'opening', 599, 645);
  const HW = wall(410.5, 513.5, 682.5, 513.5, 19); // sällskapsrum | sovrum
  open(HW, 'opening', 511, 569);

  // ---- Rumsavdelare (osynliga väggar där det är öppet mellan rummen) ----
  wall(355, 283, 355, 361, 0, 'virtual');
  wall(197, 465, 250, 465, 0, 'virtual');

  // ---- Rum ----
  const room = (name, x, y, floor) => rooms.push({ id: id(), name, x: X(x), y: Y(y), floor });
  room('Master bedroom', 510, 160, 'fiskben');
  room('Badrum', 250, 240, 'klinker');
  room('Hall', 240, 370, 'fiskben');
  room('Sällskapsrum', 520, 390, 'fiskben');
  room('Kök', 270, 620, 'ek');
  room('Sovrum/Vardagsrum', 540, 640, 'fiskben');

  // ---- Fast inredning (låst, går att låsa upp) ----
  const KD = 82; // köksbänkens djup som det är ritat
  fixture('bathtub', 140 + 35 / S, 171 + 78.5 / S, 0, 70, 157);
  fixture('washtower', 204.6, 171 + 33.5 / S, 0, 60, 65);
  fixture('vanity', 284.4, 180.5 + 30 / S, 0, 204, 60, { name: 'Kommod med två handfat' });
  fixture('toilet', 344.25 - 35 / S, 247, 90, 38, 70);
  fixture('coatrack', 167.5, 277 + 15 / S, 0, 100, 30);
  fixture('wardrobe', 116 + 28.5 / S, 403.1, 270, 171, 57, { name: 'Förvaring' });
  const run = [['counter', 477, 519.5], ['sink', 519.5, 574.5], ['dishwasher', 574.5, 613.75], ['stove', 613.75, 657], ['counter', 657, 701.25], ['counter', 701.25, 750.5]];
  for (const [type, y0, y1] of run) fixture(type, 129.5 + KD / S / 2, (y0 + y1) / 2, 270, (y1 - y0) * S, KD);
  fixture('fridge', 270.9, 495.25, 0, 67, 62);
  fixture('tallcab', 310.4, 495.25, 0, 66, 62);
  fixture('counter', 342.5, 495.25, 0, 42, 62);
  fixture('counter', 366, 517.25, 51.3, 101, 57, { name: 'Bänkskåp (snett)' });
  fixture('counter', 381.1, 567.25, 90, 85, 57);
  fixture('wardrobe', 536.75, 249.5, 180, 300, 67, { name: 'Garderob (G)' });
  fixture('bookshelf', 650.9, 182.1, 90, 294, 41, { name: 'Platsbyggd bokhylla', h: 90 });

  // ---- Förslag på möblering (flytta, byt eller ta bort) ----
  const tv = tvSize(77);
  item('rug', 535, 402, 90);
  item('sofa3', 663 - 47.5 / S - 1, 402.5, 90);
  item('coffee', 565, 402.5, 90);
  item('tvbench', 366 + 20 / S + 0.5, 406, 270, { w: 160 });
  item('tv', 366 + 3 / S + 0.3, 406, 270, { name: 'TV 77″', inch: 77, w: tv.w, h: tv.h });
  item('plant', 640, 300, 0);
  item('floorlamp', 645, 487, 0);
  item('bed160', 367 + 100 / S + 1, 97 + 80 / S, 270);
  item('nightstand', 367 + 20 / S + 1, 97 + 160 / S + 22.5 / S + 1, 270);
  // hörnrummet: bara ett gammalt runt bord i mörkt trä med fyra stolar
  const DARK = '#4a2e1c', tx = 538, ty = 632, cr = 78 / S;
  item('diningRound', tx, ty, 0, { name: 'Gammalt runt bord', w: 120, d: 120, color: DARK, corner: true });
  [[0, -1, 0], [1, 0, 90], [0, 1, 180], [-1, 0, 270]].forEach(([dx, dy, rot]) =>
    item('chair', tx + dx * cr, ty + dy * cr, rot, { name: 'Trästol', color: '#6b452b', corner: true }));
  // köksö med tre barstolar på sidan mot rummet (sitsen skjuts in under bänkskivan)
  item('island', 285, 690, 0);
  for (const dx of [-55, 0, 55]) item('barstool', 285 + dx / S, 690 - 58 / S, 0);

  for (const w of walls) delete w._px;
  return {
    v: 1,
    boa: 94,
    wallHeight: 320,
    wallColor: '#f4f2ec',
    walls, openings, items, rooms,
    image: { x: X(0), y: Y(0), w: L(768), h: L(1088) },
    nextId: n,
    islandKitchen: true,
    cornerRoom: true,
    ceil320: true,
  };
}

export { CATALOG };
