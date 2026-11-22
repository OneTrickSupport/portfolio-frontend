// Allt som räknas fram ur planen: väggarnas ytor, rum, krockar, avstånd och snäpp mot vägg.

import { app } from './store.js';
import { connectors, def, footprintLocal, shapeOf } from './catalog.js';
import { deg, dist, lerp, clamp, rotPt, rectPoly, polysOverlap, raySeg, segParam, segInter, pointInPoly, polyArea, labelPoint, distToPoly } from './geom.js';

const JOIN = 3; // cm: ändpunkter närmare än så räknas som samma hörn
let cache = { sig: '', data: null };

export function structure() {
  const s = app.state;
  const sig = JSON.stringify([s.walls, s.openings, s.wallHeight, s.rooms]);
  if (sig !== cache.sig) cache = { sig, data: build(s) };
  return cache.data;
}

function build(s) {
  const H = s.wallHeight;
  const geoms = new Map();
  for (const w of s.walls) {
    const a = [w.ax, w.ay], b = [w.bx, w.by];
    const len = Math.max(dist(a, b), 0.001);
    const u = [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
    geoms.set(w.id, { w, a, b, len, u, n: [-u[1], u[0]], virtual: w.kind === 'virtual' || !(w.t > 0), extA: 0, extB: 0, pieces: [], ops: [] });
  }
  const real = [...geoms.values()].filter((g) => !g.virtual);

  // Hur långt en vägg ska förlängas förbi sitt hörn för att fylla ut ytterhörnet.
  const ext = (g, P, dW) => {
    let best = 0;
    for (const o of real) {
      if (o === g) continue;
      for (const [Q, dO] of [[o.a, o.u], [o.b, [-o.u[0], -o.u[1]]]]) {
        if (dist(P, Q) > JOIN) continue;
        const cos = dW[0] * dO[0] + dW[1] * dO[1];
        const sin = Math.abs(dW[0] * dO[1] - dW[1] * dO[0]);
        if (sin < 0.17) continue; // i linje med varandra
        const e = o.w.t / 2 / sin + ((g.w.t / 2) * cos) / sin;
        best = Math.max(best, clamp(e, 0, Math.max(g.w.t, o.w.t)));
      }
    }
    return best;
  };
  const solids = [];
  for (const g of real) {
    g.extA = ext(g, g.a, g.u);
    g.extB = ext(g, g.b, [-g.u[0], -g.u[1]]);
    g.poly = spanPoly(g, -g.extA, g.len + g.extB);
    g.ops = s.openings
      .filter((o) => o.wall === g.w.id)
      .map((o) => ({ o, s0: clamp(o.pos - o.w / 2, 0, g.len), s1: clamp(o.pos + o.w / 2, 0, g.len) }))
      .filter((x) => x.s1 - x.s0 > 1)
      .sort((p, q) => p.s0 - q.s0);
    let cur = -g.extA;
    const add = (s0, s1, y0, y1, op) => {
      const p = { s0, s1, y0, y1, poly: spanPoly(g, s0, s1), wallId: g.w.id, op };
      g.pieces.push(p);
      solids.push(p);
    };
    for (const x of g.ops) {
      if (x.s0 > cur + 0.1) add(cur, x.s0, 0, H);
      const sill = clamp(x.o.sill || 0, 0, H), top = clamp(x.o.top || H, sill, H);
      x.sill = sill; x.top = top;
      x.poly = spanPoly(g, x.s0, x.s1);
      if (sill > 1) add(x.s0, x.s1, 0, sill, x.o);
      if (top < H - 1) add(x.s0, x.s1, top, H, x.o);
      cur = Math.max(cur, x.s1);
    }
    if (g.len + g.extB > cur + 0.1) add(cur, g.len + g.extB, 0, H);
  }

  return { H, geoms, list: [...geoms.values()], real, solids, rooms: detectRooms(s, geoms) };
}

export function spanPoly(g, s0, s1) {
  const h = g.w.t / 2, { a, u, n } = g;
  const p0 = [a[0] + u[0] * s0, a[1] + u[1] * s0], p1 = [a[0] + u[0] * s1, a[1] + u[1] * s1];
  return [[p0[0] + n[0] * h, p0[1] + n[1] * h], [p1[0] + n[0] * h, p1[1] + n[1] * h], [p1[0] - n[0] * h, p1[1] - n[1] * h], [p0[0] - n[0] * h, p0[1] - n[1] * h]];
}

// ---------- Rum: slutna ytor mellan väggarnas mittlinjer ----------
function detectRooms(s, geoms) {
  const EPS = 4;
  const segs = [...geoms.values()].map((g) => ({ g, ts: [0, 1] }));
  for (let i = 0; i < segs.length; i++) {
    for (let j = 0; j < segs.length; j++) {
      if (i === j) continue;
      const A = segs[i].g, B = segs[j].g;
      for (const p of [B.a, B.b]) {
        const r = segParam(p, A.a, A.b);
        if (r.d < EPS && r.t > 0 && r.t < 1) segs[i].ts.push(r.t);
      }
      if (j > i) {
        const x = segInter(A.a, A.b, B.a, B.b);
        if (x && x.t > 1e-6 && x.t < 1 - 1e-6 && x.u > 1e-6 && x.u < 1 - 1e-6) { segs[i].ts.push(x.t); segs[j].ts.push(x.u); }
      }
    }
  }
  const nodes = [];
  const nodeAt = (p) => {
    for (let k = 0; k < nodes.length; k++) if (dist(nodes[k].p, p) < EPS) return k;
    nodes.push({ p, adj: new Set() });
    return nodes.length - 1;
  };
  const edgeWall = new Map();
  const key = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);
  for (const sg of segs) {
    const ts = [...new Set(sg.ts)].sort((x, y) => x - y);
    let prev = null;
    for (const t of ts) {
      const k = nodeAt(lerp(sg.g.a, sg.g.b, t));
      if (prev !== null && prev !== k && !edgeWall.has(key(prev, k))) {
        edgeWall.set(key(prev, k), sg.g);
        nodes[prev].adj.add(k);
        nodes[k].adj.add(prev);
      }
      prev = k;
    }
  }
  // ta bort väggstumpar som inte omsluter något
  let changed = true;
  while (changed) {
    changed = false;
    nodes.forEach((nd, k) => {
      if (nd.adj.size === 1) {
        const o = [...nd.adj][0];
        nd.adj.clear();
        nodes[o].adj.delete(k);
        changed = true;
      }
    });
  }
  const order = nodes.map((nd, k) => [...nd.adj].sort((x, y) => ang(nodes[k].p, nodes[x].p) - ang(nodes[k].p, nodes[y].p)));
  const seen = new Set(), faces = [];
  nodes.forEach((nd, u0) => {
    for (const v0 of order[u0]) {
      if (seen.has(`${u0}>${v0}`)) continue;
      const loop = [];
      let u = u0, v = v0, guard = 0;
      do {
        seen.add(`${u}>${v}`);
        loop.push(u);
        const lst = order[v], i = lst.indexOf(u);
        const nx = lst[(i + 1) % lst.length];
        u = v; v = nx;
      } while (!(u === u0 && v === v0) && ++guard < 5000);
      faces.push(loop);
    }
  });

  const rooms = [];
  const used = new Set();
  for (const loop of faces) {
    const poly = loop.map((k) => nodes[k].p);
    const A = polyArea(poly);
    if (A * FACE_SIGN < 3000) continue; // ytterkonturen har motsatt tecken
    const walls = loop.map((k, i) => edgeWall.get(key(k, loop[(i + 1) % loop.length])));
    let strip = 0;
    poly.forEach((p, i) => { const g = walls[i]; strip += dist(p, poly[(i + 1) % poly.length]) * (g && !g.virtual ? g.w.t / 2 : 0); });
    const lab = s.rooms.find((r) => !used.has(r.id) && pointInPoly([r.x, r.y], poly));
    if (lab) used.add(lab.id);
    const label = labelPoint(poly);
    rooms.push({
      id: lab ? lab.id : `auto:${Math.round(label[0])}:${Math.round(label[1])}`,
      labelId: lab ? lab.id : null,
      name: lab ? lab.name : 'Rum',
      floor: lab ? lab.floor : 'fiskben',
      poly, label,
      area: (Math.abs(A) - strip) / 1e4,
      dims: roomDims(poly, walls),
    });
  }
  return rooms;
}
const ang = (a, b) => Math.atan2(b[1] - a[1], b[0] - a[0]);
const FACE_SIGN = -1; // se test: inre ytor får negativ area med den här genomgången

