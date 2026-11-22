// Appens tillstånd: planen (sparas), markering, verktyg och ångra-historik.

import { at, buildDefaultPlan, buildEmptyPlan } from './plan.js';
import { sanitizePlan } from './sanitize.js';
import { migratePlan } from './migrate.js';

/** En plan utifrån (lagring, sparad design, fil): städad och flyttad till den uppmätta geometrin. */
const load = (raw) => migratePlan(sanitizePlan(raw));

const KEY = 'moblera-plan-v1';

// Inbäddad i en annan sida (?embed=1) sparar planeraren inte själv. Sidan runt omkring laddar en design
// med openDesign() och hämtar den med app.state. Osparade ändringar läggs som ett utkast per design i
// webbläsaren, så att de finns kvar om man laddar om eller går iväg för att logga in.
export const EMBED = new URLSearchParams(location.search).has('embed');
let draftKey = null; // nyckel i localStorage för utkastet, t.ex. moblera-draft-new
let baseline = null; // den sparade versionen som JSON; allt annat räknas som osparat

export const app = {
  state: null,
  sel: null, // { kind: 'item' | 'wall' | 'opening' | 'room', id }
  view: '2d', // '2d' | '3d'
  tool: 'select', // 'select' | 'walls' | 'draw' | 'measure'
  ui: { dims: true, overlay: false, wallMode: 'auto', walk: false, focus: null }, // focus = id på rummet som visas ensamt
  measure: [], // punkter för mätverktyget
};

const subs = new Set();
export const on = (fn) => subs.add(fn);
/** kind: 'commit' (sparad ändring), 'live' (under dragning), 'sel', 'tool', 'view' */
export const emit = (kind = 'commit') => subs.forEach((fn) => fn(kind));

let hist = [], hi = -1;
const snap = () => JSON.stringify(app.state);
export const isDirty = () => EMBED && baseline !== null && snap() !== baseline;
function tellHost(type, extra = {}) {
  if (EMBED && window.parent !== window) window.parent.postMessage({ type, ...extra }, location.origin);
}
function save(s) {
  try {
    if (!EMBED) localStorage.setItem(KEY, s);
    else if (draftKey) { if (s === baseline) localStorage.removeItem(draftKey); else localStorage.setItem(draftKey, s); }
  } catch { /* privat läge: inget sparas */ }
  tellHost('moblera-change', { dirty: isDirty() });
}

export function init() {
  let s = null;
  if (!EMBED) {
    try { const raw = localStorage.getItem(KEY); if (raw) s = load(JSON.parse(raw)); } catch { /* börja från originalet */ }
  }
  // inbäddad: börja omöblerad tills sidan runt omkring öppnar en design
  app.state = s || (EMBED ? buildEmptyPlan() : buildDefaultPlan());
  if (!EMBED) {
    if (!app.state.islandKitchen) islandKitchen(app.state);
    if (!app.state.cornerRoom) cornerRoom(app.state);
    if (!app.state.ceil320) { app.state.wallHeight = 320; app.state.ceil320 = true; save(snap()); } // uppmätt takhöjd
  }
  hist = [snap()];
  hi = 0;
}

/**
 * Öppna en design i inbäddat läge. `saved` är den sparade planen (null = originalplanen).
 * Finns ett utkast med osparade ändringar för samma nyckel används det i stället.
 * Ger { dirty } som säger om det som visas skiljer sig från den sparade versionen.
 */
export function openDesign(key, saved) {
  draftKey = `moblera-draft-${String(key).replace(/[^A-Za-z0-9_-]/g, '')}`;
  // ett nytt förslag börjar med bara det som finns på planritningen, utan lösa möbler
  const base = saved ? load(saved) : buildEmptyPlan();
  baseline = JSON.stringify(base);
  let state = base;
  try {
    const raw = localStorage.getItem(draftKey);
    if (raw && raw !== baseline) state = load(JSON.parse(raw));
  } catch { /* trasigt utkast: visa den sparade versionen */ }
  app.state = state;
  app.sel = null;
  app.ui.focus = null;
  hist = [snap()];
  hi = 0;
  emit('commit');
  tellHost('moblera-change', { dirty: isDirty() });
  return { dirty: isDirty() };
}
/** Det som visas är nu sparat (eventuellt under en ny nyckel): utkastet tas bort. */
export function markSaved(key) {
  try { if (draftKey) localStorage.removeItem(draftKey); } catch { /* inget att ta bort */ }
  if (key != null) draftKey = `moblera-draft-${String(key).replace(/[^A-Za-z0-9_-]/g, '')}`;
  baseline = snap();
  tellHost('moblera-change', { dirty: false });
}
/** Kasta osparade ändringar och gå tillbaka till den sparade versionen. */
export function discardDraft() {
  if (baseline === null) return;
  try { if (draftKey) localStorage.removeItem(draftKey); } catch { /* inget att ta bort */ }
  replaceState(JSON.parse(baseline));
}

