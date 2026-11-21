// Städar en plan som kommer utifrån (sparad fil, annan användares design, gammal lagring).
// Allt som ritas ut kontrolleras: tal måste vara tal, färger hexfärger och länkar http(s).
// Det gör att en plan aldrig kan smuggla in kod i sidan, hur den än är hopsatt.

const num = (v, def, lo = -1e5, hi = 1e5) => {
  const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN;
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : def;
};
const int = (v, def) => Math.round(num(v, def, 0, 1e9));
const color = (v, def) => (typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v) ? v : def);
const text = (v, max, def = '') => (typeof v === 'string' ? v.slice(0, max) : def);
const oneOf = (v, list, def) => (list.includes(v) ? v : def);
const list = (v, max) => (Array.isArray(v) ? v.slice(0, max).filter((x) => x && typeof x === 'object') : []);

function wall(w) {
  return { id: int(w.id, 0), ax: num(w.ax, 0), ay: num(w.ay, 0), bx: num(w.bx, 0), by: num(w.by, 0), t: num(w.t, 12, 0, 300), kind: oneOf(w.kind, ['outer', 'inner', 'virtual'], 'inner') };
}
function opening(o) {
  const out = { id: int(o.id, 0), wall: int(o.wall, 0), type: oneOf(o.type, ['window', 'door', 'opening'], 'opening'), pos: num(o.pos, 0), w: num(o.w, 90, 1, 3000), sill: num(o.sill, 0, 0, 1000), top: num(o.top, 210, 0, 1000) };
  if (o.hinge != null) out.hinge = o.hinge ? 1 : 0;
  if (o.side != null) out.side = o.side === -1 ? -1 : 1;
  return out;
}
function item(it) {
  const link = text(it.link, 500);
  const out = {
    id: int(it.id, 0),
    type: typeof it.type === 'string' && /^[A-Za-z0-9_]{1,40}$/.test(it.type) ? it.type : 'custom',
    name: text(it.name, 80, 'Möbel'),
    x: num(it.x, 0), y: num(it.y, 0), rot: num(it.rot, 0, -3600, 3600),
    w: num(it.w, 60, 0.1, 3000), d: num(it.d, 60, 0.1, 3000), h: num(it.h, 60, 0.1, 3000),
    color: color(it.color, '#c8ccc6'),
    price: typeof it.price === 'number' ? num(it.price, '', 0, 1e8) : /^[0-9 .,]{0,14}$/.test(text(it.price, 14)) ? text(it.price, 14) : '',
    link: /^https?:\/\/[^\s"'<>]+$/i.test(link) ? link : '',
  };
  if (it.elev != null) out.elev = num(it.elev, 0, 0, 1000);
  if (it.inch != null) out.inch = num(it.inch, 65, 10, 200);
  for (const k of ['mirror', 'locked', 'corner']) if (it[k]) out[k] = true;
  return out;
}
function room(r) {
  return { id: int(r.id, 0), name: text(r.name, 60, 'Rum'), x: num(r.x, 0), y: num(r.y, 0), floor: typeof r.floor === 'string' && /^[a-z]{1,20}$/.test(r.floor) ? r.floor : 'fiskben' };
}

/** Ger en ren kopia av planen. Kastar ett fel om det inte är en plan över huvud taget. */
export function sanitizePlan(raw) {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.walls) || !Array.isArray(raw.items)) throw new Error('inte en plan');
  const s = {
    v: 1,
    boa: num(raw.boa, 0, 0, 1e5),
    wallHeight: num(raw.wallHeight, 320, 150, 600),
    wallColor: color(raw.wallColor, '#f4f2ec'),
    walls: list(raw.walls, 400).map(wall),
    openings: list(raw.openings, 300).map(opening),
    items: list(raw.items, 800).map(item),
    rooms: list(raw.rooms, 80).map(room),
    nextId: 0,
  };
  if (raw.image && typeof raw.image === 'object') s.image = { x: num(raw.image.x, 0), y: num(raw.image.y, 0), w: num(raw.image.w, 0), h: num(raw.image.h, 0) };
  for (const k of ['islandKitchen', 'cornerRoom', 'ceil320']) if (raw[k]) s[k] = true;
  // id:n måste vara unika och nextId större än alla, annars krockar nya möbler med gamla
  const seen = new Set();
  let max = 0;
  for (const arr of [s.walls, s.openings, s.items, s.rooms]) for (const o of arr) max = Math.max(max, o.id);
  for (const arr of [s.walls, s.openings, s.items, s.rooms]) for (const o of arr) { if (seen.has(o.id)) o.id = ++max; seen.add(o.id); }
  s.nextId = Math.max(int(raw.nextId, 0), max + 1);
  return s;
}