// Invändiga mått per raksträcka i ett rum (mellan väggarnas insidor).
function roomDims(poly, walls) {
  const n = poly.length;
  const dir = (i) => { const a = poly[i], b = poly[(i + 1) % n], l = dist(a, b) || 1; return [(b[0] - a[0]) / l, (b[1] - a[1]) / l]; };
  const tOf = (i) => { const g = walls[i]; return g && !g.virtual ? g.w.t : 0; };
  const turn = (i) => { const p = dir((i - 1 + n) % n), q = dir(i); return Math.abs(p[0] * q[1] - p[1] * q[0]) > 0.06; };
  let start = 0;
  while (start < n && !turn(start)) start++;
  if (start === n) return [];
  const out = [];
  let i = start, count = 0;
  while (count < n) {
    let j = i, len = 0, t = 0;
    do { len += dist(poly[j % n], poly[(j + 1) % n]); t = Math.max(t, tOf(j % n)); j++; count++; } while (count < n && !turn(j % n));
    const a = poly[i % n], b = poly[j % n], d = dir(i % n);
    const prevI = (i - 1 + n) % n, nextI = j % n;
    const mid = lerp(a, b, 0.5);
    let nrm = [-d[1], d[0]], side = 1;
    if (!pointInPoly([mid[0] + nrm[0] * (t / 2 + 6), mid[1] + nrm[1] * (t / 2 + 6)], poly)) { nrm = [-nrm[0], -nrm[1]]; side = -1; }
    // Hur långt in från hörnet väggytan börjar: där den möter grannväggens yta. Stämmer också för sneda
    // väggar, och blir negativt i ett utåtgående hörn (ytan är då längre än mittlinjen).
    const corner = (k, end) => {
      const q = dir(k), cross = d[0] * q[1] - d[1] * q[0];
      if (Math.abs(cross) <= 0.5) return 0;
      return (end * side * (tOf(k) / 2 - (d[0] * q[0] + d[1] * q[1]) * (t / 2))) / cross;
    };
    const ca = corner(prevI, -1), cb = corner(nextI, 1);
    const inner = len - ca - cb;
    if (inner > 60) {
      const pa = [a[0] + d[0] * ca + nrm[0] * (t / 2), a[1] + d[1] * ca + nrm[1] * (t / 2)];
      const pb = [b[0] - d[0] * cb + nrm[0] * (t / 2), b[1] - d[1] * cb + nrm[1] * (t / 2)];
      // motstående väggar är oftast lika långa: visa måttet en gång per rum
      const twin = out.some((o) => Math.abs(o.len - inner) < 3 && Math.abs(o.d[0] * d[1] - o.d[1] * d[0]) < 0.05);
      if (!twin) out.push({ a: pa, b: pb, n: nrm, len: inner, d });
    }
    i = j;
  }
  return out;
}

