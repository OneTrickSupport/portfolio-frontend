// Flyttar en sparad plan från den gamla, uppskattade geometrin till den uppmätta (se plan.js).
// Väggar, öppningar och fast inredning byts mot de nya. Lösa möbler följer med till samma ställe i
// rummet: möbler som står ihop (soffmoduler, bord med stolar, tv på bänk) flyttas som en grupp så att
// de inte glider in i varandra, och det som hamnar i en vägg skjuts ut tills det står dikt an.
// En plan där någon själv har ritat om väggarna eller skalat om planen lämnas som den är.

import { buildDefaultPlan, fromOld, OLD_IMAGE } from './plan.js';
import { def, footprintLocal } from './catalog.js';
import { polysOverlap, rectPoly, rotPt } from './geom.js';

// Den gamla originalplanens väggar och öppningar som kontrollsummor.
const OLD_WALLS = [28, 2182502.7], OLD_OPENINGS = [11, 52620.6];
const wallSum = (ws) => ws.reduce((a, w, i) => a + (i + 1) * (w.ax + 2 * w.ay + 3 * w.bx + 4 * w.by + 5 * w.t), 0);
const openSum = (os) => os.reduce((a, o, i) => a + (i + 1) * (o.wall + 2 * o.pos + 3 * o.w), 0);
const near = (a, b, tol = 0.5) => Math.abs(a - b) <= tol;

export function isOldGeometry(s) {
  const im = s.image;
  return !!im && near(im.x, OLD_IMAGE.x) && near(im.y, OLD_IMAGE.y) && near(im.w, OLD_IMAGE.w) && near(im.h, OLD_IMAGE.h)
    && s.walls.length === OLD_WALLS[0] && near(wallSum(s.walls), OLD_WALLS[1])
    && s.openings.length === OLD_OPENINGS[0] && near(openSum(s.openings), OLD_OPENINGS[1]);
}

const loose = (it) => { const d = def(it); return d.shape === 'rug' || d.shape === 'roundrug' || !!d.ghost; }; // krockar aldrig
const polysOf = (it) => footprintLocal(it).map((r) => (r.poly
  ? r.poly.map(([x, y]) => { const q = rotPt(x, y, it.rot); return [it.x + q[0], it.y + q[1]]; })
  : rectPoly(it.x, it.y, r.w, r.d, it.rot, r.x, r.y)));

/** Väggarnas fasta delar som rektanglar, plus dörrar och öppningar (fönster räknas som vägg). */
function wallParts(s) {
  const solids = [], gaps = [];
  for (const w of s.walls) {
    if (w.kind === 'virtual' || !(w.t > 0)) continue;
    const len = Math.hypot(w.bx - w.ax, w.by - w.ay);
    if (len < 0.01) continue;
    const u = [(w.bx - w.ax) / len, (w.by - w.ay) / len], h = w.t / 2;
    const span = (s0, s1) => [[s0, h], [s1, h], [s1, -h], [s0, -h]].map(([a, b]) => [w.ax + u[0] * a - u[1] * b, w.ay + u[1] * a + u[0] * b]);
    const ops = s.openings.filter((o) => o.wall === w.id && o.type !== 'window').map((o) => [Math.max(0, o.pos - o.w / 2), Math.min(len, o.pos + o.w / 2)]).sort((a, b) => a[0] - b[0]);
    let cur = 0;
    for (const [s0, s1] of ops) {
      if (s0 > cur + 0.1) solids.push(span(cur, s0));
      gaps.push({ a: [w.ax, w.ay], u, h, s0, s1 });
      cur = Math.max(cur, s1);
    }
    if (len > cur + 0.1) solids.push(span(cur, len));
  }
  return { solids, gaps };
}

/** Kortaste flytten som tar den konvexa polygonen A ur B, eller null om de inte överlappar. */
function pushOut(A, B) {
  let best = null;
  for (const P of [A, B]) {
    for (let i = 0; i < P.length; i++) {
      const p = P[i], q = P[(i + 1) % P.length];
      let nx = q[1] - p[1], ny = p[0] - q[0];
      const l = Math.hypot(nx, ny);
      if (l < 1e-9) continue;
      nx /= l; ny /= l;
      let a0 = Infinity, a1 = -Infinity, b0 = Infinity, b1 = -Infinity;
      for (const v of A) { const k = v[0] * nx + v[1] * ny; if (k < a0) a0 = k; if (k > a1) a1 = k; }
      for (const v of B) { const k = v[0] * nx + v[1] * ny; if (k < b0) b0 = k; if (k > b1) b1 = k; }
      const left = a1 - b0, right = b1 - a0; // flytta A åt minus resp. plus längs normalen
      if (left <= 0 || right <= 0) return null;
      const d = Math.min(left, right);
      if (!best || d < best.d) best = { d, v: left < right ? [-nx * left, -ny * left] : [nx * right, ny * right] };
    }
  }
  return best;
}