/** Engångsändring av en sparad plan: hörnrummet töms och får ett runt bord med stolar. */
function cornerRoom(s) {
  const fresh = buildDefaultPlan().items.filter((it) => it.corner);
  const [x0, y0] = at(423, 523), [x1, y1] = at(663, 751);
  s.items = s.items.filter((it) => it.locked || !(it.x > x0 && it.x < x1 && it.y > y0 && it.y < y1));
  for (const it of fresh) s.items.push({ ...it, id: s.nextId++ });
  s.cornerRoom = true;
  save(JSON.stringify(s));
}

/** Engångsändring av en redan sparad plan: matbordet i köket byts mot köksö och barstolar. */
function islandKitchen(s) {
  const fresh = buildDefaultPlan().items.filter((it) => it.type === 'island' || it.type === 'barstool');
  const isl = fresh.find((it) => it.type === 'island');
  s.items = s.items.filter((it) => !(['dining', 'chair'].includes(it.type) && Math.hypot(it.x - isl.x, it.y - isl.y) < 220));
  for (const it of fresh) s.items.push({ ...it, id: s.nextId++ });
  s.islandKitchen = true;
  save(JSON.stringify(s));
}

export function commit() {
  const s = snap();
  if (s !== hist[hi]) {
    hist = hist.slice(0, hi + 1);
    hist.push(s);
    if (hist.length > 150) hist.shift();
    hi = hist.length - 1;
    save(s);
  }
  emit('commit');
}

function restore() {
  app.state = JSON.parse(hist[hi]);
  save(hist[hi]);
  if (app.sel && !find(app.sel)) app.sel = null;
  emit('commit');
}
export function undo() { if (hi > 0) { hi--; restore(); } }
export function redo() { if (hi < hist.length - 1) { hi++; restore(); } }
export const canUndo = () => hi > 0;
export const canRedo = () => hi < hist.length - 1;

export function find(sel) {
  if (!sel) return null;
  const s = app.state;
  const list = sel.kind === 'item' ? s.items : sel.kind === 'wall' ? s.walls : sel.kind === 'opening' ? s.openings : null;
  if (!list) return sel.kind === 'room' ? sel : null;
  return list.find((x) => x.id === sel.id) || null;
}

export function select(sel) {
  const same = (app.sel?.kind === sel?.kind && app.sel?.id === sel?.id);
  app.sel = sel;
  if (!same) emit('sel');
}
export function setTool(t) {
  app.tool = t;
  app.measure = [];
  const ok = t === 'select' ? ['item', 'room'] : t === 'walls' ? ['wall', 'opening'] : [];
  if (app.sel && !ok.includes(app.sel.kind)) app.sel = null;
  emit('tool');
}
export function setView(v) {
  app.view = v;
  if (v === '3d' && app.tool !== 'select') { app.tool = 'select'; app.measure = []; if (app.sel && app.sel.kind !== 'item') app.sel = null; }
  emit('view');
}
/** Visa bara ett rum (id) eller alla rum (null). */
export function setFocus(id) {
  if (app.ui.focus === id) return;
  app.ui.focus = id;
  if (app.sel && !(app.sel.kind === 'room' && app.sel.id === id)) app.sel = null;
  emit('view');
}
export const newId = () => app.state.nextId++;

export function replaceState(s) {
  app.state = load(s);
  app.sel = null;
  commit();
}
export const resetPlan = () => replaceState(EMBED ? buildEmptyPlan() : buildDefaultPlan());

/** Skala om hela planen (väggar, öppningar, möblers lägen) med en faktor. Möblernas egna mått ändras inte. */
export function rescale(f) {
  const s = app.state;
  for (const w of s.walls) { w.ax *= f; w.ay *= f; w.bx *= f; w.by *= f; w.t *= f; }
  for (const o of s.openings) { o.pos *= f; o.w *= f; }
  for (const it of s.items) { it.x *= f; it.y *= f; }
  for (const r of s.rooms) { r.x *= f; r.y *= f; }
  if (s.image) { s.image.x *= f; s.image.y *= f; s.image.w *= f; s.image.h *= f; }
  app.measure = app.measure.map(([x, y]) => [x * f, y * f]);
}