// ---------- Möbler ----------
/** Mattor, gardiner och annat som aldrig krockar med något. */
export const isRug = (it) => { const d = def(it); return d.shape === 'rug' || d.shape === 'roundrug' || !!d.ghost; };
export const vrange = (it) => [it.elev || 0, (it.elev || 0) + (it.h || 0)];
const vOverlap = (a, b) => Math.min(a[1], b[1]) - Math.max(a[0], b[0]) > 0.5;
// en stol får stå inskjuten under ett bord
const tucked = (a, b) => (['chair', 'officechair'].includes(shapeOf(a)) && ['table', 'roundtable'].includes(shapeOf(b))) || (a.type === 'barstool' && b.type === 'island');
export const itemPolys = (it) => footprintLocal(it).map((r) => (r.poly
  ? r.poly.map(([x, y]) => { const q = rotPt(x, y, it.rot); return [it.x + q[0], it.y + q[1]]; })
  : rectPoly(it.x, it.y, r.w, r.d, it.rot, r.x, r.y)));

/** Map: möbel-id → vad den krockar med (text). */
export function collisions() {
  const S = structure(), bad = new Map();
  const items = app.state.items.filter((it) => !isRug(it));
  const polys = new Map(items.map((it) => [it.id, itemPolys(it)]));
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i], b = items[j];
      if (a.locked && b.locked) continue;
      if (!vOverlap(vrange(a), vrange(b)) || tucked(a, b) || tucked(b, a)) continue;
      if (polys.get(a.id).some((p) => polys.get(b.id).some((q) => polysOverlap(p, q, 1.5)))) {
        if (!bad.has(a.id)) bad.set(a.id, b.name);
        if (!bad.has(b.id)) bad.set(b.id, a.name);
      }
    }
  }
  for (const it of items) {
    if (it.locked || bad.has(it.id)) continue;
    const vr = vrange(it);
    for (const sol of S.solids) {
      if (!vOverlap(vr, [sol.y0, sol.y1])) continue;
      if (polys.get(it.id).some((p) => polysOverlap(p, sol.poly, 2.5))) { bad.set(it.id, 'en vägg'); break; }
    }
  }
  return bad;
}