const hitsWall = (polys, solids, eps) => polys.some((p) => solids.some((q) => polysOverlap(p, q, eps)));
const shift = (group, dx, dy) => { for (const it of group) { it.x += dx; it.y += dy; } };

export function migratePlan(s) {
  if (!isOldGeometry(s)) return s;
  const fresh = buildDefaultPlan();
  const oldParts = wallParts(s), parts = wallParts(fresh);
  const fixed = new Map(fresh.items.filter((it) => it.locked).map((it) => [it.id, it]));

  const items = [], free = [];
  for (const it of s.items) {
    const f = fixed.get(it.id);
    // orörd fast inredning får de nya måtten; namn, färg, pris och länk behålls
    if (f && it.locked && it.type === f.type) items.push({ ...it, x: f.x, y: f.y, rot: f.rot, w: f.w, d: f.d });
    else { const c = { ...it }; items.push(c); free.push(c); }
  }

  // grupper av möbler som står ihop (närmare än 3 cm)
  const solid = free.filter((it) => !loose(it));
  const polys = new Map(solid.map((it) => [it.id, polysOf(it)]));
  const group = new Map(solid.map((it) => [it.id, it.id]));
  const root = (id) => { while (group.get(id) !== id) id = group.get(id); return id; };
  for (let i = 0; i < solid.length; i++) for (let j = i + 1; j < solid.length; j++) {
    const a = solid[i], b = solid[j];
    if (root(a.id) !== root(b.id) && polys.get(a.id).some((p) => polys.get(b.id).some((q) => polysOverlap(p, q, -3)))) group.set(root(a.id), root(b.id));
  }
  const groups = new Map();
  for (const it of solid) { const r = root(it.id); if (!groups.has(r)) groups.set(r, []); groups.get(r).push(it); }
  for (const it of free) if (loose(it)) groups.set(`loose:${it.id}`, [it]);

  for (const g of groups.values()) {
    const wasInWall = !loose(g[0]) && hitsWall(g.flatMap(polysOf), oldParts.solids, 2.5); // stod redan i en vägg: rör inte
    const cx = g.reduce((a, it) => a + it.x, 0) / g.length, cy = g.reduce((a, it) => a + it.y, 0) / g.length;
    const [nx, ny] = fromOld(cx, cy);
    shift(g, nx - cx, ny - cy);
    if (loose(g[0]) || wasInWall) continue;
    const settle = () => {
      for (let n = 0; n < 12; n++) {
        let worst = null;
        for (const p of g.flatMap(polysOf)) for (const q of parts.solids) { const m = pushOut(p, q); if (m && (!worst || m.d > worst.d)) worst = m; }
        if (!worst || worst.d < 0.05) break;
        shift(g, worst.v[0], worst.v[1]);
      }
    };
    settle();
    // tavlor, speglar och tv på väggen som hamnat över en dörr som har flyttats: skjut dem åt sidan längs väggen
    const it = g[0];
    if (g.length === 1 && Math.min(it.w, it.d) <= 12) {
      for (const gap of parts.gaps) {
        const rel = polysOf(it).flat().map(([x, y]) => [(x - gap.a[0]) * gap.u[0] + (y - gap.a[1]) * gap.u[1], -(x - gap.a[0]) * gap.u[1] + (y - gap.a[1]) * gap.u[0]]);
        if (Math.min(...rel.map((p) => Math.abs(p[1]))) > gap.h + 12) continue; // hänger inte på den här väggen
        const i0 = Math.min(...rel.map((p) => p[0])), i1 = Math.max(...rel.map((p) => p[0]));
        if (Math.min(i1, gap.s1) - Math.max(i0, gap.s0) < 1) continue;
        const d = i1 - gap.s0 < gap.s1 - i0 ? gap.s0 - i1 : gap.s1 - i0;
        shift(g, gap.u[0] * d, gap.u[1] * d);
        settle();
      }
    }
  }
  const r1 = (n) => Math.round(n * 10) / 10;
  for (const it of free) { it.x = r1(it.x); it.y = r1(it.y); }

  const rooms = s.rooms.map((r) => {
    const f = fresh.rooms.find((o) => o.id === r.id);
    const [x, y] = f ? [f.x, f.y] : fromOld(r.x, r.y).map(r1);
    return { ...r, x, y };
  });
  return { ...s, walls: fresh.walls, openings: fresh.openings, rooms, items, image: fresh.image, nextId: Math.max(s.nextId, fresh.nextId) };
}
