// Gemensamma handlingar som både planvyn, 3D-vyn och panelerna använder.

import { app, commit, emit, find, newId, setTool } from './store.js';
import { CATALOG, def, newItem } from './catalog.js';
import * as D from './derive.js';

export function addItem(type, x, y, chain = false) {
  if (!CATALOG[type]) return;
  const it = newItem(type, newId(), Math.round(x), Math.round(y));
  fitToCeiling(it);
  app.state.items.push(it);
  const d = CATALOG[type];
  // nästa soffmodul sätts mot en ledig ände på den markerade (följer hörn och kurvor), i samma färg
  const prev = chain && d.module && app.sel?.kind === 'item' && find(app.sel);
  if (prev && def(prev).module && D.chainTo(it, prev)) it.color = prev.color;
  if (d.wall) D.wallSnap(it, 120); // väggsaker letar upp närmaste vägg direkt
  if (d.top) it.elev = D.restHeight(it);
  if (app.tool !== 'select') setTool('select');
  app.sel = { kind: 'item', id: it.id };
  commit();
  emit('sel');
}

/** Taklampor hänger från taket och gardiner går från golv till tak, vilken takhöjd rummet än har. */
export function fitToCeiling(it) {
  const d = def(it), H = app.state.wallHeight;
  if (d.full) it.h = Math.max(50, H - (d.shape === 'curtain' ? 6 : 0));
  if (d.ceil) it.elev = Math.max(0, H - it.h);
}

export function removeSel() {
  const s = app.state, sel = app.sel;
  if (!sel) return;
  if (sel.kind === 'item' && find(sel)?.locked) return; // fast inredning måste låsas upp först
  if (sel.kind === 'item') {
    const riding = D.riders(find(sel));
    s.items = s.items.filter((i) => i.id !== sel.id);
    for (const r of riding) r.elev = D.restHeight(r); // det som stod på möbeln hamnar på golvet
  }
  else if (sel.kind === 'opening') s.openings = s.openings.filter((o) => o.id !== sel.id);
  else if (sel.kind === 'wall') {
    s.walls = s.walls.filter((w) => w.id !== sel.id);
    s.openings = s.openings.filter((o) => o.wall !== sel.id);
  } else return;
  app.sel = null;
  commit();
  emit('sel');
}

export function duplicateSel() {
  const it = app.sel?.kind === 'item' && find(app.sel);
  if (!it) return;
  const c = { ...it, id: newId(), x: it.x + 25, y: it.y + 25, locked: false };
  app.state.items.push(c);
  app.sel = { kind: 'item', id: c.id };
  commit();
  emit('sel');
}

export function rotateSel(by) {
  const it = app.sel?.kind === 'item' && find(app.sel);
  if (!it || it.locked) return;
  D.rotateItem(it, it.rot + by, D.riders(it));
  commit();
}

export function nudgeSel(dx, dy) {
  const sel = app.sel, o = find(sel);
  if (!o) return;
  if (sel.kind === 'item' && !o.locked) { D.dragItem(o, o.x + dx, o.y + dy, true, D.riders(o)); }
  else if (sel.kind === 'wall') { o.ax += dx; o.bx += dx; o.ay += dy; o.by += dy; }
  else return;
  commit();
}

export function addOpening(wallId, type) {
  const g = D.structure().geoms.get(wallId);
  if (!g || g.virtual) return;
  const w = Math.min(type === 'window' ? 120 : 90, g.len - 10);
  const base = type === 'window' ? { sill: 85, top: Math.min(235, app.state.wallHeight - 20) } : { sill: 0, top: 210 };
  const o = { id: newId(), wall: wallId, type, pos: g.len / 2, w, ...base };
  if (type === 'door') { o.hinge = 0; o.side = 1; }
  app.state.openings.push(o);
  app.sel = { kind: 'opening', id: o.id };
  commit();
  emit('sel');
}

/** Rum utan egen etikett får en när man börjar ändra namn eller golv. */
export function roomLabel(room) {
  if (room.labelId != null) return app.state.rooms.find((r) => r.id === room.labelId);
  const r = { id: newId(), name: room.name, x: room.label[0], y: room.label[1], floor: room.floor };
  app.state.rooms.push(r);
  if (app.ui.focus === room.id) app.ui.focus = r.id;
  app.sel = { kind: 'room', id: r.id };
  return r;
}

export const fmt = (n, d = 0) => Number(n).toLocaleString('sv-SE', { maximumFractionDigits: d, minimumFractionDigits: d });
export const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