function rayPolys(o, d, list) {
  let best = Infinity;
  for (const poly of list) {
    for (let i = 0; i < poly.length; i++) {
      const t = raySeg(o, d, poly[i], poly[(i + 1) % poly.length]);
      if (t !== null && t < best) best = t;
    }
  }
  return best;
}
function wallPolys(vr) {
  return structure().solids.filter((s) => vOverlap(vr, [s.y0, s.y1])).map((s) => s.poly);
}

/** Fritt avstånd från möbelns fyra sidor till närmaste vägg eller möbel. */
export function clearances(it) {
  const vr = vrange(it);
  const obstacles = wallPolys(vr);
  for (const o of app.state.items) {
    if (o.id === it.id || isRug(o) || !vOverlap(vr, vrange(o))) continue;
    obstacles.push(...itemPolys(o));
  }
  const out = [];
  for (const [lx, ly, half] of [[1, 0, it.w / 2], [-1, 0, it.w / 2], [0, 1, it.d / 2], [0, -1, it.d / 2]]) {
    const d = rotPt(lx, ly, it.rot);
    const t = rayPolys([it.x, it.y], d, obstacles) - half;
    if (!isFinite(t) || t < 0.5 || t > 900) continue;
    const from = [it.x + d[0] * half, it.y + d[1] * half];
    out.push({ from, to: [from[0] + d[0] * t, from[1] + d[1] * t], dist: t });
  }
  return out;
}

/** Flytta möbeln de sista centimetrarna så att den står dikt an mot en vägg. */
export function snapItem(it, range = 7) {
  if (isRug(it)) return;
  const walls = wallPolys(vrange(it));
  for (const [lx, ly, half] of [[1, 0, it.w / 2], [-1, 0, it.w / 2], [0, 1, it.d / 2], [0, -1, it.d / 2]]) {
    const d = rotPt(lx, ly, it.rot);
    const gap = rayPolys([it.x, it.y], d, walls) - half;
    if (isFinite(gap) && Math.abs(gap) <= range) { it.x += d[0] * gap; it.y += d[1] * gap; }
  }
}

// ---------- Saker som står på andra möbler eller hänger på väggen ----------
const SURFACES = new Set(['table', 'roundtable', 'drawers', 'doors', 'cabinet', 'counter', 'shelf', 'standdesk', 'piano', 'speaker', 'fridge', 'washer', 'trunk', 'movingbox', 'bench', 'vanity', 'box', 'cylinder', 'radiator', 'pooltable', 'tallcab', 'wardrobe']);
/** Höjden på möbelns ovansida om man kan ställa saker på den, annars null. */
function surfaceTop(o) {
  const d = def(o), e = o.elev || 0;
  if (d.top || d.ceil || d.ghost) return null;
  if (d.shape === 'wallshelf') return e + 2.5;
  if (d.shape === 'vanitytable') return Math.min(76, o.h * 0.6);
  if (d.shape === 'fireplace') return d.kind === 'open' ? o.h : null;
  if (d.shape === 'bench' && d.back) return null;
  return SURFACES.has(d.shape) ? e + o.h : null;
}
const onTopOf = (it, o) => itemPolys(o).some((poly) => pointInPoly([it.x, it.y], poly));
/** Hur högt en bordslampa, vas eller liknande hamnar: ovanpå den högsta möbeln den står över. */
export function restHeight(it) {
  let best = 0;
  for (const o of app.state.items) {
    if (o.id === it.id) continue;
    const t = surfaceTop(o);
    if (t !== null && t > best && t <= 215 && onTopOf(it, o)) best = t;
  }
  return Math.round(best * 10) / 10;
}
/** Småsaker som står på möbeln och ska följa med när den flyttas. */
export function riders(it) {
  const t = surfaceTop(it);
  if (t === null) return [];
  return app.state.items.filter((r) => r.id !== it.id && def(r).top && Math.abs((r.elev || 0) - t) < 3 && onTopOf(r, it));
}
/** Vänd ryggen mot närmaste vägg och ställ möbeln dikt an (tavlor, speglar, väggskåp, gardiner …). */
export function wallSnap(it, range = 45) {
  let best = null;
  for (const g of structure().real) {
    const rx = it.x - g.a[0], ry = it.y - g.a[1];
    const s = rx * g.u[0] + ry * g.u[1], dn = rx * g.n[0] + ry * g.n[1];
    if (s < -g.extA || s > g.len + g.extB) continue;
    const face = Math.abs(dn) - g.w.t / 2;
    if (face > range + it.d / 2 || face < -g.w.t / 2) continue;
    if (!best || face < best.face) best = { g, s, side: dn < 0 ? -1 : 1, face };
  }
  if (!best) return false;
  const { g, s, side } = best, k = side * (g.w.t / 2 + it.d / 2);
  it.x = Math.round((g.a[0] + g.u[0] * s + g.n[0] * k) * 10) / 10;
  it.y = Math.round((g.a[1] + g.u[1] * s + g.n[1] * k) * 10) / 10;
  const r = (Math.atan2(-side * g.n[0], side * g.n[1]) * 180) / Math.PI;
  it.rot = Math.round((((r % 360) + 360) % 360) * 10) / 10;
  return true;
}
// ---------- Soffmoduler: ände mot ände ----------
const toWorld = (o, p) => { const q = rotPt(p[0], p[1], o.rot); return [o.x + q[0], o.y + q[1]]; };
const endMid = (c) => [c.b[0] + (c.f[0] * c.len) / 2, c.b[1] + (c.f[1] * c.len) / 2];
const norm360 = (a) => Math.round(((((a % 360) + 360) % 360)) * 10) / 10;
/** Vrid och flytta modulen `it` så att dess ände `a` sitter mot änden `c` på modulen `o`, rygg mot rygg. */
function attach(it, a, o, c) {
  it.rot = norm360(o.rot + deg(Math.atan2(c.n[1], c.n[0])) + 180 - deg(Math.atan2(a.n[1], a.n[0])));
  const cb = toWorld(o, c.b), q = rotPt(a.b[0], a.b[1], it.rot);
  it.x = Math.round((cb[0] - q[0]) * 10) / 10;
  it.y = Math.round((cb[1] - q[1]) * 10) / 10;
}
/** Sitter det redan en annan modul mot den här änden? */
function endTaken(o, c, ignore) {
  const cb = toWorld(o, c.b);
  return app.state.items.some((x) => x.id !== o.id && x.id !== ignore && def(x).module && connectors(x).some((k) => k.right !== c.right && dist(toWorld(x, k.b), cb) < 4));
}
/** Släppt nära en ledig ände på en annan modul: fäst där och vrid modulen så att den passar (även runt kurvor). */
export function connectorSnap(it, exclude = [], T = 18) {
  const mine = connectors(it);
  if (!mine.length) return false;
  const skip = new Set(exclude.map((o) => o.id));
  let best = null;
  for (const o of app.state.items) {
    if (o.id === it.id || skip.has(o.id) || !def(o).module) continue;
    for (const c of connectors(o)) {
      const cb = toWorld(o, c.b), cm = toWorld(o, endMid(c));
      for (const a of mine) {
        if (a.right === c.right) continue;
        const dd = Math.min(dist(toWorld(it, a.b), cb), dist(toWorld(it, endMid(a)), cm));
        if (dd > T || (best && dd >= best.dd)) continue;
        const rot = o.rot + deg(Math.atan2(c.n[1], c.n[0])) + 180 - deg(Math.atan2(a.n[1], a.n[0]));
        if (Math.abs(((((rot - it.rot) % 360) + 540) % 360) - 180) > 100) continue; // vänd inte modulen bak och fram
        if (endTaken(o, c, it.id)) continue;
        best = { dd, a, o, c };
      }
    }
  }
  if (!best) return false;
  attach(it, best.a, best.o, best.c);
  return true;
}
/** Ny modul från katalogen: sätt den mot en ledig ände på den markerade modulen (helst till höger). */
export function chainTo(it, prev) {
  const pc = connectors(prev), nc = connectors(it);
  for (const right of [true, false]) {
    const c = pc.find((k) => k.right === right && !endTaken(prev, k, it.id)), a = nc.find((k) => k.right !== right);
    if (c && a) { attach(it, a, prev, c); return true; }
  }
  return false;
}

/** Fäst en soffmodul kant i kant mot en annan modul och räta upp den efter grannen. */
export function moduleSnap(it, exclude = [], T = 10) {
  const skip = new Set(exclude.map((o) => o.id));
  let best = null;
  for (const o of app.state.items) {
    if (o.id === it.id || skip.has(o.id) || !def(o).module || def(o).curve) continue;
    const dr = (((it.rot - o.rot) % 90) + 90) % 90;
    if (Math.min(dr, 90 - dr) > 12) continue;
    const quarter = Math.round((it.rot - o.rot) / 90), swap = Math.abs(quarter % 2) === 1;
    const hw = (swap ? it.d : it.w) / 2, hd = (swap ? it.w : it.d) / 2, ow = o.w / 2, od = o.d / 2;
    const [lx, ly] = rotPt(it.x - o.x, it.y - o.y, -o.rot);
    const gx = Math.abs(lx) - (ow + hw), gy = Math.abs(ly) - (od + hd);
    let nx = lx, ny = ly;
    const align = (v, far, own) => { for (const c of [-far + own, far - own, 0]) if (Math.abs(v - c) <= T) return c; return v; };
    if (Math.abs(gx) <= T && gy < -4) { nx = Math.sign(lx) * (ow + hw); ny = align(ly, od, hd); }
    else if (Math.abs(gy) <= T && gx < -4) { ny = Math.sign(ly) * (od + hd); nx = align(lx, ow, hw); }
    else continue;
    const cost = Math.hypot(nx - lx, ny - ly);
    if (!best || cost < best.cost) best = { o, nx, ny, cost, quarter };
  }
  if (!best) return false;
  const q = rotPt(best.nx, best.ny, best.o.rot);
  it.x = Math.round((best.o.x + q[0]) * 10) / 10;
  it.y = Math.round((best.o.y + q[1]) * 10) / 10;
  it.rot = (((best.o.rot + best.quarter * 90) % 360) + 360) % 360;
  return true;
}
/** Alla moduler som sitter ihop med den här (utom den själv): hela den byggda soffan. */
export function sofaGroup(it) {
  if (!def(it).module) return [];
  const mods = app.state.items.filter((o) => def(o).module), polys = new Map(mods.map((o) => [o.id, itemPolys(o)]));
  const seen = new Set([it.id]), queue = [it];
  while (queue.length) {
    const a = queue.pop();
    for (const o of mods) if (!seen.has(o.id) && polys.get(a.id).some((pa) => polys.get(o.id).some((pb) => polysOverlap(pa, pb, -2)))) { seen.add(o.id); queue.push(o); }
  }
  return mods.filter((o) => o.id !== it.id && seen.has(o.id));
}
/** Efter en flytt: fäst mot vägg eller grannmodul och ställ på rätt höjd. `free` (Alt) stänger av fästet. */
export function settle(it, free = false, riding = []) {
  const d = def(it);
  if (!free) { if (d.module && (connectorSnap(it, riding) || (!d.curve && moduleSnap(it, riding)))) { /* sitter mot en annan modul */ } else if (d.wall) wallSnap(it); else snapItem(it); }
  if (d.top) it.elev = restHeight(it);
}
/** Flytta en möbel till (x, y). Sakerna som står på den följer med. */
export function dragItem(it, x, y, free, riding = []) {
  const ox = it.x, oy = it.y;
  it.x = x;
  it.y = y;
  settle(it, free, riding);
  for (const r of riding) { r.x += it.x - ox; r.y += it.y - oy; }
}
/** Rotera en möbel till vinkeln `rot`. Sakerna som står på den vrids med. */
export function rotateItem(it, rot, riding = []) {
  const by = rot - it.rot;
  it.rot = ((rot % 360) + 360) % 360;
  for (const r of riding) {
    const q = rotPt(r.x - it.x, r.y - it.y, by);
    r.x = it.x + q[0];
    r.y = it.y + q[1];
    r.rot = (((r.rot + by) % 360) + 360) % 360;
  }
}

/** Unika vägghörn (för handtagen i väggläget). */
export function joints() {
  const out = [];
  for (const w of app.state.walls) {
    for (const p of [[w.ax, w.ay], [w.bx, w.by]]) if (!out.some((q) => dist(p, q) < JOIN)) out.push(p);
  }
  return out;
}

/** Avstånd soffa–TV och vilken skärmstorlek som passar. */
export function tvCheck(tv) {
  const sofas = app.state.items.filter((i) => ['sofa', 'corner', 'module', 'chaise', 'daybed'].includes(shapeOf(i)));
  if (!sofas.length) return null;
  let best = Infinity;
  for (const s of sofas) best = Math.min(best, Math.hypot(s.x - tv.x, s.y - tv.y));
  return { dist: best, everyday: best / 2.2 / 2.54, cinema: best / 1.6 / 2.54 };
}

export function bounds() {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const w of app.state.walls) {
    x0 = Math.min(x0, w.ax, w.bx); x1 = Math.max(x1, w.ax, w.bx);
    y0 = Math.min(y0, w.ay, w.by); y1 = Math.max(y1, w.ay, w.by);
  }
  if (!isFinite(x0)) return { x0: 0, y0: 0, x1: 1000, y1: 800 };
  return { x0, y0, x1, y1 };
}

export const JOIN_EPS = JOIN;

// ---------- Ett rum i taget ----------
let fcache = { S: null, id: null, data: null };
/**
 * Rummet som visas ensamt, eller null när alla rum visas.
 * walls: vägg-id → { g, s0, s1 (sträckan som vetter mot rummet), c0, c1 (biten som ritas), poly }.
 */
export function focus() {
  const id = app.ui.focus;
  if (id == null) return null;
  const S = structure();
  if (fcache.S !== S || fcache.id !== id) fcache = { S, id, data: buildFocus(S, id) };
  return fcache.data;
}
function buildFocus(S, id) {
  const room = S.rooms.find((r) => r.id === id);
  if (!room) return null;
  const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
  const walls = new Map();
  for (const g of S.real) {
    // vilken del av väggen har rummet på någon sida?
    const off = g.w.t / 2 + 4, n = Math.max(1, Math.ceil(g.len / 4));
    let s0 = Infinity, s1 = -Infinity;
    for (let i = 0; i <= n; i++) {
      const s = (g.len * i) / n, p = [g.a[0] + g.u[0] * s, g.a[1] + g.u[1] * s];
      if (pointInPoly([p[0] + g.n[0] * off, p[1] + g.n[1] * off], room.poly) || pointInPoly([p[0] - g.n[0] * off, p[1] - g.n[1] * off], room.poly)) {
        s0 = Math.min(s0, s);
        s1 = Math.max(s1, s);
      }
    }
    if (s1 - s0 < 12) continue;
    // där väggen fortsätter förbi rummet kapas den i ytterkant av väggen som möter den
    const cut = (s, sign) => {
      if (sign < 0 ? s <= 8 : s >= g.len - 8) return sign < 0 ? -g.extA : g.len + g.extB;
      let best = null;
      for (const o of S.list) {
        if (o === g) continue;
        const den = cross(g.u, o.u);
        if (Math.abs(den) < 0.17) continue;
        const d = [o.a[0] - g.a[0], o.a[1] - g.a[1]];
        const sx = cross(d, o.u) / den, to = cross(d, g.u) / den;
        if (to < -6 || to > o.len + 6 || Math.abs(sx - s) > 10) continue;
        const pad = o.virtual ? 0 : Math.min(o.w.t, o.w.t / 2 / Math.abs(den));
        if (!best || pad > best.pad) best = { sx, pad };
      }
      return best ? best.sx + sign * best.pad : s;
    };
    const c0 = cut(s0, -1), c1 = cut(s1, 1);
    walls.set(g.w.id, { g, s0, s1, c0, c1, poly: spanPoly(g, c0, c1) });
  }
  // rumsavdelare som ligger i rummets kant
  const dividers = new Set(S.list.filter((g) => g.virtual && distToPoly([(g.a[0] + g.b[0]) / 2, (g.a[1] + g.b[1]) / 2], room.poly) < 6).map((g) => g.w.id));
  return { room, walls, dividers };
}
/** Syns möbeln just nu? Alltid när alla rum visas, annars om den står i rummet eller är markerad. */
export function inFocus(it) {
  const f = focus();
  return !f || pointInPoly([it.x, it.y], f.room.poly) || (app.sel?.kind === 'item' && app.sel.id === it.id);
}
/** Ytan som vyn ska rymma: rummet som visas, annars hela lägenheten. */
export function viewBounds() {
  const f = focus();
  if (!f) return bounds();
  const xs = f.room.poly.map((p) => p[0]), ys = f.room.poly.map((p) => p[1]);
  return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
}
